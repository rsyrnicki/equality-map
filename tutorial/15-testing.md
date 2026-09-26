# Lesson 15: Testing your app

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

### Components that (indirectly) use HTTP

Most of our components inject `MapStateService`, which injects
`CountryDataService`, which injects `HttpClient` (see the diagram in
Lesson 6). A test that creates one of those components needs an
`HttpClient` too, but tests shouldn't depend on the network: it's slow,
it can be down, and its data changes. So those tests provide a *testing*
version instead:

```ts
await TestBed.configureTestingModule({
  imports: [WorldMap],
  providers: [provideHttpClient(), provideHttpClientTesting()],
}).compileComponents();
```

`provideHttpClientTesting()` keeps the real `HttpClient`, but replaces the
part that actually sends requests. Requests are recorded, and nothing goes
over the network. This is dependency injection (Lesson 6) paying off: the
component never knows the difference.

### Testing code that makes HTTP requests

For `AirQualityService` (Lesson 14) we want to go further and check the
requests themselves. `HttpTestingController` lets a test look at the
recorded requests and answer them with a made-up response:

```ts
// air-quality.service.spec.ts
it("turns the API's response into our own CountryScore rows", () => {
  let result;
  service.fetchCurrent(LOCATIONS).subscribe((value) => (result = value));

  http.expectOne(() => true).flush([reading(5.3), reading(28.3)]);

  expect(result?.scores).toEqual([
    { countryIso3: 'DEU', indicatorId: 'air-quality', value: 5.3, year: 2026, source: expect.any(String) },
    { countryIso3: 'IND', indicatorId: 'air-quality', value: 28.3, year: 2026, source: expect.any(String) },
  ]);
});
```

`expectOne()` checks that exactly one matching request was made (and fails
the test otherwise), and `.flush(...)` answers it: the Observable emits right
there, synchronously. `flush` can fake failures too:
`.flush('down', { status: 503, statusText: 'Service Unavailable' })`. An
`afterEach` calls `http.verify()`, which fails the test if the code made any
request the test didn't expect.

### Testing things that happen over time

`watch()` waits 30 minutes between fetches and 3 seconds between retries.
Tests can't really wait that long, so they use **fake timers**:

```ts
vi.useFakeTimers();
// ... subscribe, fail a request ...
vi.advanceTimersByTime(3000); // "3 seconds pass", instantly
```

`vi.useFakeTimers()` replaces the browser's `setTimeout` and `setInterval`
(which RxJS's `timer` and `retry` use internally) with a clock the test
moves forward by hand. The test for "keeps the previous readings when a
refresh fails" uses this to get through both retries in a few milliseconds.

### Testing a component through its inputs

Because `LiveStatus` gets its data through `input()` (Lesson 10), its test
needs no services and no HTTP at all. It sets the input directly:

```ts
fixture.componentRef.setInput('state', { ...INITIAL_LIVE_STATE, status: 'error', error: 'Service down' });
await fixture.whenStable();
expect(fixture.nativeElement.textContent).toContain('Service down');
```

## Running the tests

```bash
npm test
```

This runs every `*.spec.ts` file in the project once and reports pass/fail
for each one. We aimed for a light touch on tests in this project — most
components just get the CLI's default "does it create without crashing"
test — but we specifically wrote real tests for `buildCountryGeometry` and
`AirQualityService`. Both are exactly the kind of code that's easy to break
without noticing: tricky edge cases (join keys, missing values, one-object-
instead-of-an-array responses) and behavior that depends on time.

## New terms in this lesson

- **Pure function** — a function whose output depends only on its inputs,
  with no side effects; easy to test directly.
- **`describe` / `it` / `expect`** — the standard structure for writing
  tests: group tests, define one test case, and make an assertion.
- **`TestBed`** — Angular's tool for creating an isolated environment to
  test components in, including dependency injection and rendering.
- **Fixture** — the object `TestBed.createComponent` returns, giving access
  to both the component instance and its rendered HTML.
- **`provideHttpClientTesting()`** — swaps the part of `HttpClient` that
  sends requests for one that just records them.
- **`HttpTestingController`** — lets a test inspect recorded requests and
  answer them with `flush()`.
- **Fake timers** — a stand-in clock that tests move forward by hand, so
  code with delays can be tested instantly.

Next: [Lesson 16 — Packaging the app with Docker](./16-docker.md)
