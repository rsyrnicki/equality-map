# Lesson 12: Formatting data with pipes

## The problem

`totalSelectedPopulation` might be a number like `326687501`. Displaying
that raw is hard to read — we want `326,687,501`. We could write a
JavaScript function to format it and call that in the template, but Angular
has a purpose-built tool for exactly this: **pipes**.

## Using a pipe

In `selection-summary.html`:

```html
<dd>{{ state.totalSelectedPopulation() | number }}</dd>
```

The `|` (pipe character — that's where the name comes from) takes the value
on its left and passes it through a transformation named on its right. Here,
Angular's built-in `number` pipe adds thousands separators automatically.

Pipes can also take arguments:

```html
<dd>{{ stats.average | number: '1.0-1' }}</dd>
```

`'1.0-1'` tells the `number` pipe: show at least 1 digit before the decimal
point, and between 0 and 1 digits after it — so `63` stays `63`, and
`63.456` becomes `63.5`.

## Pipes need to be imported too

Just like Material components (Lesson 11), pipes used in a standalone
component's template need to be listed in that component's `imports` array.
In `selection-summary.ts`:

```ts
import { DecimalPipe } from '@angular/common';

@Component({
  imports: [DecimalPipe, /* ... */],
  // ...
})
export class SelectionSummary { /* ... */ }
```

`number` in the template corresponds to the `DecimalPipe` class here — a
small naming quirk worth knowing: the pipe's *usage name* in templates
(`number`) and its *class name* in imports (`DecimalPipe`) are different
words for the same thing.

## Why not just format the number in the component class?

You could add a method like `formatPopulation()` and call
`{{ formatPopulation(state.totalSelectedPopulation()) }}` instead. Pipes
exist because formatting-for-display is such a common need that Angular
ships ready-made ones for numbers, dates, percentages, and currency, so you
rarely need to write your own. They also keep templates readable: seeing
`| number` next to a value tells you at a glance that it's just a display
transformation, not application logic.

## New terms in this lesson

- **Pipe** — a template-only transformation applied to a value with the `|`
  syntax, used for formatting data for display.

Next: [Lesson 13 — How Angular knows when to update the screen](./13-change-detection.md)
