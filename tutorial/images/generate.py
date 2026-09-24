import sys
from svglib import Diagram, ACCENT, MUTED, LINE, INK

# Regenerate every diagram with:  python3 tutorial/images/generate.py
OUT = sys.argv[1] if len(sys.argv) > 1 else __import__("os").path.dirname(__file__) or "."


def component_tree():
    d = Diagram(960, 540, 'The Equality Map component tree')
    d.text(30, 36, 'The component tree', size=18, weight='700', anchor='start')
    d.text(30, 58, 'Each box is a component; a line means "rendered inside the template of".', size=13, anchor='start', color=MUTED)

    app = d.box(435, 110, 190, 56, 'component', 'App', '<app-root>')
    toolbar = d.box(230, 210, 190, 56, 'library', 'MatToolbar', '<mat-toolbar>')
    outlet = d.box(620, 210, 190, 56, 'library', 'RouterOutlet', '<router-outlet>')
    page = d.box(620, 310, 190, 56, 'component', 'MapPage', '<app-map-page>')
    world = d.box(390, 410, 190, 56, 'component', 'WorldMap', '<app-world-map>')
    filters = d.box(620, 410, 190, 56, 'component', 'FilterPanel', '<app-filter-panel>')
    summary = d.box(850, 410, 190, 56, 'component', 'SelectionSummary', '<app-selection-summary>', title_size=13.5)
    live = d.box(620, 500, 190, 56, 'component', 'LiveStatus', '<app-live-status>', tag='Lesson 14')

    for a, b in [(app, toolbar), (app, outlet), (page, world), (page, filters), (page, summary), (filters, live)]:
        d.elbow(a, b)
    d.elbow(outlet, page, color=ACCENT, dashed=True)
    d.text(735, 266, "route path: ''", size=11.5, color=ACCENT, mono=True, anchor='start')

    d.legend(30, 505, [('component', 'our components'), ('library', 'from a library (Material, Router)')])
    return d


def dependency_injection():
    d = Diagram(960, 470, 'Dependency injection: one shared instance of each service')
    d.text(30, 36, 'Who injects what', size=18, weight='700', anchor='start')
    d.text(30, 58, 'Arrows point from the class calling inject() to what it receives. Every arrow into a box gets the same instance.',
           size=13, anchor='start', color=MUTED)

    d.rect(30, 80, 900, 270, 'lane', rx=12)
    d.text(50, 104, "Root injector  —  providedIn: 'root'  =  exactly one instance each", size=13, weight='600', anchor='start', color=MUTED)

    http = d.box(480, 140, 200, 44, 'library', 'HttpClient', title_size=14)
    data = d.box(300, 225, 220, 44, 'service', 'CountryDataService')
    air = d.box(660, 225, 220, 44, 'service', 'AirQualityService')
    state = d.box(480, 310, 220, 44, 'service', 'MapStateService')

    world = d.box(230, 420, 180, 44, 'component', 'WorldMap')
    filters = d.box(480, 420, 180, 44, 'component', 'FilterPanel')
    summary = d.box(730, 420, 180, 44, 'component', 'SelectionSummary')

    for a in (world, filters, summary):
        d.connect(a, state)
    d.connect(state, data)
    d.connect(state, air)
    d.connect(data, http)
    d.connect(air, http)
    d.text(50, 378, 'inject(MapStateService)', size=11.5, mono=True, color=MUTED, anchor='start')

    d.legend(620, 104, [('service', 'our services'), ('library', 'Angular')])
    return d


def observables():
    d = Diagram(960, 400, 'A value, a Promise, and Observables over time')
    d.text(30, 36, 'Values over time', size=18, weight='700', anchor='start')
    d.text(30, 58, 'Each row is one way of getting data. Time runs left to right; a dot is a value arriving, a bar means "finished".',
           size=13, anchor='start', color=MUTED)

    x0, x1 = 290, 920
    rows = [
        ('const x = 5', 'there already, no waiting', [(x0, '5')], None),
        ('Promise', 'one value, later, then done', [(560, 'v')], 560),
        ('of(countries)', 'one value right away, then done', [(x0 + 6, 'c')], x0 + 26),
        ('http.get(url)', 'one response when it arrives', [(470, 'r')], 470),
        ('timer(0, 30 min)', 'a new value every 30 min, forever', [(x0 + 6, '0'), (560, '1'), (830, '2')], None),
    ]
    y = 100
    for name, desc, dots, end in rows:
        d.text(30, y + 5, name, size=13.5, mono=True, anchor='start')
        d.text(30, y + 23, desc, size=11.5, anchor='start', color=MUTED)
        d.line(x0 - 10, y, x1, y, color='#bdbdbd', arrow=True)
        if end is not None:
            ex = end + 22
            d.line(ex, y - 12, ex, y + 12, color=INK, arrow=False, width=2.5)
        for x, label in dots:
            d.circle(x, y, 12, '#5e35b1', label=label)
        y += 56
    d.text(x1, y - 20, 'time →', size=12, anchor='end', color=MUTED)
    d.text(x0 - 10, 88, 'subscribe()', size=11.5, mono=True, color=ACCENT, anchor='start')
    d.line(x0 - 10, 92, x0 - 10, y - 40, color=ACCENT, arrow=False, dashed=True)
    return d


def signal_graph():
    d = Diagram(960, 590, 'How signals and computed values depend on each other')
    d.text(30, 36, 'The signal graph in MapStateService', size=18, weight='700', anchor='start')
    d.text(30, 58, 'Arrows show "is read by". When a signal changes, only what is downstream of it re-runs.',
           size=13, anchor='start', color=MUTED)

    H = 40
    r1, r2, r3, r4, r5 = 110, 200, 290, 380, 480
    act = d.box(115, r1, 180, H, 'signal', 'activeIndicatorId', mono=True, title_size=13)
    scores = d.box(305, r1, 130, H, 'computed', 'allScores', mono=True, title_size=13)
    cont = d.box(490, r1, 160, H, 'signal', 'continentFilter', mono=True, title_size=13)
    topn = d.box(665, r1, 130, H, 'signal', 'topNFilter', mono=True, title_size=13)
    sel = d.box(845, r1, 150, H, 'hot', 'selectedIso3s', mono=True, title_size=13)

    sbi = d.box(210, r2, 140, H, 'computed', 'scoreByIso3', mono=True, title_size=13)
    fil = d.box(580, r2, 180, H, 'computed', 'filteredCountries', mono=True, title_size=13)

    col = d.box(110, r3, 130, H, 'computed', 'colorByIso3', mono=True, title_size=13)
    rank = d.box(575, r3, 160, H, 'computed', 'rankedCountries', mono=True, title_size=13)
    selc = d.box(845, r3, 180, H, 'hot', 'selectedCountries', mono=True, title_size=13)

    rsel = d.box(620, r4, 160, H, 'hot', 'rankedSelection', mono=True, title_size=13)
    tot = d.box(845, r4, 210, H, 'hot', 'totalSelectedPopulation', mono=True, title_size=13)

    wm = d.box(250, r5, 190, H, 'template', 'WorldMap template')
    ss = d.box(745, r5, 230, H, 'hot', 'SelectionSummary template')

    cold = [(act, sbi), (scores, sbi), (cont, fil), (topn, fil), (sbi, col), (sbi, rank), (fil, rank), (col, wm), (fil, wm),
            (fil, selc), (rank, rsel)]
    for a, b in cold:
        d.connect(a, b)
    d.connect(sbi, fil)
    for a, b in [(sel, selc), (sel, rsel), (selc, tot), (rsel, ss), (tot, ss)]:
        d.connect(a, b, color=ACCENT)

    d.legend(30, 548, [('signal', 'signal()'), ('computed', 'computed()'), ('template', 'template'),
                       ('hot', 're-runs when you click a country')], gap=20)
    d.text(30, 572, 'scoreByIso3 and colorByIso3 are not downstream of selectedIso3s, so clicking a country never recalculates them. '
           '(The map template does read selectedIso3s, via isSelected(), to outline selected countries.)',
           size=11, anchor='start', color=MUTED, italic=True)
    return d


def sharing_state():
    d = Diagram(960, 380, 'Two ways for components to share data')
    d.text(30, 36, 'Two ways to connect components', size=18, weight='700', anchor='start')

    # Left: shared service
    d.rect(30, 60, 470, 300, 'lane', rx=12)
    d.text(50, 88, '1. A shared service', size=14, weight='600', anchor='start')
    d.text(50, 108, 'for components that are not parent and child', size=12, anchor='start', color=MUTED)
    st = d.box(265, 165, 220, 44, 'service', 'MapStateService')
    a = d.box(115, 300, 150, 44, 'component', 'WorldMap')
    b = d.box(265, 300, 130, 44, 'component', 'FilterPanel')
    c = d.box(415, 300, 150, 44, 'component', 'SelectionSummary', title_size=12.5)
    for x in (a, b, c):
        d.connect(x, st)
    d.text(265, 347, 'each one calls inject(MapStateService)', size=11.5, mono=True, color=MUTED)

    # Right: input / output
    d.rect(520, 60, 410, 300, 'lane', rx=12)
    d.text(540, 88, '2. input() and output()', size=14, weight='600', anchor='start')
    d.text(540, 108, 'for a parent and the child in its template', size=12, anchor='start', color=MUTED)
    d.rect(540, 130, 370, 210, 'component', rx=10)
    d.text(560, 154, 'FilterPanel  (parent)', size=13.5, weight='600', anchor='start')
    child = d.box(725, 290, 200, 48, 'component', 'LiveStatus', '(child)')
    d.line(690, 170, 690, 262, color='#1e88e5')
    d.text(682, 200, '[state]=', size=12, mono=True, anchor='end', color='#1565c0')
    d.text(682, 216, '"state.liveState()"', size=11, mono=True, anchor='end', color='#1565c0')
    d.text(682, 236, 'data goes down', size=11, anchor='end', color=MUTED, italic=True)
    d.line(760, 264, 760, 172, color=ACCENT)
    d.text(768, 200, '(refresh)=', size=12, mono=True, anchor='start', color=ACCENT)
    d.text(768, 216, '"state.refreshLive()"', size=11, mono=True, anchor='start', color=ACCENT)
    d.text(768, 236, 'events go up', size=11, anchor='start', color=MUTED, italic=True)
    return d


def data_flow():
    d = Diagram(960, 500, 'Where the app gets its data: at build time and live')
    d.text(30, 36, 'Two ways data reaches the map', size=18, weight='700', anchor='start')

    d.rect(30, 56, 900, 170, 'lane', rx=12)
    d.text(50, 80, 'BUILD TIME  —  npm run fetch-data (also runs in docker build)', size=12.5, weight='700', anchor='start', color=MUTED)
    wb = d.box(140, 115, 190, 32, 'external', 'World Bank API', title_size=13)
    who = d.box(140, 155, 190, 32, 'external', 'WHO GHO API', title_size=13)
    owid = d.box(140, 195, 190, 32, 'external', 'Our World in Data (CSV)', title_size=13)
    script = d.box(420, 155, 230, 50, 'tool', 'fetch-indicator-data.mjs', 'scripts/', title_size=13.5)
    json = d.box(750, 155, 240, 50, 'file', 'indicators.json', 'public/data/  ·  in git')
    for s in (wb, who, owid):
        d.connect(s, script)
    d.connect(script, json, label='writes', label_offset=(0, -8))

    d.rect(30, 246, 900, 236, 'lane', rx=12)
    d.text(50, 270, "RUN TIME  —  in the visitor's browser", size=12.5, weight='700', anchor='start', color=MUTED)
    server = d.box(780, 320, 240, 50, 'tool', 'our server', 'nginx (or ng serve)')
    cds = d.box(370, 320, 220, 44, 'service', 'CountryDataService')
    meteo = d.box(780, 430, 240, 50, 'external', 'Open-Meteo API', 'air-quality-api.open-meteo.com')
    aqs = d.box(370, 430, 220, 44, 'service', 'AirQualityService')
    state = d.box(135, 375, 170, 44, 'service', 'MapStateService')

    d.line(750, 181, 750, 293, color=MUTED, dashed=True)
    d.text(762, 272, 'ng build copies public/ into dist/', size=11.5, anchor='start', color=MUTED, italic=True)
    d.connect(server, cds)
    d.text(570, 300, 'GET data/indicators.json', size=11.5, mono=True, color=MUTED)
    d.text(570, 342, 'once, at startup', size=11.5, color=MUTED, italic=True)
    d.connect(meteo, aqs, color=ACCENT)
    d.text(570, 410, 'GET /v1/air-quality', size=11.5, mono=True, color=ACCENT)
    d.text(570, 452, 'every 30 min, while selected', size=11.5, color=ACCENT, italic=True)
    d.connect(cds, state)
    d.connect(aqs, state, color=ACCENT)
    return d


def polling():
    d = Diagram(960, 470, 'Polling a live API with RxJS')
    d.text(30, 36, 'How AirQualityService.watch() behaves over time', size=18, weight='700', anchor='start')
    d.text(30, 58, 'Each row is an Observable. Time runs left to right (not to scale).', size=13, anchor='start', color=MUTED)

    x0, x1 = 250, 930
    T0, T30, R, T60 = 270, 470, 560, 760
    ys = [105, 170, 235, 315, 400]
    names = [('timer(0, 30 min)', 'ticks on a schedule'), ('refresh$', 'user clicks refresh'), ('merge(...)', 'either one'),
             ('switchMap(→ fetch)', 'one HTTP request per tick'), ('scan(...) → LiveState', 'what the UI sees')]
    for (n, desc), y in zip(names, ys):
        d.text(30, y + 4, n, size=13, mono=True, anchor='start')
        d.text(30, y + 21, desc, size=11.5, anchor='start', color=MUTED)
        d.line(x0 - 10, y, x1, y, color='#bdbdbd')

    purple, orange = '#5e35b1', ACCENT
    for x, l in [(T0, '0'), (T30, '1'), (T60, '2')]:
        d.circle(x, ys[0], 12, purple, label=l)
        d.circle(x, ys[2], 12, purple, label=l)
    d.circle(R, ys[1], 12, orange, label='r')
    d.circle(R, ys[2], 12, orange, label='r')

    # requests
    y = ys[3]
    def req(xa, xb, ok, note=None, color='#43a047', note_y=30):
        d.rect(xa, y - 9, xb - xa, 18, 'plain', rx=9, fill='#e8f5e9' if ok is True else ('#ffebee' if ok is False else '#f5f5f5'),
               stroke=color)
        if note:
            d.text((xa + xb) / 2, y + note_y, note, size=11, color=MUTED)
    req(T0, T0 + 50, True, 'ok')
    req(T30, R, None, 'cancelled by switchMap', color='#9e9e9e', note_y=-16)
    d.text(R - 1, y + 5, '✕', size=16, weight='700', color='#9e9e9e')
    req(R, R + 50, True, 'ok')
    req(T60, T60 + 40, False, color='#e53935')
    req(T60 + 55, T60 + 95, False, 'retry, retry… fails', color='#e53935')
    req(T60 + 110, T60 + 150, False, color='#e53935')

    # states
    y = ys[4]
    states = [(T0, 'loading', '#9e9e9e'), (T0 + 62, 'ready', '#43a047'), (T30, 'loading', '#9e9e9e'), (R, 'loading', '#9e9e9e'),
              (R + 62, 'ready', '#43a047'), (T60, 'loading', '#9e9e9e'), (T60 + 150, 'error', '#e53935')]
    for x, label, color in states:
        w = len(label) * 7.2 + 14
        d.rect(x - w / 2, y - 11, w, 22, 'plain', rx=11, fill=color, stroke=color)
        d.text(x, y + 4, label, size=11.5, weight='600', color='#ffffff')
    d.text(T60 + 150, y + 32, 'old scores kept', size=11, color=MUTED, italic=True)
    return d


def docker():
    d = Diagram(960, 400, 'A multi-stage Docker build')
    d.text(30, 36, 'The two stages of our Dockerfile', size=18, weight='700', anchor='start')

    d.rect(30, 60, 420, 320, 'lane', rx=12)
    d.text(50, 86, 'Stage 1: build   FROM node:24-alpine', size=13.5, weight='700', anchor='start')
    steps = ['COPY package.json package-lock.json', 'RUN npm ci', 'COPY . .', 'RUN npm run fetch-data', 'RUN npm run build']
    prev = None
    for i, s in enumerate(steps):
        b = d.box(240, 122 + i * 50, 370, 34, 'hot' if 'fetch-data' in s else 'tool', s, mono=True, title_size=12.5)
        if prev:
            d.connect(prev, b)
        prev = b
    d.text(240, 372, 'Left behind: Node.js, node_modules, source code', size=11.5, color=MUTED, italic=True)

    d.rect(610, 60, 320, 320, 'lane', rx=12)
    d.text(630, 86, 'Stage 2: serve   FROM nginx:alpine', size=13.5, weight='700', anchor='start')
    html = d.box(770, 200, 290, 70, 'file', '')
    d.text(770, 187, '/usr/share/nginx/html', size=13, weight='600')
    d.text(770, 206, 'index.html, main-*.js, …', size=11.5, color=MUTED, mono=True)
    d.text(770, 222, 'data/indicators.json', size=11.5, color=MUTED, mono=True)
    conf = d.box(770, 290, 290, 40, 'file', 'nginx.conf', title_size=13)
    d.path(f'M425,{122 + 4 * 50} C500,{122 + 4 * 50} 520,200 {html.left[0] - 2},200', color=ACCENT)
    d.text(530, 168, 'COPY --from=build', size=11.5, mono=True, color=ACCENT, anchor='middle')
    d.text(530, 183, 'dist/.../browser', size=11.5, mono=True, color=ACCENT, anchor='middle')
    d.text(770, 360, 'This image is what runs on the server.', size=11.5, color=MUTED, italic=True)
    return d


for name, fn in [('component-tree', component_tree), ('dependency-injection', dependency_injection),
                 ('observables-over-time', observables), ('signal-graph', signal_graph),
                 ('sharing-state', sharing_state), ('data-flow', data_flow), ('polling', polling), ('docker-stages', docker)]:
    fn().save(f'{OUT}/{name}.svg')
    print('wrote', name)
