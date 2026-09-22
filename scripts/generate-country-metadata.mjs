// One-off data-prep script (NOT part of the Angular app or its build).
//
// Cross-references three datasets by ISO 3166-1 NUMERIC code (the one key all
// three agree on) to produce `src/app/core/data/mock-countries.data.ts`:
//   - world-atlas       -> which countries exist on our map + their names
//   - world-countries   -> iso alpha-2 / alpha-3 codes (100% coverage by numeric code)
//   - country-json      -> population + continent (a few gaps patched below by name)
//
// Run once with: node scripts/generate-country-metadata.mjs
// Re-run only if you want to regenerate the file from scratch.

import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const topology = require('world-atlas/countries-110m.json');
const worldCountries = require('world-countries');
const populationList = require('country-json/src/country-by-population.json');
const continentList = require('country-json/src/country-by-continent.json');

const CONTINENT_CODE = {
  Africa: 'AF',
  Asia: 'AS',
  Europe: 'EU',
  'North America': 'NA',
  'South America': 'SA',
  Oceania: 'OC',
  Antarctica: 'AN',
};

// A handful of countries where country-json's population/continent files use
// a different display name than world-countries. Mapped by hand after
// inspecting the ~10 near-misses left over from a plain name join.
const NAME_OVERRIDES = {
  178: 'Congo', // Republic of the Congo
  180: 'The Democratic Republic of Congo',
  242: 'Fiji Islands',
  792: 'Turkey', // world-countries uses 'Türkiye' as the common name now
  260: 'French Southern territories', // casing differs from world-countries' altSpelling
};

// Not present in country-json at all (Taiwan's disputed status means most
// aggregate country datasets omit it). Approximate 2023 figures, hardcoded.
const POPULATION_OVERRIDES = {
  158: 23_900_000, // Taiwan
};
const CONTINENT_OVERRIDES = {
  158: 'Asia', // Taiwan
};

const populationByName = new Map(populationList.map((p) => [p.country, p.population]));
const continentByName = new Map(continentList.map((c) => [c.country, c.continent]));
const worldCountryByNumeric = new Map(worldCountries.map((c) => [Number(c.ccn3), c]));

const rows = [];
const skipped = [];

for (const geometry of topology.objects.countries.geometries) {
  // A few disputed territories (Northern Cyprus, Somaliland, Kosovo) ship
  // with no numeric id in world-atlas at all -- they have no official ISO
  // 3166-1 code, so we exclude them rather than invent one.
  if (geometry.id == null) {
    skipped.push({ reason: 'no iso numeric id', name: geometry.properties.name });
    continue;
  }

  const isoNumeric = geometry.id; // zero-padded 3-digit string, e.g. "004"
  const numeric = Number(isoNumeric);
  const wc = worldCountryByNumeric.get(numeric);
  if (!wc) {
    skipped.push({ reason: 'no world-countries match', name: geometry.properties.name, isoNumeric });
    continue;
  }

  const nameCandidates = [
    NAME_OVERRIDES[numeric],
    wc.name.common,
    wc.name.official,
    ...(wc.altSpellings ?? []),
  ].filter(Boolean);

  const population =
    POPULATION_OVERRIDES[numeric] ??
    populationByName.get(nameCandidates.find((n) => populationByName.has(n)));
  const continentName =
    CONTINENT_OVERRIDES[numeric] ??
    continentByName.get(nameCandidates.find((n) => continentByName.has(n)));

  if (population == null || continentName == null) {
    skipped.push({ reason: 'no population/continent match', name: geometry.properties.name, isoNumeric });
    continue;
  }

  rows.push({
    isoNumeric,
    iso2: wc.cca2,
    iso3: wc.cca3,
    name: geometry.properties.name,
    continent: CONTINENT_CODE[continentName],
    population,
  });
}

rows.sort((a, b) => a.name.localeCompare(b.name));

console.log(`Generated ${rows.length} countries, skipped ${skipped.length}:`);
console.table(skipped);

const header = `// GENERATED FILE — produced by scripts/generate-country-metadata.mjs, do not hand-edit.
// Population figures are approximate (illustrative for this learning project, not
// a live/authoritative source). Continent uses a 7-bucket scheme:
// AF Africa, AS Asia, EU Europe, NA North America, SA South America, OC Oceania, AN Antarctica.
import { CountryMeta } from '../models/country.model';

export const MOCK_COUNTRIES: CountryMeta[] = [
`;

const body = rows
  .map(
    (r) =>
      `  { isoNumeric: '${r.isoNumeric}', iso2: '${r.iso2}', iso3: '${r.iso3}', name: ${JSON.stringify(r.name)}, continent: '${r.continent}', population: ${r.population} },`,
  )
  .join('\n');

const footer = `\n];\n`;

writeFileSync('src/app/core/data/mock-countries.data.ts', header + body + footer);
console.log('Wrote src/app/core/data/mock-countries.data.ts');
