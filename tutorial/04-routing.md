# Lesson 4: Giving your app pages — routing

## What is routing?

Even though an SPA (Lesson 1) never reloads the page, users still expect
addresses in the browser's URL bar to mean something — going to `/settings`
should show settings, going back in your browser history should go back a
page, and so on. **Routing** is how Angular matches a URL to a component to
show.

Our app currently has one page, but it's already wired up with the Router,
because adding a second page later (say, a detail page for one country)
means adding one line, not restructuring the app.

## The routes file

`src/app/app.routes.ts`:

```ts
import { Routes } from '@angular/router';
import { MapPage } from './features/map/map-page/map-page';

export const routes: Routes = [{ path: '', component: MapPage }];
```

`routes` is just an array of plain objects. Each one says "when the URL
matches this `path`, show this `component`." `path: ''` means the root
address (e.g. `http://localhost:4200/`). If we added a country detail page,
we might add:

```ts
{ path: 'country/:iso3', component: CountryDetailPage }
```

(`:iso3` there would be a **route parameter** — a placeholder segment of the
URL, like `/country/USA`, that the component could read.)

## Turning routing on

`src/app/app.config.ts` includes `provideRouter(routes)` in its providers list
(more on "providers" in Lesson 6) — this is what actually activates the
Router using the routes we defined.

## Where the page actually appears

Back in `app.html` from Lesson 3:

```html
<router-outlet />
```

This is a placeholder component. Whatever route currently matches the URL,
its component gets rendered exactly where `<router-outlet>` sits. Right now
that's always `MapPage`, defined in
`src/app/features/map/map-page/map-page.ts` — the component that lays out
the map, the filters, and the summary panel side by side.

## New terms in this lesson

- **Routing** — matching a URL to the component that should be shown.
- **Route** — one URL pattern-to-component mapping.
- **Route parameter** — a placeholder segment in a route's path (e.g. `:iso3`)
  that gets filled in by the actual URL and can be read by the component.
- **`<router-outlet>`** — the placeholder in a template where the active
  route's component is inserted.

Next: [Lesson 5 — Modeling data with TypeScript](./05-modeling-data.md)
