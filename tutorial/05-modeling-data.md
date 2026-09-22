# Lesson 5: Modeling data with TypeScript

Before building the parts of the app that *use* data, we defined exactly what
our data looks like. This isn't an Angular-specific step — it's a TypeScript
habit that Angular projects lean on heavily — but it's worth its own lesson
because everything else is built on top of these shapes.

## Why bother with types?

In plain JavaScript, an object is just whatever properties you happened to
put on it — there's nothing stopping you from misspelling a property name or
passing the wrong kind of value, until it breaks at runtime. TypeScript lets
you describe the *shape* a value must have, and then checks your whole
codebase against that shape while you're still writing it, catching mistakes
before you ever run the app.

## Interfaces

An **interface** describes the shape of an object: what properties it has,
and what type each one is. Here's `src/app/core/models/country.model.ts`:

```ts
export interface CountryMeta {
  isoNumeric: string;
  iso2: string;
  iso3: string;
  name: string;
  continent: ContinentCode;
  population: number;
}

export interface Country extends CountryMeta {
  path: string;
}
```

`CountryMeta` is the raw facts we know about a country. `Country` is the same
thing *plus* an SVG `path` string, added once we combine that country's
metadata with its map shape (Lesson 8). `extends` means "everything
`CountryMeta` has, plus this too" — instead of repeating all six properties,
`Country` just adds the one it's missing.

Now if you write `country.populaton` (typo) anywhere in the app, TypeScript
tells you immediately, rather than you discovering it as a silent `undefined`
somewhere in the UI.

## A type instead of an interface

`src/app/core/models/continent.model.ts`:

```ts
export type ContinentCode = 'AF' | 'AS' | 'EU' | 'NA' | 'SA' | 'OC' | 'AN';
```

This is a **union type**: the value can be exactly one of these seven strings,
and nothing else. This is stricter than `type ContinentCode = string`, and it
means anywhere we write `continent === 'EU'`, TypeScript would catch a typo
like `'EU '` or `'Europe'` immediately.

## The rest of our data shapes

`src/app/core/models/indicator.model.ts` defines the other two shapes we use
throughout the app:

```ts
export interface IndicatorDefinition {
  id: string;
  label: string;
  unit: string;
  category: string;
  higherIsBetter: boolean;
}

export interface CountryScore {
  countryIso3: string;
  indicatorId: string;
  value: number;
  year: number;
  source: string;
}
```

An `IndicatorDefinition` describes one measurable thing (like "income
inequality"): its id, a human-readable label, what unit it's measured in, and
whether a *higher* number is a *better* outcome (important later for coloring
and sorting — a lower Gini score is "better," but higher access-to-water is
also "better"). A `CountryScore` is one actual number: this country, this
indicator, this value.

## New terms in this lesson

- **Interface** — a description of an object's shape (its properties and
  their types), checked by TypeScript while you write code.
- **Union type** — a type that must be one of a fixed set of specific values.
- **`extends`** (on an interface) — build a new shape that includes
  everything from another shape, plus more.

Next: [Lesson 6 — Services and Dependency Injection](./06-services-and-dependency-injection.md)
