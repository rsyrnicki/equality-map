import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Subject, Subscription } from 'rxjs';
import { CountryLocation } from '../models/country.model';
import { CountryScore } from '../models/indicator.model';
import { AirQualityService, LiveState } from './air-quality.service';

const LOCATIONS: CountryLocation[] = [
  { iso3: 'DEU', label: 'Berlin', latitude: 52.52, longitude: 13.41 },
  { iso3: 'IND', label: 'New Delhi', latitude: 28.61, longitude: 77.2 },
];

/** A made-up Open-Meteo response entry: just the fields our code reads. */
function reading(pm2_5: number | null) {
  return { latitude: 0, longitude: 0, current: { time: '2026-09-24T21:00', pm2_5 } };
}

describe('AirQualityService', () => {
  let service: AirQualityService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AirQualityService);
    // Stands in for the network: lets the test see outgoing requests and answer them.
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Fails the test if the code made a request the test didn't expect.
    http.verify();
  });

  describe('fetchCurrent', () => {
    it('asks for every location in a single request', () => {
      service.fetchCurrent(LOCATIONS).subscribe();

      const request = http.expectOne((req) => req.url.includes('open-meteo.com'));
      expect(request.request.params.get('latitude')).toBe('52.52,28.61');
      expect(request.request.params.get('longitude')).toBe('13.41,77.2');
      request.flush([reading(5), reading(30)]);
    });

    it("turns the API's response into our own CountryScore rows", () => {
      let result: { scores: CountryScore[]; measuredAt: Date | null } | undefined;
      service.fetchCurrent(LOCATIONS).subscribe((value) => (result = value));

      http.expectOne(() => true).flush([reading(5.3), reading(28.3)]);

      expect(result?.scores).toEqual([
        {
          countryIso3: 'DEU',
          indicatorId: 'air-quality',
          value: 5.3,
          year: 2026,
          source: expect.any(String),
        },
        {
          countryIso3: 'IND',
          indicatorId: 'air-quality',
          value: 28.3,
          year: 2026,
          source: expect.any(String),
        },
      ]);
      expect(result?.measuredAt?.toISOString()).toBe('2026-09-24T21:00:00.000Z');
    });

    it('skips locations the API has no reading for', () => {
      let countries: string[] = [];
      service
        .fetchCurrent(LOCATIONS)
        .subscribe(({ scores }) => (countries = scores.map((s) => s.countryIso3)));

      http.expectOne(() => true).flush([reading(null), reading(28.3)]);

      expect(countries).toEqual(['IND']);
    });

    it('handles the single-object response Open-Meteo sends for one location', () => {
      let count = 0;
      service
        .fetchCurrent(LOCATIONS.slice(0, 1))
        .subscribe(({ scores }) => (count = scores.length));

      http.expectOne(() => true).flush(reading(5.3));

      expect(count).toBe(1);
    });
  });

  describe('watch', () => {
    let states: LiveState[];
    let subscription: Subscription;
    const refresh$ = new Subject<void>();

    beforeEach(() => {
      // Replaces setTimeout/setInterval (used by rxjs `timer` and `retry`'s
      // delay) with a fake clock the test moves forward by hand.
      vi.useFakeTimers();
      states = [];
      subscription = service.watch(LOCATIONS, refresh$).subscribe((state) => states.push(state));
      vi.advanceTimersByTime(0); // let timer(0, ...) fire its first tick
    });

    afterEach(() => {
      subscription.unsubscribe();
      vi.useRealTimers();
    });

    it('reports loading, then ready', () => {
      expect(states.at(-1)?.status).toBe('loading');

      http.expectOne(() => true).flush([reading(5), reading(30)]);

      expect(states.at(-1)?.status).toBe('ready');
      expect(states.at(-1)?.scores.length).toBe(2);
    });

    it('keeps the previous readings when a refresh fails', () => {
      http.expectOne(() => true).flush([reading(5), reading(30)]);

      refresh$.next();
      // The first attempt and both retries all fail.
      for (let attempt = 0; attempt < 3; attempt++) {
        http
          .expectOne(() => true)
          .flush('down', { status: 503, statusText: 'Service Unavailable' });
        vi.advanceTimersByTime(3000);
      }

      const last = states.at(-1);
      expect(last?.status).toBe('error');
      expect(last?.error).toContain('503');
      expect(last?.scores.length).toBe(2);
    });
  });
});
