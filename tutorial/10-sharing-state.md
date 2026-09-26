# Lesson 10: Sharing state between components

## The problem

The map, the filter panel, and the selection summary are three separate
components, but they all need to agree on the same information: which
continent filter is active, which countries are selected, and so on. If each
component kept its own separate copy of that information, clicking a
country on the map would have no way to tell the summary panel about it.

## Two ways to connect components

Angular gives you two main tools for this:

1. **`input()` / `output()`** — a parent component passes data *down* to a
   child through an input, and the child sends events *up* to the parent
   through an output. This is great for two directly related components
   (like a card component and the list that renders many of them), but gets
   awkward once several unrelated components need to share the same data —
   you'd end up passing things through components that don't otherwise care
   about them, just to relay them along.

2. **A shared service** — put the state in one injectable service (Lesson 6),
   and have every component that needs it simply `inject()` that same
   service directly. Since services registered with `providedIn: 'root'`
   are singletons, every component sees the exact same data.

![Diagram comparing the two approaches: on the left, WorldMap, FilterPanel and SelectionSummary each inject MapStateService; on the right, FilterPanel passes data down to its child LiveStatus with [state] and listens for events coming up with (refresh)](./images/sharing-state.svg)

This app mostly uses the second approach: `MapStateService`
(`src/app/core/services/map-state.service.ts`) holds all of the shared state,
and `WorldMap`, `FilterPanel`, and `SelectionSummary` each inject it directly:

```ts
// in WorldMap, FilterPanel, and SelectionSummary alike:
protected readonly state = inject(MapStateService);
```

Now, when `FilterPanel` calls `state.setActiveIndicator('gini')`, the map's
`state.colorByIso3` computed signal (which reads `activeIndicatorId`
somewhere down its dependency chain) automatically recalculates — no events,
no wiring between the two components at all. They don't even know about each
other; they only know about the shared service.

## Reading data straight in the template

Because `state` is just a property on the component, templates can read its
signals directly:

```html
<!-- selection-summary.html -->
<dd>{{ state.totalSelectedPopulation() | number }}</dd>
```

There's no need to copy `totalSelectedPopulation` into a separate property
on `SelectionSummary` first — the template calls straight through to the
signal on the injected service.

## When `input()` and `output()` are the better fit

`LiveStatus` (added in Lesson 14) is a small component that only ever
appears inside `FilterPanel`. It uses the first approach instead:

```ts
// live-status.ts
readonly state = input.required<LiveState>();
readonly refresh = output<void>();
```

```html
<!-- filter-panel.html -->
<app-live-status [state]="state.liveState()" (refresh)="state.refreshLive()" />
```

`input.required<LiveState>()` declares a property the parent *must* bind with
`[state]="..."`, and inside `LiveStatus` it's read like any signal:
`state()`. `output<void>()` declares an event the parent can listen to with
`(refresh)="..."`, and `LiveStatus` fires it with `this.refresh.emit()`.

Why not inject `MapStateService` here too? Because this way `LiveStatus`
knows nothing about the rest of the app. It shows whatever `LiveState` it's
given, and says "refresh was clicked" without knowing what refreshing
involves. That makes it reusable (another live indicator could use it
as-is), and easy to test: Lesson 15's test just sets the input directly.

## Bridging Observables into this shared state

`MapStateService` also needs the actual country/indicator/score data, which
comes from `CountryDataService` as Observables (Lesson 7). To combine RxJS
Observables with signal-based state, Angular provides `toSignal()`:

```ts
private readonly countryData = inject(CountryDataService);

readonly countries = toSignal(this.countryData.getCountries(), { initialValue: [] as Country[] });
```

`toSignal()` subscribes to the Observable once and keeps a signal updated
with its latest value. `initialValue` is what the signal holds *before* the
Observable has emitted anything yet — important for real network calls,
which take time. Indicators and scores are loaded over HTTP (Lesson 14), so
for a moment after the app starts they really are `[]`, and the map is
grey until the data arrives.

This is the seam between Lesson 7's world (Observables, for anything
potentially asynchronous) and Lesson 9's world (signals, for reactive UI
state) — `toSignal()` is what lets the rest of the app treat both
consistently, as ordinary signals.

## New terms in this lesson

- **Shared service (as a state store)** — using a singleton, injectable
  service to hold state that multiple unrelated components need to read and
  write.
- **`toSignal()`** — converts an RxJS Observable into a signal that always
  holds its latest emitted value.
- **`input()` / `output()`** — declare data a parent component passes in,
  and events a component sends back out to its parent.

Next: [Lesson 11 — Building forms and filters with Angular Material](./11-angular-material.md)
