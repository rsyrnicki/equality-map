// Build-time data fetch (NOT part of the Angular app itself).
//
// Downloads the slow-changing indicators from public APIs and writes them to
// `public/data/indicators.json`. Angular copies everything in `public/` into
// the build output as-is, so the app can load that file at runtime with a
// plain HttpClient GET — no third-party API is contacted from the browser for
// this data.
//
// These numbers change about once a year, so fetching them on every page view
// would only add slowness and a dependency on three outside services being up.
// The snapshot is committed to git; re-run this script to refresh it:
//
//   npm run fetch-data
//
// Every source below returns a different response shape. Each gets its own
// small "adapter" function that turns that shape into the same `CountryScore`
// rows the app already understands (see src/app/core/models/indicator.model.ts).

import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const OUTPUT_FILE = 'public/data/indicators.json';

// Many countries only report some indicators every few years. We keep each
// country's most recent value, but drop anything older than this, rather than
// comparing (say) a 1995 Gini with a 2023 one.
const MIN_YEAR = 2010;

// world-countries (already a dev dependency) lists every real country's ISO3
// code. The APIs below also return regional aggregates ("World", "Euro area",
// "OWID_AFR"...), and filtering against this list removes them.
const worldCountries = require('world-countries');
const COUNTRY_ISO3 = new Set(worldCountries.map((c) => c.cca3));

/**
 * Everything the app shows about an indicator lives here, so adding a new
 * indicator means adding one entry to this list — no app code changes.
 */
const INDICATORS = [
  {
    id: 'gini',
    label: 'Income inequality (Gini)',
    unit: 'index (0-100)',
    category: 'Economy',
    higherIsBetter: false,
    source: 'World Bank',
    fetch: () => fetchWorldBank('SI.POV.GINI'),
  },
  {
    id: 'education-access',
    label: 'Lower secondary school completion',
    unit: '% of age group',
    category: 'Education',
    higherIsBetter: true,
    source: 'World Bank / UNESCO',
    // A "gross" rate: it counts everyone who finished, including students
    // older than the official age group, so it can go above 100. Capped so a
    // few 130%+ outliers don't stretch the map's color scale.
    fetch: async () => (await fetchWorldBank('SE.SEC.CMPT.LO.ZS')).map((s) => ({ ...s, value: Math.min(s.value, 100) })),
  },
  {
    id: 'healthcare-access',
    label: 'Health service coverage (UHC index)',
    unit: 'index (0-100)',
    category: 'Health',
    higherIsBetter: true,
    source: 'WHO',
    fetch: () => fetchWhoGho('UHC_INDEX_REPORTED'),
  },
  {
    id: 'undernourishment',
    label: 'Undernourishment',
    unit: '% of population',
    category: 'Basic needs',
    higherIsBetter: false,
    source: 'World Bank / FAO',
    fetch: () => fetchWorldBank('SN.ITK.DEFC.ZS'),
  },
  {
    id: 'water-access',
    label: 'Access to basic drinking water',
    unit: '% of population',
    category: 'Basic needs',
    higherIsBetter: true,
    source: 'World Bank / WHO-UNICEF JMP',
    fetch: () => fetchWorldBank('SH.H2O.BASW.ZS'),
  },
  {
    id: 'lgbtq-rights',
    label: 'LGBTQ+ legal equality',
    unit: 'index (0-100)',
    category: 'Rights',
    higherIsBetter: true,
    source: 'Equaldex via Our World in Data',
    fetch: () => fetchOwidCsv('lgbt-legal-equality-index', 'ei_legal'),
  },
];

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
  return response.json();
}

// --- Adapters: one per API, each returning CountryScore-shaped rows ---------

/** World Bank Indicators API: `[paginationInfo, rows[]]`. `mrnev=1` = most recent non-empty value per country. */
async function fetchWorldBank(indicatorCode) {
  const url = `https://api.worldbank.org/v2/country/all/indicator/${indicatorCode}?format=json&mrnev=1&per_page=1000`;
  const [, rows] = await getJson(url);
  return rows
    .filter((row) => row.value != null)
    .map((row) => ({ countryIso3: row.countryiso3code, value: row.value, year: Number(row.date) }));
}

/** WHO Global Health Observatory (an OData API): `{ value: rows[] }`, one row per country per year. */
async function fetchWhoGho(indicatorCode) {
  const url = `https://ghoapi.azureedge.net/api/${indicatorCode}?$filter=SpatialDimType eq 'COUNTRY'`;
  const { value: rows } = await getJson(encodeURI(url));
  const latestByCountry = new Map();
  for (const row of rows) {
    if (row.NumericValue == null) continue;
    const previous = latestByCountry.get(row.SpatialDim);
    if (!previous || row.TimeDim > previous.year) {
      latestByCountry.set(row.SpatialDim, { countryIso3: row.SpatialDim, value: row.NumericValue, year: row.TimeDim });
    }
  }
  return [...latestByCountry.values()];
}

/** Our World in Data chart download: CSV with `entity,code,year,<column>` rows. */
async function fetchOwidCsv(chartSlug, column) {
  const url = `https://ourworldindata.org/grapher/${chartSlug}.csv?v=1&csvType=full&useColumnShortNames=true`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
  const [header, ...lines] = (await response.text()).trim().split('\n');
  // Country names can contain commas (and are then quoted), so read the
  // columns we need from the END of each line, where there are no quotes.
  const columns = header.split(',');
  const fromEnd = (name) => columns.length - columns.indexOf(name);
  const latestByCountry = new Map();
  for (const line of lines) {
    const cells = line.split(',');
    const cell = (name) => cells[cells.length - fromEnd(name)];
    const row = { countryIso3: cell('code'), value: Number(cell(column)), year: Number(cell('year')) };
    const previous = latestByCountry.get(row.countryIso3);
    if (cell(column) !== '' && (!previous || row.year > previous.year)) latestByCountry.set(row.countryIso3, row);
  }
  return [...latestByCountry.values()];
}

/**
 * One point per country where the app's LIVE air-quality indicator asks for a
 * reading: the capital city (from the World Bank's country list), or — for the
 * few countries it has no capital for, such as Taiwan (not a World Bank member)
 * or countries whose capital is disputed — the country's geographic centre.
 */
async function fetchLocations() {
  const [, rows] = await getJson('https://api.worldbank.org/v2/country?format=json&per_page=1000');
  const capitalByIso3 = new Map(
    rows
      .filter((row) => row.capitalCity && row.latitude && row.longitude)
      .map((row) => [row.id, { label: row.capitalCity, latitude: Number(row.latitude), longitude: Number(row.longitude) }]),
  );
  return worldCountries.map((country) => ({
    iso3: country.cca3,
    ...(capitalByIso3.get(country.cca3) ?? {
      label: 'geographic centre',
      latitude: country.latlng[0],
      longitude: country.latlng[1],
    }),
  }));
}

// --- Main ------------------------------------------------------------------

const round = (value) => Math.round(value * 10) / 10;

const scores = [];
for (const { fetch: fetchScores, ...definition } of INDICATORS) {
  const rows = (await fetchScores()).filter((row) => COUNTRY_ISO3.has(row.countryIso3) && row.year >= MIN_YEAR);
  const years = rows.map((row) => row.year);
  console.log(
    `${definition.id.padEnd(18)} ${String(rows.length).padStart(3)} countries, years ${Math.min(...years)}–${Math.max(...years)}`,
  );
  for (const row of rows) {
    scores.push({ ...row, value: round(row.value), indicatorId: definition.id, source: definition.source });
  }
}

const locations = (await fetchLocations()).sort((a, b) => a.iso3.localeCompare(b.iso3));
console.log(`locations          ${locations.length} countries`);

const snapshot = {
  generatedAt: new Date().toISOString(),
  indicators: INDICATORS.map(({ fetch, ...definition }) => ({ ...definition, freshness: 'snapshot' })),
  scores,
  locations,
};

mkdirSync('public/data', { recursive: true });
writeFileSync(OUTPUT_FILE, JSON.stringify(snapshot));
console.log(`Wrote ${OUTPUT_FILE}`);
