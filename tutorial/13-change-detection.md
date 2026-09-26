# Lesson 13: How Angular knows when to update the screen

You've now seen signals (Lesson 9) update the app automatically. This lesson
explains the mechanism underneath that — **change detection** — and why our
components all include this line:

```ts
changeDetection: ChangeDetectionStrategy.OnPush,
```

## The old way: `zone.js`

Classic Angular apps include a library called `zone.js`, which
patches almost every async browser API (click handlers, timers, network
responses...) so that Angular finds out whenever *any* of them run. After
each one, Angular re-checks the *entire component tree*, top to bottom, to
see if anything needs to change on screen. This works, but it means a lot of
unnecessary checking — clicking one button re-examines components that
couldn't possibly have been affected by it.

## Our approach: zoneless + signals + `OnPush`

We turned `zone.js` off entirely (mentioned back in Lesson 2 — check
`package.json`, it's genuinely not installed). Instead:

- **Signals** (Lesson 9) know exactly which computed values and templates
  read them. When a signal changes, Angular already knows precisely what
  might need updating — no guessing required.
- **`ChangeDetectionStrategy.OnPush`**, set on every component we wrote,
  tells Angular: "only re-check this component when one of its inputs
  changes, or a signal it reads changes — don't just re-check it on a timer
  or because something unrelated happened elsewhere."

Put together: instead of "something happened somewhere, let's recheck
everything," the model is "this specific signal changed, so only the exact
templates and computed values that read it need to run again." This is both
faster and easier to reason about — you can look at a computed signal's
code and know exactly what would cause it to re-run, just by looking at what
signals it reads.

## Why this matters practically

You generally don't have to think about change detection while writing
features — if you use signals for your state (as this app does throughout),
correct, efficient updates mostly happen automatically. The main thing to
remember: if you ever store state in a plain class property instead of a
signal, and expect the template to update when it changes, it won't — with
`OnPush` and no zone.js, Angular has no way to know a plain property
changed. This is the practical reason nearly every piece of state in this
app is a `signal()` rather than an ordinary `let` or class field.

## New terms in this lesson

- **Change detection** — the process Angular uses to decide when to
  re-render a component.
- **`zone.js`** — a library (not used in this project) that patches browser
  APIs so Angular can detect that *something* async happened, anywhere.
- **`ChangeDetectionStrategy.OnPush`** — tells a component to only
  re-check itself when its inputs or the signals it reads actually change.
- **Zoneless** — running Angular without `zone.js`, relying on signals
  instead to know what changed.

Next: [Lesson 14 — Talking to real APIs](./14-talking-to-apis.md)
