import type { Topology } from 'topojson-specification';
import worldAtlas from 'world-atlas/countries-110m.json';
import { buildCountryGeometry } from './countries-geometry.util';
import { MOCK_COUNTRIES } from './mock-countries.data';

describe('buildCountryGeometry', () => {
  const countries = buildCountryGeometry(worldAtlas as unknown as Topology, MOCK_COUNTRIES);

  it('joins every world-atlas country that has ISO metadata', () => {
    // 174 of world-atlas's 177 geometries have a standard ISO numeric id;
    // the rest (disputed territories) are intentionally excluded.
    expect(countries.length).toBe(174);
  });

  it('produces a non-empty SVG path for a known country', () => {
    const usa = countries.find((c) => c.iso3 === 'USA');
    expect(usa).toBeTruthy();
    expect(usa?.isoNumeric).toBe('840');
    expect(usa?.path.length).toBeGreaterThan(0);
    expect(usa?.path.startsWith('M')).toBe(true);
  });
});
