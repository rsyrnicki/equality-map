# Lesson 14: Testing your app

## Two kinds of code, two kinds of tests

Our app has two very different kinds of code, and they call for different
testing approaches.

### Testing a plain function

`buildCountryGeometry` (`src/app/core/data/countries-geometry.util.ts`) takes
plain data in and returns plain data out — it doesn't touch Angular, the DOM,
or any component. This is called a **pure function**: given the same input,
it always produces the same output, with no side effects. Testing it needs
nothing special:

```ts
// countries-geometry.util.spec.ts
describe('buildCountryGeometry', () => {
  const countries = buildCountryGeometry(worldAtlas, MOCK_COUNTRIES);

  it('produces a non-empty SVG path for a known country', () => {
    const usa = countries.find((c) => c.iso3 === 'USA');
    expect(usa?.path.startsWith('M')).toBe(true);
  });
});
```

`describe` groups related tests together; `it` defines one test case, in
plain English; `expect(...).toBe(...)` (and friends like `toBeTruthy()`,
`toBeGreaterThan()`) make an assertion — a statement that must be true, or
the test fails. This test style comes from a library called **Vitest**
(similar to the older, very common **Jest**) — you'll see this same
`describe`/`it`/`expect` pattern in almost any JavaScript project's tests,
Angular or not.

### Testing a component

Components are trickier to test, because they depend on Angular actually
being "running" — dependency injection, change detection, and so on all need
to exist for a component to work at all. Angular provides `TestBed` for
this:

```ts
// app.spec.ts
describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [App] }).compileComponents();
  });

  it('should render the toolbar title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.app-title')?.textContent).toContain('Equality Map');
  });
});
```

`TestBed.configureTestingModule` sets up a small, isolated Angular
environment containing just the component(s) you list. `TestBed.createComponent`
actually instantiates the component (running its constructor, dependency
injection, and so on) and gives you back a **fixture** — a wrapper that lets
you inspect the real rendered HTML (`fixture.nativeElement`) and interact
with the component instance directly.

## Running the tests

```bash
npm test
```

This runs every `*.spec.ts` file in the project once and reports pass/fail
for each one. We aimed for a light touch on tests in this project — most
components just get the CLI's default "does it create without crashing"
test — but we specifically wrote a real test for `buildCountryGeometry`,
because it's exactly the kind of function (pure logic with tricky edge
cases — join keys, missing data) that's easy to accidentally break without
noticing.

## New terms in this lesson

- **Pure function** — a function whose output depends only on its inputs,
  with no side effects; easy to test directly.
- **`describe` / `it` / `expect`** — the standard structure for writing
  tests: group tests, define one test case, and make an assertion.
- **`TestBed`** — Angular's tool for creating an isolated environment to
  test components in, including dependency injection and rendering.
- **Fixture** — the object `TestBed.createComponent` returns, giving access
  to both the component instance and its rendered HTML.

Next: [Lesson 15 — Packaging the app with Docker](./15-docker.md)
