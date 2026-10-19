#!/usr/bin/env python3
"""Render the profile README's notebook pages: the hero and one hand-drawn-style sketch per project.

Every page is a strip of ruled exercise-book paper with a red margin line, drawn in large type so it
stays readable on a phone (smallest text 24 units in a 720-wide viewBox ≈ 12px at 358px). The
pages are static (no API calls), so run this locally after changing a fact on one of them:

    python scripts/render_profile_notebook.py

Writes assets/profile/<page>.{light,dark}.svg. Backgrounds are transparent, so the pages sit on
GitHub's own page colour in light, dark and dimmed themes.
"""
from __future__ import annotations

from pathlib import Path
from xml.sax.saxutils import escape

OUT = Path("assets/profile")
W = 720
RULE = 36  # ruled-line spacing
MARGIN_X = 70  # the red margin line of an exercise book
X = 92  # where writing starts

SERIF = "Georgia, 'Noto Serif', 'DejaVu Serif', 'Times New Roman', serif"
MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, 'DejaVu Sans Mono', monospace"

THEMES = {
    "light": {"ink": "#1f2328", "muted": "#59636e", "rule": "#d6e2ef", "margin": "#e3a090", "accent": "#b83a22",
              "box": "#8c959f", "merged": "#8250df", "open": "#1a7f37", "draft": "#59636e", "closed": "#cf222e"},
    "dark": {"ink": "#f0f6fc", "muted": "#9198a1", "rule": "#232e3b", "margin": "#6e3326", "accent": "#ff7b5c",
             "box": "#656c76", "merged": "#a371f7", "open": "#3fb950", "draft": "#9198a1", "closed": "#f85149"},
}


class Page:
    """One notebook page; `h` is a whole number of ruled lines."""

    def __init__(self, t: dict, lines: int, title: str):
        self.t, self.h, self.title = t, lines * RULE + RULE // 2, title
        self.parts: list[str] = []
        for y in range(RULE, self.h, RULE):
            self.parts.append(f'<path d="M0 {y}H{W}" stroke="{t["rule"]}" stroke-width="1"/>')
        self.parts.append(f'<path d="M{MARGIN_X} 0V{self.h}" stroke="{t["margin"]}" stroke-width="2"/>')

    def text(self, x, y, s, *, size=24, fill="ink", family=MONO, weight=None, italic=False, anchor=None, extra=""):
        attrs = f'x="{x}" y="{y}" fill="{self.t[fill]}" font-family="{family}" font-size="{size}"'
        attrs += f' font-weight="{weight}"' if weight else ""
        attrs += ' font-style="italic"' if italic else ""
        attrs += f' text-anchor="{anchor}"' if anchor else ""
        self.parts.append(f"<text {attrs}{extra}>{escape(s)}</text>")

    def heading(self, s: str, line: int = 2):
        self.text(X, line * RULE, s, size=48, family=SERIF, weight="700")

    def stamp(self, label: str, right: int = W - 24, y: int = 22):
        """A rubber stamp, slightly crooked, in the top-right corner."""
        size = 24
        w = int(len(label) * size * 0.62) + 28
        x = right - w
        self.parts.append(
            f'<g transform="rotate(-4 {x + w / 2} {y + 22})">'
            f'<rect x="{x}" y="{y}" width="{w}" height="44" rx="4" fill="none" stroke="{self.t["accent"]}" stroke-width="3"/>'
            f'<text x="{x + w / 2}" y="{y + 30}" fill="{self.t["accent"]}" font-family="{MONO}" font-size="{size}" '
            f'font-weight="700" text-anchor="middle" letter-spacing="1">{escape(label)}</text></g>'
        )

    def box(self, x, y, w, h=40, *, dashed=False):
        dash = ' stroke-dasharray="6 5"' if dashed else ""
        self.parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="6" fill="none" stroke="{self.t["box"]}" stroke-width="2"{dash}/>')

    def arrow(self, x1, y1, x2, y2, colour="muted"):
        c = self.t[colour]
        self.parts.append(f'<path d="M{x1} {y1}L{x2} {y2}" stroke="{c}" stroke-width="2" stroke-linecap="round"/>')
        if x1 == x2:  # down
            self.parts.append(f'<path d="M{x2 - 6} {y2 - 8}L{x2} {y2}L{x2 + 6} {y2 - 8}" fill="none" stroke="{c}" stroke-width="2" stroke-linecap="round"/>')
        else:  # right
            self.parts.append(f'<path d="M{x2 - 8} {y2 - 6}L{x2} {y2}L{x2 - 8} {y2 + 6}" fill="none" stroke="{c}" stroke-width="2" stroke-linecap="round"/>')

    def checkbox(self, x, y, done: bool):
        self.parts.append(f'<rect x="{x}" y="{y - 20}" width="22" height="22" rx="3" fill="none" stroke="{self.t["box"]}" stroke-width="2"/>')
        if done:
            self.parts.append(f'<path d="M{x + 3} {y - 9}l6 7 13-16" fill="none" stroke="{self.t["accent"]}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>')

    def svg(self) -> str:
        return (
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {self.h}" width="{W}" height="{self.h}" role="img" aria-labelledby="t">'
            f'<title id="t">{escape(self.title)}</title>' + "".join(self.parts) + "</svg>"
        )


def hero(t: dict) -> str:
    p = Page(t, 8, "Joel Jigo: Build things. Make them hold up.")
    p.stamp("STILL LEARNING", y=18)
    p.text(X, 4 * RULE, "Joel Jigo", size=88, family=SERIF, weight="700", extra=' letter-spacing="-1.5"')
    p.parts.append(
        f'<text x="{X + 2}" y="{6 * RULE}" fill="{t["ink"]}" font-family="{SERIF}" font-size="40">Build things. Make them '
        f'<tspan fill="{t["accent"]}" font-style="italic">hold up.</tspan></text>'
    )
    p.text(X + 2, 8 * RULE, "cse student · kochi, india", fill="muted")
    return p.svg()


def kio(t: dict) -> str:
    p = Page(t, 9, "KIO convergence gates: C-1 context, C-2 registry and C-3 planning ticked, C-4 response next, C-7 plug in AURA later.")
    p.heading("KIO")
    p.stamp("BUILDING")
    rows = [("C-1  context", True), ("C-2  registry", True), ("C-3  planning", True), ("C-4  response", False)]
    for i, (label, done) in enumerate(rows):
        y = (3 + i) * RULE + 28
        p.checkbox(X, y, done)
        p.text(X + 38, y, label, size=26)
    p.text(X + 290, 6 * RULE + 28, "← next up", size=26, family=SERIF, italic=True, fill="accent")
    p.text(X + 38, 7 * RULE + 28, "⋮", size=26, fill="muted")
    p.checkbox(X, 8 * RULE + 28, False)
    p.text(X + 38, 8 * RULE + 28, "C-7  plug in AURA", size=26, fill="muted")
    p.text(W - 30, 3 * RULE + 28, "phase 0:", size=24, family=SERIF, italic=True, fill="muted", anchor="end")
    p.text(W - 30, 4 * RULE + 28, "deleted 5,167 lines", size=24, family=SERIF, italic=True, fill="muted", anchor="end")
    return p.svg()


def uea(t: dict) -> str:
    p = Page(t, 12, "UEA: a task goes to a keyword classifier, then a specialist, then verify; unknown tasks go to an optional local model. Verification tiers minimal, standard, strict, security, full.")
    p.heading("UEA")
    p.stamp("ALPHA")
    steps = ["task", "keyword classifier", "specialist", "verify"]
    y = 2 * RULE + 20
    for i, s in enumerate(steps):
        w = int(len(s) * 24 * 0.62) + 32
        p.box(X, y, w)
        p.text(X + 16, y + 28, s)
        if i == 1:
            p.arrow(X + w + 8, y + 20, X + w + 56, y + 20, "accent")
            p.text(X + w + 64, y + 28, "unknown?", size=24, family=SERIF, italic=True, fill="accent")
            p.text(X + w + 64, y + 56, "ask a small local model", size=24, family=SERIF, italic=True, fill="accent")
        if i < len(steps) - 1:
            p.arrow(X + 24, y + 42, X + 24, y + 66)
        y += 72
    p.text(X, 11 * RULE + 4, "tiers: minimal → standard → strict", size=24, fill="muted")
    p.text(X, 12 * RULE + 4, "       → security → full", size=24, fill="muted")
    return p.svg()


def aura(t: dict) -> str:
    p = Page(t, 9, "AURA: working, episodic and semantic memory, plus beliefs, goals and reasoning traces, behind a FastAPI service. Built, not verified; last worked on in June 2026.")
    p.heading("AURA")
    p.stamp("BUILT · NOT VERIFIED")
    layers = ["working memory", "episodic memory", "semantic memory"]
    for i, s in enumerate(layers):
        y = (2 + i) * RULE + 22 + i * 8
        p.box(X + i * 18, y, 300 - i * 36)
        p.text(X + i * 18 + 16, y + 28, s)
    side = ["+ beliefs", "+ goals", "+ reasoning traces"]
    for i, s in enumerate(side):
        p.text(X + 340, (3 + i) * RULE + 6, s, fill="muted")
    p.box(X, 6 * RULE + 20, 300, dashed=True)
    p.text(X + 16, 6 * RULE + 48, "FastAPI service")
    p.text(X, 8 * RULE + 20, "last touched in June 2026", size=24, family=SERIF, italic=True, fill="accent")
    p.text(X, 9 * RULE + 12, "joins KIO at gate C-7", size=24, family=SERIF, italic=True, fill="muted")
    return p.svg()


def ghops(t: dict) -> str:
    p = Page(t, 10, "gh-ops: six jobs, daily, monitoring, weekly-report, oss-hunt, security and status, through one dispatcher, sending a Telegram ping only when something happened. Frozen after 1,495 tests.")
    p.heading("gh-ops")
    p.stamp("FROZEN")
    jobs = [["daily", "monitoring", "weekly-report"], ["oss-hunt", "security", "status"]]
    for r, row in enumerate(jobs):
        x = X
        y = (2 + r) * RULE + 18 + r * 14
        for job in row:
            w = int(len(job) * 24 * 0.62) + 28
            p.parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="38" rx="19" fill="none" stroke="{t["box"]}" stroke-width="2"/>')
            p.text(x + 14, y + 27, job)
            x += w + 12
    p.arrow(X + 24, 4 * RULE + 34, X + 24, 5 * RULE + 20)
    p.text(X + 50, 6 * RULE - 6, "one dispatcher, same in CI and locally", size=24)
    p.arrow(X + 24, 6 * RULE + 4, X + 24, 7 * RULE)
    p.text(X + 50, 7 * RULE + 30, "Telegram ping, only if something happened", size=24)
    p.text(X, 9 * RULE + 20, "1,495 tests, then I froze it", size=24, family=SERIF, italic=True, fill="accent")
    return p.svg()


def pipo(t: dict) -> str:
    p = Page(t, 11, "Pipo's loop: you close the app, time passes, he builds, naps and heads out, you open it and he tells you what happened. No account, no analytics. Shipped as a v1.0 APK.")
    p.heading("Pipo")
    p.stamp("SHIPPED · v1.0")
    loop = ["you close the app", "time passes", "he builds, naps, heads out", "you come back: he tells you"]
    y = 2 * RULE + 20
    for i, s in enumerate(loop):
        w = int(len(s) * 24 * 0.62) + 32
        p.box(X, y, w)
        p.text(X + 16, y + 28, s)
        if i < len(loop) - 1:
            p.arrow(X + 24, y + 42, X + 24, y + 66)
        y += 72
    # The loop closes: from the last step back up to the first.
    p.parts.append(
        f'<path d="M{X + 470} {y - 52}H{W - 40}V{2 * RULE + 40}H{X + 300}" fill="none" stroke="{t["accent"]}" '
        f'stroke-width="2" stroke-dasharray="6 6" stroke-linecap="round"/>'
        f'<path d="M{X + 308} {2 * RULE + 34}L{X + 300} {2 * RULE + 40}L{X + 308} {2 * RULE + 46}" fill="none" stroke="{t["accent"]}" stroke-width="2"/>'
    )
    p.text(X, 11 * RULE + 4, "no account, no analytics: a robot and a JSON file", size=24, family=SERIF, italic=True, fill="muted")
    return p.svg()


TALLY = [("merged", 12), ("open", 17), ("draft", 7), ("closed", 15)]


def tally(t: dict) -> str:
    p = Page(t, 8, "Pull requests to other people's repositories as of 19 October 2026, as tally marks: 12 merged, 17 open, 7 draft, 15 closed without merging.")
    p.heading("other people's code")
    p.stamp("19 OCT 2026", y=7 * RULE + 6)
    for i, (label, n) in enumerate(TALLY):
        y = (3 + i) * RULE + 30
        p.text(X, y, label, fill=label)
        p.text(X + 170, y, str(n), weight="700")
        x = X + 230
        c = t[label]
        for g in range(0, n, 5):
            k = min(5, n - g)
            for j in range(min(k, 4)):
                xx = x + j * 11
                p.parts.append(f'<path d="M{xx} {y - 22}L{xx + 2} {y + 2}" stroke="{c}" stroke-width="3" stroke-linecap="round"/>')
            if k == 5:
                p.parts.append(f'<path d="M{x - 6} {y - 4}L{x + 40} {y - 16}" stroke="{c}" stroke-width="3" stroke-linecap="round"/>')
            x += 62
    p.text(X, 8 * RULE + 4, "across 30 repos that aren't mine", size=24, family=SERIF, italic=True, fill="muted")
    return p.svg()


PAGES = {"hero": hero, "pipo": pipo, "kio": kio, "uea": uea, "aura": aura, "ghops": ghops, "tally": tally}


def main() -> None:
    files = {f"{name}.{theme}.svg": draw(t) for name, draw in PAGES.items() for theme, t in THEMES.items()}
    OUT.mkdir(parents=True, exist_ok=True)
    for filename, svg in files.items():
        (OUT / filename).write_text(svg, encoding="utf-8")


if __name__ == "__main__":
    main()
