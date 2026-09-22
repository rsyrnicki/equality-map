# Lesson 8: Drawing the map — loops and bindings

This lesson covers Angular's template syntax — the special HTML-like language
used inside `.html` files that belong to a component — using the world map
itself as the example.

## Turning geography into shapes, without Angular

Before Angular ever gets involved, we need actual map shapes to draw. A
world map is normally stored as **geographic coordinates** (latitude and
longitude points outlining every country's borders). To draw that on a flat
screen, those coordinates need to go through a **map projection** — a math
formula that flattens a round Earth onto a 2D image (the reason Greenland
looks huge on some maps and normal-sized on others is different projections).

We use a library called `d3-geo` purely for this math, in
`src/app/core/data/countries-geometry.util.ts`. It takes raw geographic data
and, for each country, produces an SVG **path string** — a compact sequence
of drawing instructions (move here, draw a line to here, curve to here...)
that an `<svg>` element knows how to render as a shape. Nothing here touches
the actual page; it's just calculating strings. This calculation happens
once, and the result — a `path` string per country — gets stored as part of
each `Country` object.

## SVG: a quick primer

**SVG** (Scalable Vector Graphics) is an HTML-like format for drawing shapes
with actual XML tags, instead of a bitmap of pixels. A `<path d="...">`
element draws a shape from that compact instruction string mentioned above.
Because it's made of real elements, we can bind Angular data to
it — a color, a CSS class, a click handler — exactly like any other tag.

## The map's template

`src/app/features/map/world-map/world-map.html`:

```html
<svg class="world-map" viewBox="0 0 960 500" xmlns="http://www.w3.org/2000/svg">
  @for (country of countries(); track country.iso3) {
    <path
      [attr.d]="country.path"
      [style.fill]="colorFor(country)"
      [class.selected]="isSelected(country)"
      (click)="toggle(country)"
    >
      <title>{{ country.name }}</title>
    </path>
  }
</svg>
```

Let's go through every piece of syntax here.

### `@for` — repeating a block of HTML

```html
@for (country of countries(); track country.iso3) { ... }
```

This works like a `for...of` loop, but for templates: for every `country` in
the `countries()` list, render the HTML inside the curly braces once. The
`track country.iso3` part tells Angular *how to identify* each item — when
the list changes, Angular uses this to figure out which items are the same
as before (so it can leave their HTML alone) and which are new or removed
(so it only touches those). Without `track`, Angular can't tell items apart
efficiently.

### Property bindings — `[...]`

```html
[attr.d]="country.path"
```

Square brackets bind a piece of data *into* the page. `[attr.d]` sets the
`d` attribute of the `<path>` element to whatever `country.path` evaluates
to, for that specific country in the loop. `[style.fill]` and
`[class.selected]` follow the same pattern for a CSS style property and a
CSS class, respectively — anything in square brackets is "take this
TypeScript expression, and set this DOM thing to its value."

### Event bindings — `(...)`

```html
(click)="toggle(country)"
```

Parentheses bind a DOM event *out* to a method call. When this specific
`<path>` is clicked, Angular calls `toggle(country)` on the component — the
same `toggle` method you'd find in `world-map.ts`.

### Interpolation — `{{ }}`

```html
<title>{{ country.name }}</title>
```

Double curly braces insert a value directly as text. This one gives the
`<path>` a native browser tooltip showing the country's name on hover.

## The component behind the template

`src/app/features/map/world-map/world-map.ts` defines exactly the methods
the template calls — `toggle()`, `isSelected()`, `colorFor()` — and where
`countries()` comes from (a signal, which is next lesson's topic).

## New terms in this lesson

- **Map projection** — the math that converts geographic coordinates into
  flat, 2D positions.
- **SVG (Scalable Vector Graphics)** — an XML-based format for drawing
  shapes as real elements, not pixels.
- **`@for`** — Angular's template loop, repeating a block of HTML once per
  item in a list.
- **`track`** — tells `@for` how to identify items across re-renders, so
  Angular only updates what actually changed.
- **Property binding (`[...]`)** — sets a DOM property/attribute/style/class
  from a TypeScript expression.
- **Event binding (`(...)`)** — calls a method when a DOM event fires.
- **Interpolation (`{{ }}`)** — inserts a value as text in the template.

Next: [Lesson 9 — Signals: Angular's reactive state](./09-signals.md)
