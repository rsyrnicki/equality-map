import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';
import type { Topology } from 'topojson-specification';
import { buildCountryGeometry } from '../data/countries-geometry.util';
import { MOCK_COUNTRIES } from '../data/mock-countries.data';
import { Country, CountryLocation } from '../models/country.model';
import { DataSnapshot } from '../models/data-snapshot.model';
import { CountryScore, IndicatorDefinition } from '../models/indicator.model';

// world-atlas ships plain JSON with no type declarations of its own; `Topology`
// (from @types/topojson-specification) describes the shape we expect at runtime.
import worldAtlas from 'world-atlas/countries-110m.json';

/** Written by `npm run fetch-data`; served from `public/`, next to index.html. */
const SNAPSHOT_URL = 'data/indicators.json';

const EMPTY_SNAPSHOT: DataSnapshot = { generatedAt: '', indicators: [], scores: [], locations: [] };

/**
 * The single place the rest of the app goes to for countries/indicators/scores.
 *
 * Countries are still built from data bundled into the app, so they're
 * wrapped in `of()`. Indicators and scores come from a JSON file fetched over
 * HTTP — but because every method already returned an Observable, none of the
 * components using this service had to change when that switch happened.
 */
@Injectable({ providedIn: 'root' })
export class CountryDataService {
  private readonly http = inject(HttpClient);

  // Built once, when the app first asks for this service (it's a singleton —
  // see providedIn: 'root' above), not every time getCountries() is called.
  // Turning raw map geometry into SVG paths for ~170 countries is real work,
  // so we only want to do it a single time.
  private readonly countries: Country[] = buildCountryGeometry(worldAtlas as unknown as Topology, MOCK_COUNTRIES);

  // `http.get()` doesn't send anything yet: it returns an Observable that
  // makes the request each time something subscribes. Three methods below
  // read from this one file, so `shareReplay(1)` makes them share a single
  // request and hands its result to anyone who subscribes later, too.
  private readonly snapshot$: Observable<DataSnapshot> = this.http.get<DataSnapshot>(SNAPSHOT_URL).pipe(
    catchError((error: unknown) => {
      // Without this, the error would travel on to every subscriber (and a
      // `toSignal()` reading it would throw). An empty map is a better
      // failure mode than a blank page.
      console.error(`Could not load ${SNAPSHOT_URL}`, error);
      return of(EMPTY_SNAPSHOT);
    }),
    shareReplay(1),
  );

  getCountries(): Observable<Country[]> {
    return of(this.countries);
  }

  getIndicators(): Observable<IndicatorDefinition[]> {
    return this.snapshot$.pipe(map((snapshot) => snapshot.indicators));
  }

  getScores(indicatorId: string): Observable<CountryScore[]> {
    return this.getAllScores().pipe(map((scores) => scores.filter((score) => score.indicatorId === indicatorId)));
  }

  getAllScores(): Observable<CountryScore[]> {
    return this.snapshot$.pipe(map((snapshot) => snapshot.scores));
  }

  /** Where to ask live APIs about each country on the map (see `CountryLocation`). */
  getLocations(): Observable<CountryLocation[]> {
    const onMap = new Set(this.countries.map((country) => country.iso3));
    return this.snapshot$.pipe(map((snapshot) => snapshot.locations.filter((location) => onMap.has(location.iso3))));
  }
}
