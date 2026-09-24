import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  Observable,
  catchError,
  map,
  merge,
  of,
  retry,
  scan,
  startWith,
  switchMap,
  timer,
} from 'rxjs';
import { CountryLocation } from '../models/country.model';
import { CountryScore, IndicatorDefinition } from '../models/indicator.model';

export const AIR_QUALITY_INDICATOR: IndicatorDefinition = {
  id: 'air-quality',
  label: 'Air pollution right now (PM2.5)',
  unit: 'µg/m³',
  category: 'Environment',
  higherIsBetter: false,
  source: 'Open-Meteo / Copernicus CAMS',
  freshness: 'live',
  // Readings swing from ~0 to 150+ (desert dust, wildfire smoke). Anchoring
  // the scale instead: 0 is clean air, and 75 µg/m³ is five times the WHO's
  // 24-hour guideline of 15 — everything above that gets the "worst" color.
  colorScaleDomain: [0, 75],
};

const API_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

// Open-Meteo recalculates its air-quality readings once an hour, so asking
// much more often would just return the same numbers. It's also free with a
// daily request limit, and each location in a request counts toward it.
const REFRESH_INTERVAL_MS = 30 * 60 * 1000;

/**
 * The part of Open-Meteo's response we use, for one location. The real
 * response has more fields; TypeScript only knows about the ones listed here.
 * Note that `http.get<T>()` doesn't check the response against this — it's a
 * promise *we* make about what the API sends back.
 */
interface OpenMeteoLocation {
  latitude: number;
  longitude: number;
  current: {
    /** e.g. '2026-09-24T21:00', in the timezone we asked for (GMT). */
    time: string;
    /** Fine particulate matter, in µg/m³. `null` if the model has no value there. */
    pm2_5: number | null;
  };
}

/** Everything the UI needs to show about the live data at a given moment. */
export interface LiveState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  /** The most recent successful readings. Kept while refreshing, and after a failed refresh. */
  scores: CountryScore[];
  /** When the readings in `scores` were measured, according to the API. */
  measuredAt: Date | null;
  /** When we last successfully fetched them. */
  fetchedAt: Date | null;
  error: string | null;
}

export const INITIAL_LIVE_STATE: LiveState = {
  status: 'idle',
  scores: [],
  measuredAt: null,
  fetchedAt: null,
  error: null,
};

/**
 * Fetches current air-pollution readings for every country, straight from
 * Open-Meteo's public API. Unlike CountryDataService's build-time snapshot,
 * this data changes by the hour, so it's fetched in the browser while the
 * app is open.
 */
@Injectable({ providedIn: 'root' })
export class AirQualityService {
  private readonly http = inject(HttpClient);

  /** One request for current PM2.5 at every location, turned into our own `CountryScore` rows. */
  fetchCurrent(
    locations: CountryLocation[],
  ): Observable<{ scores: CountryScore[]; measuredAt: Date | null }> {
    // HttpParams builds the `?latitude=...&longitude=...` query string for us,
    // taking care of URL-encoding. Open-Meteo accepts many locations at once as
    // comma-separated lists, so the whole map is one request instead of ~170.
    const params = new HttpParams()
      .set('latitude', locations.map((location) => location.latitude).join(','))
      .set('longitude', locations.map((location) => location.longitude).join(','))
      .set('current', 'pm2_5')
      .set('timezone', 'GMT');

    return this.http.get<OpenMeteoLocation | OpenMeteoLocation[]>(API_URL, { params }).pipe(
      // An adapter: the API's response shape goes in, the app's own shape
      // comes out. Nothing outside this method ever sees `OpenMeteoLocation`,
      // so if the API changes, this is the only code that has to follow.
      map((response) => {
        // Open-Meteo returns a single object (not a one-item array) when asked about one location.
        const results = Array.isArray(response) ? response : [response];
        // Results come back in the same order as the locations we sent.
        const scores = results.flatMap((result, i): CountryScore[] =>
          result.current.pm2_5 == null
            ? []
            : [
                {
                  countryIso3: locations[i].iso3,
                  indicatorId: AIR_QUALITY_INDICATOR.id,
                  value: result.current.pm2_5,
                  year: Number(result.current.time.slice(0, 4)),
                  source: AIR_QUALITY_INDICATOR.source,
                },
              ],
        );
        const time = results[0]?.current.time;
        return { scores, measuredAt: time ? new Date(`${time}Z`) : null };
      }),
    );
  }

  /**
   * Fetches readings now, then again every REFRESH_INTERVAL_MS, and whenever
   * `refresh$` emits. Emits a new `LiveState` every time anything changes.
   * Stops (and cancels any request in flight) when unsubscribed.
   */
  watch(locations: CountryLocation[], refresh$: Observable<void>): Observable<LiveState> {
    return merge(timer(0, REFRESH_INTERVAL_MS), refresh$).pipe(
      // For every tick, start a request. If a new tick arrives while the
      // previous request is still running, `switchMap` cancels that one.
      switchMap(() =>
        this.fetchCurrent(locations).pipe(
          map(({ scores, measuredAt }): Partial<LiveState> => ({
            status: 'ready',
            scores,
            measuredAt,
            fetchedAt: new Date(),
            error: null,
          })),
          // Networks fail now and then; try twice more, 3 seconds apart, before giving up.
          retry({ count: 2, delay: 3000 }),
          // If it still fails, turn the error into a normal value. An error that
          // escapes would end the whole Observable — and with it, all future refreshes.
          catchError((error: unknown) =>
            of<Partial<LiveState>>({ status: 'error', error: describeError(error) }),
          ),
          // Emitted immediately, before the response arrives.
          startWith<Partial<LiveState>>({ status: 'loading' }),
        ),
      ),
      // Each step above only says what changed ("now loading", "here's an
      // error"). `scan` merges every change into the previous state, like
      // `reduce` on an array — which is how old scores survive a failed refresh.
      scan((state, change) => ({ ...state, ...change }), INITIAL_LIVE_STATE),
    );
  }
}

function describeError(error: unknown): string {
  if (!(error instanceof HttpErrorResponse))
    return 'Unexpected response from the air-quality service';
  // Status 0 means no response arrived at all: offline, DNS failure, blocked by the browser (CORS)...
  if (error.status === 0) return 'Could not reach the air-quality service';
  if (error.status === 429) return 'Too many requests to the air-quality service; try again later';
  return `The air-quality service responded with an error (${error.status})`;
}
