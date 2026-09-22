# Lesson 1: What is Angular, and what are we building?

## What is Angular?

Angular is a **framework** for building web apps with JavaScript (technically
TypeScript, which is JavaScript with optional type checking bolted on — more
on that in Lesson 5). "Framework" means Angular isn't a single tool you call —
it's a whole structure that decides how your code is organized, and you fill
in the blanks.

That's different from a **library** like, say, a date-formatting package,
which you call when you need it and otherwise ignore. Angular is more opinionated:
it expects your app to be built out of small, reusable pieces called
**components**, wired together in specific ways.

Why accept those opinions instead of just writing plain JavaScript?
Because once your app has more than a handful of interactive pieces —
buttons, forms, lists that update, panels that talk to each other — plain
JavaScript turns into a tangle of code that updates the page by hand every
time something changes. Angular (like React, Vue, and similar tools) instead
lets you describe **what the page should look like for a given piece of data**,
and it takes care of updating the actual page when that data changes.

## Single Page Applications

Equality Map is a **Single Page Application**, or **SPA**. Normally, a
website loads a new HTML page from the server every time you click a link.
An SPA loads one HTML page once, and then JavaScript swaps out pieces of
the page as you interact with it — no full reloads. This is why the map,
filters, and selection panel can all update instantly when you click a
country: nothing is being reloaded from a server.

## What we're building

Equality Map shows a world map. Each country is colored based on a
**socioeconomic indicator** you pick — for example, income inequality or
access to clean water. You can:

- Filter which countries are shown, by continent
- Switch which indicator colors the map
- See a ranked list of countries (best/worst by that indicator)
- Click multiple countries to select them, and see combined stats
  (total population, average score, etc.) for your selection

The data behind it is currently made-up "mock" data (more on why in Lesson 7),
but it's built so real data from a public API could replace it later without
changing how the rest of the app works.

## The tools we're using

- **Angular** — the framework itself (we're using a recent version that
  favors a style called **standalone components** and a newer state tool
  called **signals** — both explained as we go).
- **Angular Material** — a library of ready-made UI pieces (buttons, dropdowns,
  toggles) that look good by default and follow Angular's conventions.
- **TypeScript** — JavaScript with types added. Angular is written in
  TypeScript and expects your app to be too.
- **D3** (specifically `d3-geo` and `topojson-client`) — used only for the
  math of turning geographic map data into shapes we can draw. It never
  touches the page directly; Angular does all of the actual drawing.

## New terms in this lesson

- **Framework** — a structured set of tools and rules for building an app,
  as opposed to a library you call occasionally.
- **Component** — a reusable, self-contained piece of a page (its own logic
  + its own bit of HTML). Angular apps are trees of components.
- **Single Page Application (SPA)** — a web app that loads once and updates
  itself with JavaScript instead of reloading pages from the server.
- **TypeScript** — a superset of JavaScript that adds type-checking.

Next: [Lesson 2 — Setting up your first project](./02-setting-up-a-project.md)
