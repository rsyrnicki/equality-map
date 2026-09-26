"""Tiny helper for drawing consistent tutorial diagrams as SVG."""
from html import escape

SANS = "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
MONO = "ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace"
INK = '#212121'
MUTED = '#616161'
LINE = '#757575'
ACCENT = '#ef6c00'

KINDS = {
    'component': ('#e3f2fd', '#1e88e5', False),
    'library': ('#fafafa', '#9e9e9e', True),
    'service': ('#e8f5e9', '#43a047', False),
    'external': ('#fff3e0', '#fb8c00', False),
    'file': ('#f3e5f5', '#8e24aa', False),
    'tool': ('#eceff1', '#546e7a', False),
    'signal': ('#e3f2fd', '#1e88e5', False),
    'computed': ('#ede7f6', '#5e35b1', False),
    'template': ('#fafafa', '#757575', True),
    'hot': ('#fff3e0', ACCENT, False),
    'plain': ('#ffffff', '#bdbdbd', False),
    'lane': ('#fafafa', '#e0e0e0', False),
}


class Box:
    def __init__(self, cx, cy, w, h):
        self.cx, self.cy, self.w, self.h = cx, cy, w, h

    @property
    def top(self): return (self.cx, self.cy - self.h / 2)
    @property
    def bottom(self): return (self.cx, self.cy + self.h / 2)
    @property
    def left(self): return (self.cx - self.w / 2, self.cy)
    @property
    def right(self): return (self.cx + self.w / 2, self.cy)

    def toward(self, x, y):
        """Point on this box's border on the straight line toward (x, y)."""
        dx, dy = x - self.cx, y - self.cy
        if dx == 0 and dy == 0:
            return (self.cx, self.cy)
        sx = (self.w / 2) / abs(dx) if dx else float('inf')
        sy = (self.h / 2) / abs(dy) if dy else float('inf')
        s = min(sx, sy)
        return (self.cx + dx * s, self.cy + dy * s)


class Diagram:
    def __init__(self, w, h, title):
        self.w, self.h, self.title = w, h, title
        self.els = []
        self.markers = {}

    def _marker(self, color):
        mid = 'arrow-' + color.lstrip('#')
        self.markers[mid] = color
        return mid

    def text(self, x, y, s, size=13, weight='normal', anchor='middle', color=INK, mono=False, italic=False):
        style = ' font-style="italic"' if italic else ''
        self.els.append(
            f'<text x="{x:.1f}" y="{y:.1f}" font-family="{MONO if mono else SANS}" font-size="{size}" '
            f'font-weight="{weight}" text-anchor="{anchor}" fill="{color}"{style}>{escape(s)}</text>'
        )

    def rect(self, x, y, w, h, kind='plain', rx=10, dashed=None, fill=None, stroke=None):
        f, st, dash = KINDS[kind]
        dash = dash if dashed is None else dashed
        d = ' stroke-dasharray="5 4"' if dash else ''
        self.els.append(
            f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="{rx}" '
            f'fill="{fill or f}" stroke="{stroke or st}" stroke-width="1.5"{d}/>'
        )

    def box(self, cx, cy, w, h, kind, title, sub=None, mono=False, tag=None, title_size=14):
        self.rect(cx - w / 2, cy - h / 2, w, h, kind, rx=8)
        if sub:
            self.text(cx, cy - 3, title, size=title_size, weight='600', mono=mono)
            self.text(cx, cy + 14, sub, size=11.5, color=MUTED, mono=True)
        else:
            self.text(cx, cy + 5, title, size=title_size, weight='600' if not mono else 'normal', mono=mono)
        if tag:
            tw = len(tag) * 6.4 + 12
            self.rect(cx + w / 2 - tw + 6, cy - h / 2 - 9, tw, 18, 'hot', rx=9, fill=ACCENT, stroke=ACCENT)
            self.text(cx + w / 2 - tw / 2 + 6, cy - h / 2 + 4, tag, size=10.5, weight='600', color='#ffffff')
        return Box(cx, cy, w, h)

    def line(self, x1, y1, x2, y2, color=LINE, arrow=True, dashed=False, width=1.5):
        m = f' marker-end="url(#{self._marker(color)})"' if arrow else ''
        d = ' stroke-dasharray="5 4"' if dashed else ''
        self.els.append(
            f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{color}" '
            f'stroke-width="{width}"{d}{m}/>'
        )

    def path(self, d, color=LINE, arrow=True, dashed=False, width=1.5):
        m = f' marker-end="url(#{self._marker(color)})"' if arrow else ''
        da = ' stroke-dasharray="5 4"' if dashed else ''
        self.els.append(f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{width}"{da}{m}/>')

    def connect(self, a, b, color=LINE, dashed=False, label=None, label_offset=(0, -6), label_color=None, gap=2):
        x1, y1 = a.toward(b.cx, b.cy)
        x2, y2 = b.toward(a.cx, a.cy)
        # pull the end back a little so the arrowhead doesn't overlap the border
        import math
        L = math.hypot(x2 - x1, y2 - y1) or 1
        x2 -= (x2 - x1) / L * gap
        y2 -= (y2 - y1) / L * gap
        self.line(x1, y1, x2, y2, color=color, dashed=dashed)
        if label:
            self.text((x1 + x2) / 2 + label_offset[0], (y1 + y2) / 2 + label_offset[1], label, size=11.5,
                      color=label_color or MUTED, mono=True)

    def elbow(self, a, b, color=LINE, dashed=False):
        """Parent-bottom to child-top connector with a horizontal middle segment (for trees)."""
        x1, y1 = a.bottom
        x2, y2 = b.top
        mid = (y1 + y2) / 2
        self.path(f'M{x1:.1f},{y1:.1f} V{mid:.1f} H{x2:.1f} V{y2 - 2:.1f}', color=color, dashed=dashed)

    def circle(self, x, y, r, fill, stroke=None, label=None, label_color='#ffffff', size=11):
        self.els.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="{fill}" stroke="{stroke or fill}" stroke-width="1.5"/>')
        if label is not None:
            self.text(x, y + size * 0.36, label, size=size, weight='600', color=label_color)

    def legend(self, x, y, items, gap=24):
        """items: list of (kind, label). Laid out left to right."""
        cx = x
        for kind, label in items:
            if kind == 'hot-line':
                self.line(cx, y, cx + 22, y, color=ACCENT, arrow=False, width=2.5)
            else:
                self.rect(cx, y - 8, 22, 16, kind, rx=4)
            self.text(cx + 30, y + 4, label, size=12, anchor='start', color=MUTED)
            cx += 30 + len(label) * 6.6 + gap

    def save(self, path):
        defs = ''.join(
            f'<marker id="{mid}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" '
            f'orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="{color}"/></marker>'
            for mid, color in self.markers.items()
        )
        svg = (
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {self.w} {self.h}" width="{self.w}" '
            f'height="{self.h}" role="img" aria-label="{escape(self.title)}">\n'
            f'<title>{escape(self.title)}</title>\n<defs>{defs}</defs>\n'
            # An explicit white card, so the diagram stays readable on dark-themed viewers too.
            f'<rect x="0.5" y="0.5" width="{self.w - 1}" height="{self.h - 1}" rx="12" fill="#ffffff" stroke="#e0e0e0"/>\n'
            + '\n'.join(self.els)
            + '\n</svg>\n'
        )
        with open(path, 'w') as f:
            f.write(svg)
