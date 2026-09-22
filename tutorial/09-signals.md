# Lesson 9: Signals — Angular's reactive state

This is probably the single most important concept in the whole app, so
we'll go slowly.

## The problem: keeping the page in sync with data

Say the user picks a different indicator from the dropdown. A lot of things
need to update because of that one change: the color of every country on the
map, the ranked list in the sidebar, the average/min/max stats — all of it,
automatically, without us writing code that manually finds and updates each
one. This is the general problem **signals** solve.

## `signal()` — a value that can change

A **signal** is a container around a value. You read it by *calling it like
a function*, and you write to it with `.set(...)`:

```ts
readonly activeIndicatorId = signal<string>('gini');

// reading it:
this.activeIndicatorId()   // -> 'gini'

// writing to it:
this.activeIndicatorId.set('education-access');
```

This lives in `src/app/core/services/map-state.service.ts`. The key idea:
Angular can tell when you read a signal *inside a template, or inside
another special function called `computed()`* — and it uses that to know
exactly what needs to re-run when the value changes.

## `computed()` — a value calculated from other signals

```ts
readonly scoreByIso3 = computed<ReadonlyMap<string, number>>(() => {
  const indicatorId = this.activeIndicatorId();
  const map = new Map<string, number>();
  for (const score of this.allScores()) {
    if (score.indicatorId === indicatorId) map.set(score.countryIso3, score.value);
  }
  return map;
});
```

Think of this like a spreadsheet formula. If cell C1 contains `=A1+B1`, it
automatically recalculates whenever A1 or B1 changes — you never manually
tell it to update. `computed()` works the same way: this function reads
`this.activeIndicatorId()` and `this.allScores()`, so Angular knows to
re-run it whenever *either* of those changes — and, just as importantly,
to **do nothing** when something unrelated changes (like which countries are
selected). The result is also cached: if you read `scoreByIso3()` five times
in a row without either dependency changing, it only actually runs once.

## A chain of computed values

Our app builds a whole chain of these, each one depending on the last:

```
activeIndicatorId (signal)
  -> scoreByIso3 (computed: this indicator's value per country)
    -> colorByIso3 (computed: a color per country, based on its score)
      -> used directly in the map's template
```

and separately:

```
continentFilter, topNFilter (signals)
  -> filteredCountries (computed: countries matching the filters)
    -> rankedCountries (computed: filtered countries, sorted by score)
      -> rankedSelection (computed: just the selected ones, with their rank)
```

You can see this whole chain in `map-state.service.ts`. Each step only knows
about the signals directly below it — `colorByIso3` doesn't know or care
*why* `activeIndicatorId` changed, just that it did.

## Why not just recalculate everything on every change?

You could — that's roughly what happens in very simple apps, and for a small
app like this one, it might not even be noticeably slow. But as an app
grows, recalculating *everything* on *every* change gets expensive fast.
Signals let Angular update only the specific pieces of the page that
actually depend on whatever changed — which is also why our components use
`ChangeDetectionStrategy.OnPush` (Lesson 13) and why the whole app runs
**zoneless** (Lesson 2, Lesson 13): signals already know exactly what
changed, so Angular doesn't need to double-check the entire page after every
click.

## Try it yourself

Open `map-state.service.ts` and find the `scoreByIso3` computed signal. Add
a `console.log('recalculating scores')` as the first line inside it, save,
and open your browser's developer console. Try switching the indicator
dropdown (should log) versus clicking a country to select it (shouldn't log)
— that's `computed()`'s dependency-tracking in action.

## New terms in this lesson

- **Signal** — a container around a value that Angular can track reads and
  writes of. Read with `signal()`, write with `signal.set(...)`.
- **`computed()`** — a signal whose value is calculated from other signals,
  automatically re-running only when one of those changes.
- **Reactivity** — the general idea of values automatically staying in sync
  with the things they depend on, without manual update code.

Next: [Lesson 10 — Sharing state between components](./10-sharing-state.md)
