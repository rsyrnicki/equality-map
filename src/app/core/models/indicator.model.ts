export interface IndicatorDefinition {
  id: string;
  label: string;
  unit: string;
  category: string;
  /** Whether a higher value represents a better outcome (drives color-scale direction and sort order). */
  higherIsBetter: boolean;
}

export interface CountryScore {
  countryIso3: string;
  indicatorId: string;
  value: number;
  year: number;
  /** Where this number came from, e.g. 'mock' or, for real data, 'World Bank'. */
  source: string;
}
