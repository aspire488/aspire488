#!/usr/bin/env python3
"""Render the profile README's notebook pages: the hero and one hand-drawn-style sketch per project.

Every page is a strip of ruled exercise-book paper with a red margin line, drawn in large type so it
stays readable on a phone (smallest text 24 units in a 720-wide viewBox ≈ 12px at 358px).

    python scripts/render_profile_notebook.py

The project pages are static. The tally page counts pull requests to other people's repositories
live from the GitHub API, so it is only redrawn when GITHUB_TOKEN is set (the hourly workflow sets it);
without a token the committed tally is left alone. Nothing is written unless every page rendered.

The pages animate once when they load (stamps thump down, ticks and arrows draw in, boxes pop up;
Pipo's loop keeps flowing). The finished drawing is the resting state, and all motion stops under
prefers-reduced-motion. Backgrounds are transparent, so the pages sit on GitHub's own page colour.
"""
from __future__ import annotations

import datetime as dt
import json
import os
import urllib.request
from pathlib import Path
from xml.sax.saxutils import escape

LOGIN = "aspire488"
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

# Load-in motion. Each animated element carries its own delay; "both" keeps it hidden until its turn,
# and the keyframes end on the element's normal look, so a frozen or reduced-motion render is complete.
STYLE = (
    "<style>"
    ".pop{animation:pop .45s ease-out both}"
    "@keyframes pop{from{opacity:0;transform:translateY(8px)}}"
    ".draw{stroke-dasharray:1;animation:draw .5s ease-out both}"
    "@keyframes draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}"
    ".stamp{transform-box:fill-box;transform-origin:center;animation:stamp .35s cubic-bezier(.3,1.6,.5,1) both}"
    "@keyframes stamp{from{opacity:0;transform:scale(1.8)}}"
    ".flow{animation:flow 1.2s linear infinite}"
    "@keyframes flow{to{stroke-dashoffset:-24}}"
    ".nudge{animation:nudge 1.1s ease-in-out infinite alternate}"
    "@keyframes nudge{to{transform:translateX(-7px)}}"
    "@media (prefers-reduced-motion:reduce){*{animation:none!important}}"
    "</style>"
)


def anim(cls: str, delay: float) -> str:
    return f' class="{cls}" style="animation-delay:{delay:.2f}s"'


class Page:
    """One notebook page; `h` is a whole number of ruled lines."""

    def __init__(self, t: dict, lines: int, title: str):
        self.t, self.h, self.title = t, lines * RULE + RULE // 2, title
        self.parts: list[str] = []
        for y in range(RULE, self.h, RULE):
            self.parts.append(f'<path d="M0 {y}H{W}" stroke="{t["rule"]}" stroke-width="1"/>')
        self.parts.append(f'<path d="M{MARGIN_X} 0V{self.h}" stroke="{t["margin"]}" stroke-width="2"/>')

    def text(self, x, y, s, *, size=24, fill="ink", family=MONO, weight=None, italic=False, anchor=None, extra="", delay=None):
        attrs = f'x="{x}" y="{y}" fill="{self.t[fill]}" font-family="{family}" font-size="{size}"'
        attrs += f' font-weight="{weight}"' if weight else ""
        attrs += ' font-style="italic"' if italic else ""
        attrs += f' text-anchor="{anchor}"' if anchor else ""
        attrs += anim("pop", delay) if delay is not None else ""
        self.parts.append(f"<text {attrs}{extra}>{escape(s)}</text>")

    def heading(self, s: str, line: int = 2):
        self.text(X, line * RULE, s, size=48, family=SERIF, weight="700", delay=0)

    def stamp(self, label: str, right: int = W - 24, y: int = 22, delay: float = 0.9):
        """A rubber stamp, slightly crooked, thumped down after the page has drawn."""
        size = 24
        w = int(len(label) * size * 0.62) + 28
        x = right - w
        self.parts.append(
            f'<g transform="rotate(-4 {x + w / 2} {y + 22})"><g{anim("stamp", delay)}>'
            f'<rect x="{x}" y="{y}" width="{w}" height="44" rx="4" fill="none" stroke="{self.t["accent"]}" stroke-width="3"/>'
            f'<text x="{x + w / 2}" y="{y + 30}" fill="{self.t["accent"]}" font-family="{MONO}" font-size="{size}" '
            f'font-weight="700" text-anchor="middle" letter-spacing="1">{escape(label)}</text></g></g>'
        )

    def box(self, x, y, w, h=40, *, dashed=False, rx=6, delay=None):
        dash = ' stroke-dasharray="6 5"' if dashed else ""
        a = anim("pop", delay) if delay is not None else ""
        self.parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="none" stroke="{self.t["box"]}" stroke-width="2"{dash}{a}/>')

    def line(self, d: str, colour: str, width: float = 2, delay: float = 0):
        self.parts.append(
            f'<path d="{d}" pathLength="1" fill="none" stroke="{self.t[colour]}" stroke-width="{width}" '
            f'stroke-linecap="round" stroke-linejoin="round"{anim("draw", delay)}/>'
        )

    def arrow(self, x1, y1, x2, y2, colour="muted", delay=0.0):
        self.line(f"M{x1} {y1}L{x2} {y2}", colour, delay=delay)
        head = f"M{x2 - 6} {y2 - 8}L{x2} {y2}L{x2 + 6} {y2 - 8}" if x1 == x2 else f"M{x2 - 8} {y2 - 6}L{x2} {y2}L{x2 - 8} {y2 + 6}"
        self.line(head, colour, delay=delay + 0.3)

    def checkbox(self, x, y, done: bool, delay: float):
        self.box(x, y - 20, 22, 22, rx=3, delay=delay)
        if done:
            self.line(f"M{x + 3} {y - 9}l6 7 13-16", "accent", width=3, delay=delay + 0.25)

    def svg(self) -> str:
        return (
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {self.h}" width="{W}" height="{self.h}" role="img" aria-labelledby="t">'
            f'<title id="t">{escape(self.title)}</title>{STYLE}' + "".join(self.parts) + "</svg>"
        )


def flowchart(p: Page, steps: list[str], y: int, start_delay: float = 0.2) -> list[tuple[int, int, int]]:
    """Boxes stacked top to bottom, joined by down arrows, popping in one after another."""
    boxes = []
    for i, s in enumerate(steps):
        d = start_delay + i * 0.3
        w = int(len(s) * 24 * 0.62) + 32
        p.box(X, y, w, delay=d)
        p.text(X + 16, y + 28, s, delay=d)
        boxes.append((X, y, w))
        if i < len(steps) - 1:
            p.arrow(X + 24, y + 42, X + 24, y + 66, delay=d + 0.15)
        y += 72
    return boxes


def hero(t: dict) -> str:
    p = Page(t, 8, "Joel Jigo: Build things. Make them hold up.")
    p.stamp("STILL LEARNING", y=18, delay=1.0)
    p.text(X, 4 * RULE, "Joel Jigo", size=88, family=SERIF, weight="700", extra=' letter-spacing="-1.5"', delay=0)
    p.parts.append(
        f'<text x="{X + 2}" y="{6 * RULE}" fill="{t["ink"]}" font-family="{SERIF}" font-size="40"{anim("pop", 0.3)}>'
        f'Build things. Make them <tspan fill="{t["accent"]}" font-style="italic">hold up.</tspan></text>'
    )
    p.text(X + 2, 8 * RULE, "cse student · kochi, india", fill="muted", delay=0.6)
    return p.svg()


def pipo(t: dict) -> str:
    p = Page(t, 11, "Pipo's loop: you close the app, time passes, he builds, naps and heads out, you come back and he tells you what happened. No account, no analytics. Shipped as a v1.0 APK.")
    p.heading("Pipo")
    p.stamp("SHIPPED · v1.0", delay=1.6)
    flowchart(p, ["you close the app", "time passes", "he builds, naps, heads out", "you come back: he tells you"], 2 * RULE + 20)
    # The loop closes, from the last step back to the first, and keeps going round.
    p.parts.append(
        f'<path d="M{X + 470} {2 * RULE + 256}H{W - 40}V{2 * RULE + 40}H{X + 300}" fill="none" stroke="{t["accent"]}" '
        f'stroke-width="2" stroke-dasharray="6 6" stroke-linecap="round" class="flow"/>'
        f'<path d="M{X + 308} {2 * RULE + 34}L{X + 300} {2 * RULE + 40}L{X + 308} {2 * RULE + 46}" fill="none" stroke="{t["accent"]}" stroke-width="2"/>'
    )
    p.text(X, 11 * RULE + 4, "no account, no analytics: a robot and a JSON file", size=24, family=SERIF, italic=True, fill="muted", delay=1.4)
    return p.svg()


def kio(t: dict) -> str:
    p = Page(t, 9, "KIO convergence gates: C-1 context, C-2 registry and C-3 planning ticked, C-4 response next, C-7 plug in AURA later.")
    p.heading("KIO")
    p.stamp("BUILDING", delay=1.7)
    rows = [("C-1  context", True), ("C-2  registry", True), ("C-3  planning", True), ("C-4  response", False)]
    for i, (label, done) in enumerate(rows):
        y = (3 + i) * RULE + 28
        d = 0.2 + i * 0.3
        p.checkbox(X, y, done, d)
        p.text(X + 38, y, label, size=26, delay=d)
    p.parts.append(f'<g{anim("pop", 1.3)}><g class="nudge">')
    p.text(X + 290, 6 * RULE + 28, "← next up", size=26, family=SERIF, italic=True, fill="accent")
    p.parts.append("</g></g>")
    p.text(X + 38, 7 * RULE + 28, "⋮", size=26, fill="muted", delay=1.4)
    p.checkbox(X, 8 * RULE + 28, False, 1.5)
    p.text(X + 38, 8 * RULE + 28, "C-7  plug in AURA", size=26, fill="muted", delay=1.5)
    p.text(W - 30, 3 * RULE + 28, "phase 0:", size=24, family=SERIF, italic=True, fill="muted", anchor="end", delay=0.9)
    p.text(W - 30, 4 * RULE + 28, "deleted 5,167 lines", size=24, family=SERIF, italic=True, fill="muted", anchor="end", delay=1.0)
    return p.svg()


def uea(t: dict) -> str:
    p = Page(t, 12, "UEA: a task goes to a keyword classifier, then a specialist, then verify; unknown tasks go to an optional local model. Verification tiers minimal, standard, strict, security, full.")
    p.heading("UEA")
    p.stamp("ALPHA", delay=1.8)
    boxes = flowchart(p, ["task", "keyword classifier", "specialist", "verify"], 2 * RULE + 20)
    bx, by, bw = boxes[1]
    p.arrow(bx + bw + 8, by + 20, bx + bw + 56, by + 20, "accent", delay=0.9)
    p.text(bx + bw + 64, by + 28, "unknown?", size=24, family=SERIF, italic=True, fill="accent", delay=1.1)
    p.text(bx + bw + 64, by + 56, "ask a small local model", size=24, family=SERIF, italic=True, fill="accent", delay=1.2)
    p.text(X, 11 * RULE + 4, "tiers: minimal → standard → strict", size=24, fill="muted", delay=1.4)
    p.text(X, 12 * RULE + 4, "       → security → full", size=24, fill="muted", delay=1.5)
    return p.svg()


def aura(t: dict) -> str:
    p = Page(t, 9, "AURA: working, episodic and semantic memory, plus beliefs, goals and reasoning traces, behind a FastAPI service. Built, not verified; last worked on in June 2026.")
    p.heading("AURA")
    p.stamp("BUILT · NOT VERIFIED", delay=1.8)
    # The FastAPI base goes down first, then memory layers stack up on top of it.
    p.box(X, 6 * RULE + 20, 300, dashed=True, delay=0.2)
    p.text(X + 16, 6 * RULE + 48, "FastAPI service", delay=0.2)
    layers = ["working memory", "episodic memory", "semantic memory"]
    for i, s in enumerate(layers):
        y = (2 + i) * RULE + 22 + i * 8
        d = 0.9 - i * 0.3
        p.box(X + i * 18, y, 300 - i * 36, delay=d)
        p.text(X + i * 18 + 16, y + 28, s, delay=d)
    for i, s in enumerate(["+ beliefs", "+ goals", "+ reasoning traces"]):
        p.text(X + 340, (3 + i) * RULE + 6, s, fill="muted", delay=1.1 + i * 0.15)
    p.text(X, 8 * RULE + 20, "last touched in June 2026", size=24, family=SERIF, italic=True, fill="accent", delay=1.5)
    p.text(X, 9 * RULE + 12, "joins KIO at gate C-7", size=24, family=SERIF, italic=True, fill="muted", delay=1.6)
    return p.svg()


def ghops(t: dict) -> str:
    p = Page(t, 10, "gh-ops: six jobs, daily, monitoring, weekly-report, oss-hunt, security and status, through one dispatcher, sending a Telegram ping only when something happened. Frozen after 1,495 tests.")
    p.heading("gh-ops")
    p.stamp("FROZEN", delay=1.9)
    jobs = [["daily", "monitoring", "weekly-report"], ["oss-hunt", "security", "status"]]
    k = 0
    for r, row in enumerate(jobs):
        x = X
        y = (2 + r) * RULE + 18 + r * 14
        for job in row:
            d = 0.15 + k * 0.12
            w = int(len(job) * 24 * 0.62) + 28
            p.box(x, y, w, 38, rx=19, delay=d)
            p.text(x + 14, y + 27, job, delay=d)
            x += w + 12
            k += 1
    p.arrow(X + 24, 4 * RULE + 34, X + 24, 5 * RULE + 20, delay=0.9)
    p.text(X + 50, 6 * RULE - 6, "one dispatcher, same in CI and locally", size=24, delay=1.1)
    p.arrow(X + 24, 6 * RULE + 4, X + 24, 7 * RULE, delay=1.3)
    p.text(X + 50, 7 * RULE + 30, "Telegram ping, only if something happened", size=24, delay=1.5)
    p.text(X, 9 * RULE + 20, "1,495 tests, then I froze it", size=24, family=SERIF, italic=True, fill="accent", delay=1.7)
    return p.svg()


def rag(t: dict) -> str:
    p = Page(t, 10, "RAG Platform, building, foundation first: SQLite with FTS5, a local Qdrant store and a MiniLM embedding wrapper "
                    "are built but not wired together yet; MiniLM has only run against a stub. Planned on top: phase 4 ingest and chunk "
                    "(next up), phase 5 hybrid search with RRF, phase 6 generation with providers off by default. Egress off by default; "
                    "only /health so far.")
    p.heading("RAG Platform")
    p.stamp("BUILDING", delay=1.9)
    # A building drawn bottom-up: the solid slab is what exists, the dashed floors are the plan.
    p.box(X, 6 * RULE + 12, W - 30 - X, 56, delay=0.2)
    x = X + 16
    for i, s in enumerate(["SQLite + FTS5", "Qdrant", "MiniLM"]):
        d = 0.3 + i * 0.2
        p.checkbox(x, 7 * RULE + 13, True, d)
        p.text(x + 32, 7 * RULE + 13, s, delay=d)
        x += 32 + int(len(s) * 24 * 0.62) + 28
    floors = ["4  ingest + chunk", "5  hybrid search + RRF", "6  generate, providers off"]
    for i, s in enumerate(floors):
        y = 6 * RULE + 12 - (i + 1) * 40  # floors sit on the slab and on each other
        d = 1.0 + i * 0.25
        p.box(X, y, 440, dashed=True, delay=d)
        p.text(X + 16, y + 28, s, delay=d)
    p.text(W - 30, 4 * RULE + 32, "planned", size=24, family=SERIF, italic=True, fill="muted", anchor="end", delay=1.6)
    p.parts.append(f'<g{anim("pop", 1.7)}><g class="nudge">')
    p.text(W - 30, 6 * RULE - 12, "← next up", size=24, family=SERIF, italic=True, fill="accent", anchor="end")
    p.parts.append("</g></g>")
    p.text(X, 9 * RULE - 4, "built, but not wired together yet", size=24, family=SERIF, italic=True, fill="accent", delay=2.1)
    p.text(X, 10 * RULE - 4, "egress off by default · only /health so far", size=24, family=SERIF, italic=True, fill="muted", delay=2.2)
    return p.svg()


# ---------------------------------------------------------------- live tally

def fetch_upstream() -> tuple[dict, int]:
    """Count pull requests to repositories owned by others, by state."""
    query = """
    query($q:String!, $after:String) {
      search(query:$q, type:ISSUE, first:100, after:$after) {
        pageInfo { hasNextPage endCursor }
        nodes { ... on PullRequest { state isDraft repository { nameWithOwner owner { login } } } }
      }
    }
    """
    prs, after = [], None
    while True:
        payload = json.dumps({"query": query, "variables": {"q": f"is:pr author:{LOGIN}", "after": after}}).encode()
        req = urllib.request.Request(
            "https://api.github.com/graphql",
            data=payload,
            headers={
                "Authorization": f"bearer {os.environ['GITHUB_TOKEN']}",
                "Content-Type": "application/json",
                "User-Agent": "aspire488-profile-notebook",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=30) as response:
            body = json.load(response)
        if body.get("errors"):
            raise RuntimeError(body["errors"])
        page = body["data"]["search"]
        prs += [n for n in page["nodes"] if n]
        if not page["pageInfo"]["hasNextPage"]:
            break
        after = page["pageInfo"]["endCursor"]
    # A PR's repository is its base: PRs from my forks into other projects count, PRs into mine don't.
    external = [p for p in prs if p["repository"]["owner"]["login"].lower() != LOGIN.lower()]
    if not external:
        raise RuntimeError("search returned no upstream pull requests; keeping the last tally")
    counts = {"merged": 0, "open": 0, "draft": 0, "closed": 0}
    for p in external:
        if p["state"] == "MERGED":
            counts["merged"] += 1
        elif p["state"] == "OPEN":
            counts["draft" if p["isDraft"] else "open"] += 1
        else:
            counts["closed"] += 1
    return counts, len({p["repository"]["nameWithOwner"] for p in external})


def tally(t: dict, counts: dict, repos: int, today: dt.date) -> str:
    p = Page(t, 8, f"Pull requests to other people's repositories, redrawn hourly, as tally marks on {today.isoformat()}: "
                   f"{counts['merged']} merged, {counts['open']} open, {counts['draft']} draft, {counts['closed']} closed without merging, across {repos} repos.")
    p.heading("other people's code")
    p.stamp(f"UPDATED {today.day} {today.strftime('%b').upper()}", y=7 * RULE + 6, delay=2.6)
    k = 0
    for i, label in enumerate(("merged", "open", "draft", "closed")):
        n = counts[label]
        y = (3 + i) * RULE + 30
        p.text(X, y, label, fill=label, delay=0.1 + i * 0.1)
        p.text(X + 170, y, str(n), weight="700", delay=0.1 + i * 0.1)
        x = X + 230
        for g in range(0, n, 5):
            group = min(5, n - g)
            for j in range(min(group, 4)):
                xx = x + j * 11
                p.line(f"M{xx} {y - 22}L{xx + 2} {y + 2}", label, width=3, delay=0.3 + k * 0.03)
                k += 1
            if group == 5:
                p.line(f"M{x - 6} {y - 4}L{x + 40} {y - 16}", label, width=3, delay=0.3 + k * 0.03)
                k += 1
            x += 62
    p.text(X, 8 * RULE + 4, f"across {repos} repos that aren't mine", size=24, family=SERIF, italic=True, fill="muted", delay=2.2)
    return p.svg()


PAGES = {"hero": hero, "pipo": pipo, "kio": kio, "uea": uea, "aura": aura, "rag": rag, "ghops": ghops}


def main() -> None:
    files = {f"{name}.{theme}.svg": draw(t) for name, draw in PAGES.items() for theme, t in THEMES.items()}
    if os.environ.get("GITHUB_TOKEN"):
        counts, repos = fetch_upstream()
        today = dt.datetime.now(dt.timezone.utc).date()
        files.update({f"tally.{theme}.svg": tally(t, counts, repos, today) for theme, t in THEMES.items()})
    OUT.mkdir(parents=True, exist_ok=True)
    for filename, svg in files.items():
        (OUT / filename).write_text(svg, encoding="utf-8")


if __name__ == "__main__":
    main()
