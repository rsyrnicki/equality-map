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
 * The single place the rest of the app goes to for countries/indicators/scores.
 *
 * Every method returns an Observable, currently filled with static mock data
 * via `of()`. If this were switched to real data from the internet, only the
 * *inside* of these methods would change (`of(...)` becomes `this.http.get(...)`)
 * — every component using this service would keep working exactly as it does now.
 */
@Injectable({ providedIn: 'root' })
export class CountryDataService {
  // Built once, when the app first asks for this service (it's a singleton —
  // see providedIn: 'root' above), not every time getCountries() is called.
  // Turning raw map geometry into SVG paths for ~170 countries is real work,
  // so we only want to do it a single time.
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
