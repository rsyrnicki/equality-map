// Plain TypeScript, no Angular imports. d3-geo/topojson-client are used purely
// for their geometry MATH (projecting lat/lng onto a 2D plane and turning that
// into an SVG path string) — never to touch the DOM. Angular does all rendering.
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Topology } from 'topojson-specification';
import type { FeatureCollection, Geometry } from 'geojson';
import { Country, CountryMeta } from '../models/country.model';

const PROJECTION_SIZE: [number, number] = [960, 500];

/**
 * Joins world-atlas TopoJSON geometry with our own country metadata (keyed by
 * ISO alpha-3) to produce ready-to-render `Country` objects, each carrying a
 * precomputed SVG path `d` string. Pure function — call it once and cache the
 * result rather than recomputing on every change-detection cycle.
 */
export function buildCountryGeometry(topology: Topology, countryMeta: readonly CountryMeta[]): Country[] {
  const metaByIsoNumeric = new Map(countryMeta.map((c) => [c.isoNumeric, c]));

  const collection = feature(
    topology,
    topology.objects['countries'] as Parameters<typeof feature>[1],
  ) as unknown as FeatureCollection<Geometry, { name: string }>;

  const projection = geoNaturalEarth1().fitSize(PROJECTION_SIZE, collection);
  const pathGenerator = geoPath(projection);

  const countries: Country[] = [];
  for (const geoFeature of collection.features) {
    const isoNumeric = String(geoFeature.id ?? '');
    const meta = metaByIsoNumeric.get(isoNumeric);
    const path = pathGenerator(geoFeature);
    if (!meta || !path) continue; // no ISO metadata, or empty/degenerate geometry
    countries.push({ ...meta, path });
  }
  return countries;
}
