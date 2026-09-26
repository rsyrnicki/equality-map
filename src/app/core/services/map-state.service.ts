import { Injectable, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { scaleLinear } from 'd3-scale';
import { EMPTY, Subject, switchMap } from 'rxjs';
import { ContinentCode } from '../models/continent.model';
import { Country } from '../models/country.model';
import { AIR_QUALITY_INDICATOR, AirQualityService, INITIAL_LIVE_STATE } from './air-quality.service';
import { CountryDataService } from './country-data.service';

export interface TopNFilter {
  direction: 'top' | 'bottom';
  n: number;
}

const NO_DATA_COLOR = '#e0e0e0';
// The two ends of our color scale: red for "bad", green for "good".
const LOW_RGB: [number, number, number] = [211, 47, 47];
const HIGH_RGB: [number, number, number] = [46, 125, 50];

// Turns a number from 0 (bad) to 1 (good) into a color between red and green,
// by blending the two RGB values above in that proportion.
function interpolateColor(t: number): string {
  const r = Math.round(LOW_RGB[0] + (HIGH_RGB[0] - LOW_RGB[0]) * t);
  const g = Math.round(LOW_RGB[1] + (HIGH_RGB[1] - LOW_RGB[1]) * t);
  const b = Math.round(LOW_RGB[2] + (HIGH_RGB[2] - LOW_RGB[2]) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Holds all the state the map page needs to share between components: which
 * countries are selected, which indicator is active, which filters are on,
 * and everything calculated from those (colors, rankings, totals).
 *
 * `signal()` below holds one piece of state that can change over time.
 * `computed()` calculates a new value from other signals, and updates itself
 * automatically whenever one of those signals changes — like a spreadsheet
 * formula that recalculates when a cell it depends on changes.
 */
@Injectable({ providedIn: 'root' })
export class MapStateService {
  private readonly countryData = inject(CountryDataService);
  private readonly airQuality = inject(AirQualityService);

  // Bridge the service's Observables into signals once, at construction.
  // Until the snapshot file has loaded, these hold their `initialValue`.
  readonly countries = toSignal(this.countryData.getCountries(), { initialValue: [] as Country[] });
  private readonly snapshotIndicators = toSignal(this.countryData.getIndicators(), { initialValue: [] });
  private readonly snapshotScores = toSignal(this.countryData.getAllScores(), { initialValue: [] });

  // --- Writable state ---
  readonly selectedIso3s = signal<ReadonlySet<string>>(new Set());
  readonly activeIndicatorId = signal<string>('gini');
  readonly continentFilter = signal<ContinentCode | 'ALL'>('ALL');
  readonly topNFilter = signal<TopNFilter | null>(null);

  // --- Live data ---
  /** Emits whenever the user asks for fresh live data (see `refreshLive()`). */
  private readonly liveRefresh$ = new Subject<void>();

  /**
   * The live air-quality data, fetched only while that indicator is selected.
   *
   * `toObservable()` is `toSignal()` in reverse: it turns a signal into an
   * Observable that emits each time the signal changes. `switchMap` then swaps
   * in a different inner Observable for every indicator id: the live data
   * stream for the air-quality indicator, and `EMPTY` (an Observable that
   * never emits anything) for all others. Switching away unsubscribes from
   * the live stream, which stops its timer and cancels any request in flight.
   */
  readonly liveState = toSignal(
    toObservable(this.activeIndicatorId).pipe(
      switchMap((indicatorId) =>
        indicatorId === AIR_QUALITY_INDICATOR.id
          ? this.countryData
              .getLocations()
              .pipe(switchMap((locations) => this.airQuality.watch(locations, this.liveRefresh$)))
          : EMPTY,
      ),
    ),
    { initialValue: INITIAL_LIVE_STATE },
  );

  // --- Derived state ---
  readonly indicators = computed(() => [...this.snapshotIndicators(), AIR_QUALITY_INDICATOR]);
  private readonly allScores = computed(() => [...this.snapshotScores(), ...this.liveState().scores]);

  readonly activeIndicator = computed(() => this.indicators().find((i) => i.id === this.activeIndicatorId()));

  /** Value of the active indicator per country, recomputed only when the indicator or data changes. */
  readonly scoreByIso3 = computed<ReadonlyMap<string, number>>(() => {
    console.log('recomputing  scoreByIso3')
    const indicatorId = this.activeIndicatorId();
    const map = new Map<string, number>();
    for (const score of this.allScores()) {
      if (score.indicatorId === indicatorId) map.set(score.countryIso3, score.value);
    }
    return map;
  });

  /** Oldest and newest year among the active indicator's scores: not every country reports every year. */
  readonly activeYearRange = computed<[number, number] | null>(() => {
    const indicatorId = this.activeIndicatorId();
    const years = this.allScores()
      .filter((score) => score.indicatorId === indicatorId)
      .map((score) => score.year);
    return years.length ? [Math.min(...years), Math.max(...years)] : null;
  });

  private readonly scoreRange = computed<[number, number] | null>(() => {
    const values = [...this.scoreByIso3().values()];
    return values.length ? [Math.min(...values), Math.max(...values)] : null;
  });

  /** Choropleth color per country for the active indicator; countries with no score are omitted. */
  readonly colorByIso3 = computed<ReadonlyMap<string, string>>(() => {
    const range = this.activeIndicator()?.colorScaleDomain ?? this.scoreRange();
    const result = new Map<string, string>();
    if (!range) return result;
    const [min, max] = range;
    const higherIsBetter = this.activeIndicator()?.higherIsBetter ?? true;
    const normalize = scaleLinear().domain([min, max]).range([0, 1]).clamp(true);
    for (const [iso3, value] of this.scoreByIso3()) {
      const t = normalize(value);
      result.set(iso3, interpolateColor(higherIsBetter ? t : 1 - t));
    }
    return result;
  });

  /** Countries matching the continent + top-N filters (both default to "no filter"). */
  readonly filteredCountries = computed(() => {
    const continent = this.continentFilter();
    const byContinent =
      continent === 'ALL' ? this.countries() : this.countries().filter((c) => c.continent === continent);

    const topN = this.topNFilter();
    if (!topN) return byContinent;

    const scores = this.scoreByIso3();
    return [...byContinent]
      .filter((c) => scores.has(c.iso3))
      .sort((a, b) => {
        const diff = scores.get(a.iso3)! - scores.get(b.iso3)!;
        return topN.direction === 'top' ? -diff : diff;
      })
      .slice(0, topN.n);
  });

  /** Filtered countries that have a score for the active indicator, sorted best-to-worst. */
  readonly rankedCountries = computed(() => {
    const scores = this.scoreByIso3();
    const higherIsBetter = this.activeIndicator()?.higherIsBetter ?? true;
    return [...this.filteredCountries()]
      .filter((c) => scores.has(c.iso3))
      .sort((a, b) => {
        const diff = scores.get(a.iso3)! - scores.get(b.iso3)!;
        return higherIsBetter ? -diff : diff;
      });
  });

  readonly selectedCountries = computed(() =>
    this.filteredCountries().filter((c) => this.selectedIso3s().has(c.iso3)),
  );

  /** Selected countries in ranked order, each annotated with its rank among all ranked countries. */
  readonly rankedSelection = computed(() => {
    const ranked = this.rankedCountries();
    const scores = this.scoreByIso3();
    const selected = this.selectedIso3s();
    return ranked
      .map((country, index) => ({ country, rank: index + 1, score: scores.get(country.iso3) }))
      .filter((entry) => selected.has(entry.country.iso3));
  });

  readonly totalSelectedPopulation = computed(() =>
    this.selectedCountries().reduce((sum, c) => sum + c.population, 0),
  );

  readonly selectionScoreStats = computed(() => {
    const scores = this.scoreByIso3();
    const values = this.selectedCountries()
      .map((c) => scores.get(c.iso3))
      .filter((v): v is number => v != null);
    if (values.length === 0) return null;
    return {
      average: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
    };
  });

  colorFor(iso3: string): string {
    return this.colorByIso3().get(iso3) ?? NO_DATA_COLOR;
  }

  isSelected(iso3: string): boolean {
    return this.selectedIso3s().has(iso3);
  }

  toggleCountry(iso3: string): void {
    const next = new Set(this.selectedIso3s());
    if (next.has(iso3)) next.delete(iso3);
    else next.add(iso3);
    this.selectedIso3s.set(next);
  }

  setActiveIndicator(id: string): void {
    this.activeIndicatorId.set(id);
  }

  setContinentFilter(continent: ContinentCode | 'ALL'): void {
    this.continentFilter.set(continent);
  }

  setTopNFilter(filter: TopNFilter | null): void {
    this.topNFilter.set(filter);
  }

  refreshLive(): void {
    this.liveRefresh$.next();
  }
}
