import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import type { Topology } from 'topojson-specification';
import { buildCountryGeometry } from '../data/countries-geometry.util';
import { MOCK_COUNTRIES } from '../data/mock-countries.data';
import { INDICATORS, SCORES } from '../data/mock-scores.data';
import { Country } from '../models/country.model';
import { CountryScore, IndicatorDefinition } from '../models/indicator.model';

// world-atlas ships plain JSON with no type declarations of its own; `Topology`
// (from @types/topojson-specification) describes the shape we expect at runtime.
import worldAtlas from 'world-atlas/countries-110m.json';

/**
 * The app's single data-access point for countries/indicators/scores.
 *
 * Every method returns an Observable, and today they're all backed by `of()`
 * over static mock data. Later (Milestone H) the *implementations* swap to
 * `HttpClient` calls against a real API — callers won't need to change,
 * because the return types don't change.
 */
@Injectable({ providedIn: 'root' })
export class CountryDataService {
  // Computed once when the service is constructed (a singleton, since it's
  // providedIn: 'root') rather than recomputed on every call or every change
  // detection cycle — geometry projection is relatively expensive pure math.
  private readonly countries: Country[] = buildCountryGeometry(worldAtlas as unknown as Topology, MOCK_COUNTRIES);

  getCountries(): Observable<Country[]> {
    return of(this.countries);
  }

  getIndicators(): Observable<IndicatorDefinition[]> {
    return of(INDICATORS);
  }

  getScores(indicatorId: string): Observable<CountryScore[]> {
    return of(SCORES.filter((score) => score.indicatorId === indicatorId));
  }

  getAllScores(): Observable<CountryScore[]> {
    return of(SCORES);
  }
}
