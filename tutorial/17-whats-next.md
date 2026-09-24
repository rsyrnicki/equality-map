# Lesson 17: What to learn next

You've now seen every major Angular concept used in this app, each attached
to real, working code. Here's a recap of the concept map, and some ideas for
where to take the app (and your Angular knowledge) from here.

## The concept map

- **Components** (Lesson 3) are the building blocks; they nest into a
  **component tree**.
- **Routing** (Lesson 4) decides which component shows for a given URL.
- **Services + Dependency Injection** (Lesson 6) share logic and data
  without components creating their own copies.
- **Observables** (Lesson 7) represent data that arrives over time,
  especially from the network.
- **Templates** (Lesson 8) use `@for`/`@if`, `[property bindings]`,
  `(event bindings)`, and `{{ interpolation }}` to connect a component's
  data to the actual page.
- **Signals and `computed()`** (Lesson 9) are how the app reacts to state
  changes efficiently, without manually wiring up updates.
- **Shared state services + `toSignal()`** (Lesson 10) are how multiple
  components stay in sync without talking to each other directly.
- **Angular Material** (Lesson 11) supplies ready-made, accessible UI
  components, used the same way as any other component.
- **Pipes** (Lesson 12) format data for display, right in the template.
- **Change detection, `OnPush`, and zoneless** (Lesson 13) are how Angular
  decides when to actually update the screen.
- **`HttpClient` and RxJS operators** (Lesson 14) fetch real data, both once
  (a build-time snapshot) and repeatedly (a live API), with loading and
  error states.
- **Testing** (Lesson 15) uses plain `describe`/`it`/`expect` for pure logic,
  `TestBed` for anything that needs Angular running, and
  `HttpTestingController` to fake HTTP responses.
- **Docker** (Lesson 16) packages the built app so it can run anywhere,
  independent of Angular itself.

## Things you could try adding

Each of these is a good next exercise, roughly in order of difficulty:

1. **More indicators.** Add an entry to `INDICATORS` in
   `scripts/fetch-indicator-data.mjs` (the World Bank alone has thousands:
   try `SG.GEN.PARL.ZS`, women in parliament) and run `npm run fetch-data`.
   It should show up in the dropdown with no Angular code changes. This is
   a good way to confirm you understand how data flows from the snapshot
   file through `MapStateService`.
2. **A second page.** Add a route (Lesson 4) for a single country's detail
   view, with its own component, linked from the selection summary.
3. **A second live indicator.** Open-Meteo also provides other air-quality
   measures (such as `european_aqi` or `ozone`), and weather. Adding one is a
   good test of Lesson 14: which parts of `AirQualityService` could be
   shared, and does `LiveStatus` work for it unchanged?
4. **Loading and error states for the snapshot.** The live indicator shows
   when it's loading or has failed, but the snapshot doesn't: if
   `indicators.json` fails to load, the map just stays grey. Try rewriting
   `CountryDataService` with `httpResource()` (mentioned at the end of
   Lesson 14), which gives you `isLoading()` and `error()` signals for free.
5. **Be a better API citizen.** Pause the live polling while the browser tab
   is hidden (look up the `visibilitychange` event and RxJS's `fromEvent`),
   so a forgotten background tab doesn't use up Open-Meteo's free quota.
6. **URL-based sharing.** Make the current filters/selection reflected in the
   URL (using route query parameters), so a link can be shared that opens
   the app with a specific view already set up.

## Where to go for more

- The official Angular documentation (angular.dev) is genuinely good and
  written for exactly this stage — once you've built one real thing, reading
  the docs for a concept you've already touched (signals, routing, forms)
  will make a lot more sense than reading it cold.
- Read Angular's own generated code with fresh eyes: run `ng generate component
  something` in a scratch project and compare what it creates to the
  patterns in this app.

That's the whole tour. The best next step is picking one item from the list
above and actually building it — reading is a fine start, but everything in
these lessons only really clicked, for this project, once it was working on
screen.
