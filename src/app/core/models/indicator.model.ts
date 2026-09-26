export interface IndicatorDefinition {
  id: string;
  label: string;
  unit: string;
  category: string;
  /** Whether a higher value represents a better outcome (drives color-scale direction and sort order). */
  higherIsBetter: boolean;
  /** Who publishes the underlying numbers, shown to the user as attribution. */
  source: string;
  /**
   * How the app gets this indicator's data:
   * - 'snapshot': fetched once at build time into `public/data/indicators.json`
   *   (see scripts/fetch-indicator-data.mjs) and loaded from our own server.
   * - 'live': fetched straight from a third-party API in the browser, and
   *   refreshed while the app is open.
   */
  freshness: 'snapshot' | 'live';
  /**
   * Fixed [min, max] values for the map's color scale. When left
   * out, the scale stretches from the lowest to the highest value in the data
   * — which works badly when one extreme outlier squashes everyone else into
   * the same color.
   */
  colorScaleDomain?: [number, number];
}

export interface CountryScore {
  countryIso3: string;
  indicatorId: string;
  value: number;
  /** The year the value describes (for live data: the year it was measured). */
  year: number;
  /** Where this number came from, e.g. 'World Bank'. */
  source: string;
}
