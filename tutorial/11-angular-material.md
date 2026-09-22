# Lesson 11: Building forms and filters with Angular Material

## What is Angular Material?

Building a good-looking, accessible dropdown, toggle switch, or chip
selector from scratch is more work than it looks like — keyboard navigation,
screen reader support, consistent visual states (hover, focus, disabled) all
add up. **Angular Material** is an official library of pre-built components
that handle all of that for you, following Google's Material Design look.

We added it to the project once, with a command that also picked a color
theme and set up fonts and animations:

```bash
ng add @angular/material
```

## Using a Material component

Every Material component lives in its own importable module. Our filter
panel (`src/app/features/filters/filter-panel/filter-panel.ts`) uses several:

```ts
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
// ...

@Component({
  imports: [MatChipsModule, MatSelectModule, MatButtonToggleModule, /* ... */],
  // ...
})
export class FilterPanel { /* ... */ }
```

This is the same `imports` array from Lesson 3 — Material components are
used exactly like any other component, once imported. In the template
(`filter-panel.html`):

```html
<mat-select [value]="state.activeIndicatorId()" (selectionChange)="onIndicatorChange($event)">
  @for (indicator of state.indicators(); track indicator.id) {
    <mat-option [value]="indicator.id">{{ indicator.label }}</mat-option>
  }
</mat-select>
```

Notice this uses the exact same bindings from Lesson 8: `[value]` is a
property binding reading from our state, and `(selectionChange)` is an event
binding, just like `(click)` was for the map. Material components use
Angular's normal template syntax — they're not a separate language, just
components with their own useful behavior built in.

## Keeping state and UI in sync

Our filter panel doesn't try to hold the "current" continent filter itself —
it reads it straight from `MapStateService` (Lesson 10) with
`[value]="state.continentFilter()"`, and pushes changes back with a plain
method call:

```ts
onContinentChange(event: MatChipListboxChange): void {
  this.state.setContinentFilter(event.value as ContinentCode | 'ALL');
}
```

This keeps the flow of data easy to follow: state flows one way, out of
`MapStateService` into the template; user actions flow the other way, from
an event straight back into a method on `MapStateService`. Angular does have
a fancier two-way-binding shortcut (`model()`) for cases like this, but for a
handful of filters, being explicit about "this event means: call this
method" is easier to follow — worth knowing `model()` exists, but not
something we needed here.

## New terms in this lesson

- **Angular Material** — Angular's official library of pre-built,
  accessible UI components.
- **`ng add`** — a CLI command that installs a package *and* runs any setup
  it needs (as opposed to `npm install`, which only installs the package).

Next: [Lesson 12 — Formatting data with pipes](./12-pipes.md)
