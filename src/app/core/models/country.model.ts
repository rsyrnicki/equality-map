import { ContinentCode } from './continent.model';

/** Static metadata we know about a country before it's joined with map geometry. */
export interface CountryMeta {
  /** ISO 3166-1 numeric code, zero-padded to 3 digits (e.g. '840'). Matches world-atlas ids. */
  isoNumeric: string;
  /** ISO 3166-1 alpha-2 code (e.g. 'US'). */
  iso2: string;
  /** ISO 3166-1 alpha-3 code (e.g. 'USA'). Our primary join key for score data. */
  iso3: string;
  name: string;
  continent: ContinentCode;
  population: number;
}

/** A country ready to render: metadata plus its precomputed SVG path. */
export interface Country extends CountryMeta {
  /** Precomputed `d` attribute for an SVG `<path>`, in map projection coordinates. */
  path: string;
}

/** The point on the globe we ask a live API about for a whole country (usually its capital). */
export interface CountryLocation {
  iso3: string;
  /** The capital's name, or 'geographic centre' when there's no single agreed capital to use. */
  label: string;
  latitude: number;
  longitude: number;
}
