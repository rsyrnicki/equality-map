# Lesson 7: Fetching data the Angular way — Observables

## Why not just return the data directly?

Look at `CountryDataService` again:

```ts
getCountries(): Observable<Country[]> {
  return of(this.countries);
}
```

Why not just `return this.countries;`? Because real data usually doesn't
arrive instantly — it comes from a network request, which takes time and can
fail. Angular's built-in tool for fetching data over the network,
`HttpClient`, always returns an **Observable**, not the data itself. We use
`Observable` here too, even though the countries are just sitting in memory,
so that every method on the service looks the same to the rest of the app.
That paid off later: when indicators and scores switched from mock data to
real network requests (Lesson 14), none of the components using this
service had to change.

## What is an Observable?

An **Observable** represents a value (or a stream of values) that arrives
*over time*, which you **subscribe** to instead of reading directly. This
is different from a regular value, and also different from a JavaScript
`Promise`:

- A **value** (like `const x = 5`) is just there.
- A **Promise** represents one value that will arrive *once*, in the future.
- An **Observable** can represent zero, one, or many values arriving over
  time, and — importantly — nothing happens until something **subscribes**
  to it.

Observables come from a library called **RxJS**, which Angular uses
throughout (for HTTP requests, forms, routing events, and more).

It helps to picture each one on a timeline:

![Diagram comparing values over time: a plain value is there immediately; a Promise delivers one value later and finishes; of(countries) delivers one value right away and finishes; http.get delivers one response when it arrives; timer(0, 30 min) delivers a new value every 30 minutes, forever](./images/observables-over-time.svg)

The last two rows appear in Lesson 14: `http.get()` for fetching data, and
`timer()` for fetching it again every 30 minutes.

## `of()`

```ts
import { of } from 'rxjs';

return of(this.countries);
```

`of(value)` creates the simplest possible Observable: one that immediately
emits exactly that one value, then finishes. It's a way of wrapping an
already-known value in the same shape a real network call would return, so
the rest of the app can treat both cases identically.

## Where do these Observables actually get used?

You generally don't call `.subscribe()` yourself in a component — Angular
gives you cleaner tools for that. In this app, we use a function called
`toSignal()` to turn an Observable into a **signal** (Angular's other main
reactivity tool, covered next lesson), which is the more common approach in
newer Angular code:

```ts
readonly countries = toSignal(this.countryData.getCountries(), { initialValue: [] as Country[] });
```

We'll properly unpack `toSignal` in Lesson 10. For now, the important thing
is just recognizing `Observable`, `of()`, and knowing that they exist
specifically to handle data that might not be available *right now*.

## New terms in this lesson

- **Observable** — a value or stream of values that arrives over time, which
  you subscribe to rather than read directly (from the RxJS library).
- **Subscribe** — start listening to an Observable's values.
- **RxJS** — the library that provides Observables and related tools; used
  throughout Angular.
- **`of(value)`** — creates an Observable that immediately emits one value.

Next: [Lesson 8 — Drawing the map: loops and bindings](./08-loops-and-bindings.md)
