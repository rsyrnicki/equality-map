// Made-up but realistic-looking numbers, typed in by hand for this learning
// project. They're rough estimates, not real statistics — good enough to make
// the map, filters, and rankings work while we're still building the app.
// A later version of this app could replace this file with real numbers
// fetched from a public API, without changing how the rest of the app uses it.
import { CountryScore, IndicatorDefinition } from '../models/indicator.model';

export const INDICATORS: IndicatorDefinition[] = [
  { id: 'gini', label: 'Income inequality (Gini)', unit: '%', category: 'Economy', higherIsBetter: false },
  { id: 'education-access', label: 'Access to education', unit: '%', category: 'Education', higherIsBetter: true },
  { id: 'healthcare-access', label: 'Access to healthcare', unit: 'index (0-100)', category: 'Health', higherIsBetter: true },
  { id: 'food-security', label: 'Food security', unit: 'index (0-100)', category: 'Basic needs', higherIsBetter: true },
  { id: 'water-access', label: 'Access to clean water', unit: '%', category: 'Basic needs', higherIsBetter: true },
  { id: 'lgbtq-rights', label: 'LGBTQ+ rights', unit: 'index (0-100)', category: 'Rights', higherIsBetter: true },
];

/** iso3 -> [gini, education-access, healthcare-access, food-security, water-access, lgbtq-rights] */
const SCORE_TABLE: Record<string, [number, number, number, number, number, number]> = {
  // Africa
  ZAF: [63, 68, 62, 55, 78, 55],
  NGA: [35, 45, 42, 40, 68, 5],
  KEN: [40, 60, 55, 50, 63, 10],
  EGY: [31, 62, 68, 65, 98, 8],
  ETH: [35, 40, 45, 35, 55, 5],
  MAR: [39, 58, 70, 68, 92, 10],
  // Asia
  CHN: [38, 82, 80, 88, 96, 25],
  IND: [35, 65, 60, 58, 90, 35],
  JPN: [33, 94, 95, 92, 99, 40],
  KOR: [31, 92, 90, 88, 99, 30],
  IDN: [38, 70, 65, 65, 90, 15],
  SAU: [45, 75, 78, 82, 97, 2],
  ISR: [39, 88, 90, 90, 99, 68],
  // Europe
  NOR: [27, 96, 96, 95, 100, 92],
  DEU: [32, 93, 92, 93, 100, 85],
  FRA: [32, 90, 91, 92, 100, 82],
  GBR: [35, 90, 88, 91, 100, 80],
  SWE: [28, 95, 94, 94, 100, 94],
  POL: [30, 88, 78, 88, 99, 25],
  ESP: [34, 87, 90, 90, 100, 90],
  ITA: [35, 85, 88, 90, 99, 60],
  // North America
  USA: [41, 89, 82, 88, 99, 65],
  CAN: [33, 92, 88, 92, 100, 90],
  MEX: [45, 68, 65, 68, 96, 45],
  CUB: [38, 85, 80, 62, 89, 55],
  CRI: [48, 78, 82, 78, 98, 60],
  // South America
  BRA: [53, 72, 68, 70, 87, 50],
  ARG: [42, 82, 78, 82, 92, 78],
  CHL: [44, 80, 80, 85, 95, 70],
  COL: [51, 68, 70, 65, 88, 55],
  PER: [43, 65, 62, 60, 82, 30],
  // Oceania
  AUS: [34, 91, 90, 92, 100, 88],
  NZL: [36, 90, 89, 91, 100, 90],
  PNG: [42, 45, 40, 35, 45, 5],
};

const YEAR = 2023;
const SOURCE = 'mock';

export const SCORES: CountryScore[] = Object.entries(SCORE_TABLE).flatMap(([countryIso3, values]) =>
  INDICATORS.map((indicator, i) => ({
    countryIso3,
    indicatorId: indicator.id,
    value: values[i],
    year: YEAR,
    source: SOURCE,
  })),
);
