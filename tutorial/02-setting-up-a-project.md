# Lesson 2: Setting up your first project

## The Angular CLI

Angular comes with a command-line tool called the **CLI** (Command Line
Interface) that generates and manages projects for you. Instead of manually
setting up build tools, a dev server, and file structure, you run one command:

```bash
npx @angular/cli@latest new equality-map
```

`npx` runs a tool without permanently installing it — handy for a
one-off command like creating a new project. This asks a few questions
(styling language, routing, etc.) and then generates a whole working project:
config files, a starter component, a test setup, everything.

## What got generated

Here are the files that matter most, and what each one is for:

```
src/
  main.ts              <- the very first code that runs
  index.html           <- the one real HTML page (the "shell")
  app/
    app.ts             <- the root component
    app.html            <- the root component's template (its HTML)
    app.css             <- the root component's styles
    app.config.ts       <- app-wide setup (routing, etc.)
    app.routes.ts       <- the list of "pages" (routes)
angular.json           <- project configuration for the CLI
package.json           <- dependencies and npm scripts
```

We'll open most of these in later lessons. For now, the important thing to
notice is that Angular projects have a **consistent shape** — any Angular
project you open later will have this same skeleton, which makes it much
faster to get your bearings in someone else's code.

## Running the app

```bash
npm start        # same as: ng serve
```

This starts a **development server** — a local web server, usually at
`http://localhost:4200`, that serves your app and automatically reloads
the page in your browser whenever you save a file. This is what you'll have
running in the background for basically the entire time you're developing.

## Building for real

```bash
npm run build     # same as: ng build
```

This produces an **optimized** version of the app — minified code, only the
CSS you actually use, etc. — written to a `dist/` folder as plain HTML/CSS/JS
files. This is what you'd actually deploy; we'll do exactly that with Docker
in Lesson 16. The dev server (`npm start`) is for working on the app; the
build (`npm run build`) is for shipping it.

## A couple of setup choices worth knowing about

Two choices we made when creating this project are worth calling out, because
you'll see their effects everywhere in the code:

- **Standalone components**: older Angular tutorials group components into
  "modules" (`NgModule`). Newer Angular (what we're using) lets each
  component just list what it needs directly — no modules required. If you
  read an older tutorial and see `@NgModule`, that's the old style; this
  project doesn't use it.
- **Zoneless**: normally Angular uses a library called `zone.js` to notice
  when *anything* might have changed and re-check the whole page. We turned
  this off. Instead, the app tells Angular exactly what changed, using a tool
  called **signals** (Lesson 9). This is faster and is the direction Angular
  itself is heading.

## New terms in this lesson

- **CLI (Command Line Interface)** — here, the `ng` command-line tool that
  generates and manages Angular projects.
- **Development server** — a local server that serves your in-progress app
  and reloads it automatically as you save files.
- **Build** — turning your source code into optimized, deployable files.
- **Module (`NgModule`)** — the *old* way of grouping Angular code; this
  project uses the newer standalone style instead.

Next: [Lesson 3 — Your first component](./03-your-first-component.md)
