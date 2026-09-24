import { CountryLocation } from './country.model';
import { CountryScore, IndicatorDefinition } from './indicator.model';

/** The shape of `public/data/indicators.json`, written by scripts/fetch-indicator-data.mjs. */
export interface DataSnapshot {
  /** When the script ran, as an ISO 8601 timestamp. */
  generatedAt: string;
  indicators: IndicatorDefinition[];
  scores: CountryScore[];
  locations: CountryLocation[];
}
