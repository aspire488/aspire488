#!/usr/bin/env python3
"""Render the Field Atlas plates used by the profile README.

atlas.*     hero map: projects as survey stations, live commit recency, upstream PR coastline
upstream.*  ledger of external pull requests by state (merged / open / draft / closed)
systems.*   static diagrams of KIO + AURA, UEA and gh-ops

Live data comes from the GitHub GraphQL API. Nothing is written unless every query succeeds,
so a failed refresh leaves the last good plates in place.
"""
from __future__ import annotations

import datetime as dt
import json
import math
import os
import urllib.request
from pathlib import Path
from xml.sax.saxutils import escape

LOGIN = "aspire488"
OUT = Path("assets/profile")
ACTIVE_DAYS = 14

SERIF = "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'Times New Roman', serif"
MONO = "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace"

# Primer-aligned so the plates sit beside the generated profile cards in either theme.
DARK = {
    "bg": "#0d1117", "fg": "#e6edf3", "muted": "#8b949e", "line": "#30363d", "faint": "#21262d",
    "contour": "#2b3138", "accent": "#f0883e", "accent_soft": "#3d2817",
    "merged": "#a371f7", "open": "#3fb950", "draft": "#8b949e", "closed": "#f85149",
}
LIGHT = {
    "bg": "#ffffff", "fg": "#1f2328", "muted": "#59636e", "line": "#d1d9e0", "faint": "#eff2f5",
    "contour": "#dfe4ea", "accent": "#bc4c00", "accent_soft": "#fff1e5",
    "merged": "#8250df", "open": "#1a7f37", "draft": "#818b98", "closed": "#cf222e",
}

# Curated: what each project is and how mature it is. Dates and release tags come from the API.
# kind: shipped | building | alpha | frozen | paused
STATIONS = [
    # repo, label, kind, note, x, y, anchor
    ("Kio", "KIO", "building", "gated runtime", 600, 262, "start"),
    ("AURA", "AURA", "paused", "memory runtime", 516, 352, "start"),
    ("Universal-Engineering-Augmentation", "UEA", "alpha", "public alpha", 742, 304, "start"),
    ("gh-ops", "gh-ops", "frozen", "maintenance", 930, 360, "end"),
    ("oss-atlas", "OSS Atlas", "building", "OSS ledger", 930, 214, "end"),
    ("campus-bus", "Campus Bus", "shipped", "release", 520, 470, "start"),
    ("Pipo", "Pipo", "shipped", "release", 690, 520, "start"),
    ("medimind", "MediMind", "frozen", "prototype", 930, 452, "end"),
    ("codeflow", "CodeFlow", "frozen", "prototype", 930, 528, "end"),
]


def graphql(query: str, variables: dict | None = None) -> dict:
    payload = json.dumps({"query": query, "variables": variables or {}}).encode()
    req = urllib.request.Request(
        "https://api.github.com/graphql",
        data=payload,
        headers={
            "Authorization": f"bearer {os.environ['GITHUB_TOKEN']}",
            "Accept": "application/vnd.github+json",
            "Content-Type": "application/json",
            "User-Agent": "aspire488-profile-atlas",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as response:
        body = json.load(response)
    if body.get("errors"):
        raise RuntimeError(body["errors"])
    return body["data"]


def fetch_repos() -> dict:
    fields = []
    for i, (repo, *_rest) in enumerate(STATIONS):
        fields.append(
            f'r{i}: repository(owner:"{LOGIN}", name:"{repo}") {{'
            " defaultBranchRef { target { ... on Commit { committedDate } } }"
            " releases(first:1, orderBy:{field:CREATED_AT, direction:DESC}) { nodes { tagName } } }"
        )
    data = graphql("query {" + " ".join(fields) + "}")
    repos = {}
    for i, (repo, *_rest) in enumerate(STATIONS):
        node = data[f"r{i}"]
        target = (node.get("defaultBranchRef") or {}).get("target") or {}
        releases = node["releases"]["nodes"]
        repos[repo] = {
            "committed": dt.datetime.fromisoformat(target["committedDate"].replace("Z", "+00:00")),
            "release": releases[0]["tagName"] if releases else None,
        }
    return repos


def fetch_prs() -> list[dict]:
    query = """
    query($q:String!, $after:String) {
      search(query:$q, type:ISSUE, first:100, after:$after) {
        pageInfo { hasNextPage endCursor }
        nodes { ... on PullRequest {
          number title url state isDraft createdAt mergedAt
          repository { nameWithOwner owner { login } }
        } }
      }
    }
    """
    prs, after = [], None
    while True:
        page = graphql(query, {"q": f"is:pr author:{LOGIN}", "after": after})["search"]
        prs += [n for n in page["nodes"] if n]
        if not page["pageInfo"]["hasNextPage"]:
            break
        after = page["pageInfo"]["endCursor"]
    # Upstream only: PRs into my own repositories and forks are not contributions to other projects.
    external = [p for p in prs if p["repository"]["owner"]["login"].lower() != LOGIN.lower()]
    for p in external:
        if p["state"] == "MERGED":
            p["status"] = "merged"
        elif p["state"] == "OPEN":
            p["status"] = "draft" if p["isDraft"] else "open"
        else:
            p["status"] = "closed"
    return sorted(external, key=lambda p: p["createdAt"])


def fmt_day(d: dt.datetime | dt.date) -> str:
    return f"{d.strftime('%b')} {d.day}"


def svg_open(w: int, h: int, t: dict, title: str, desc: str) -> list[str]:
    return [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img" aria-labelledby="t d">',
        f'<title id="t">{escape(title)}</title><desc id="d">{escape(desc)}</desc>',
        "<style>"
        ".pulse{transform-box:fill-box;transform-origin:center;animation:pulse 2.8s ease-out infinite}"
        "@keyframes pulse{0%{transform:scale(1);opacity:.75}100%{transform:scale(3.2);opacity:0}}"
        ".flow{animation:flow 2.4s linear infinite}"
        "@keyframes flow{to{stroke-dashoffset:-20}}"
        ".rise{animation:rise .9s ease-out both}"
        "@keyframes rise{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}"
        "@media (prefers-reduced-motion:reduce){.pulse,.flow,.rise{animation:none}}"
        "</style>",
        f'<rect width="{w}" height="{h}" fill="{t["bg"]}"/>',
        f'<rect x=".5" y=".5" width="{w - 1}" height="{h - 1}" rx="6" fill="none" stroke="{t["line"]}"/>',
    ]


def text(x, y, s, t, *, size=14, fill="fg", family=MONO, weight=None, anchor=None, spacing=None, italic=False, cls=None) -> str:
    attrs = [f'x="{x}"', f'y="{y}"', f'fill="{t[fill]}"', f'font-family="{family}"', f'font-size="{size}"']
    if weight:
        attrs.append(f'font-weight="{weight}"')
    if anchor:
        attrs.append(f'text-anchor="{anchor}"')
    if spacing:
        attrs.append(f'letter-spacing="{spacing}"')
    if italic:
        attrs.append('font-style="italic"')
    if cls:
        attrs.append(f'class="{cls}"')
    return f"<text {' '.join(attrs)}>{escape(s)}</text>"


def plate_header(w: int, t: dict, left: str, right: str) -> list[str]:
    return [
        text(28, 30, left, t, size=12, fill="muted", spacing="2.4"),
        text(w - 28, 30, right, t, size=12, fill="muted", spacing="1.6", anchor="end"),
        f'<path d="M0 46H{w}" stroke="{t["line"]}"/>',
    ]


def contour_ring(cx: float, cy: float, r: float, seed: float, squash: float = 0.72) -> str:
    pts = []
    for i in range(48):
        a = 2 * math.pi * i / 48
        wobble = 1 + 0.13 * math.sin(3 * a + seed) + 0.07 * math.sin(5 * a + seed * 1.7) + 0.04 * math.cos(7 * a + seed * 0.3)
        pts.append((cx + r * wobble * math.cos(a), cy + r * wobble * squash * math.sin(a)))
    d = f"M{pts[0][0]:.1f} {pts[0][1]:.1f}"
    for i in range(len(pts)):
        p1, p2 = pts[(i + 1) % len(pts)], pts[(i + 2) % len(pts)]
        mid = ((p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2)
        d += f"Q{p1[0]:.1f} {p1[1]:.1f} {mid[0]:.1f} {mid[1]:.1f}"
    return d + "Z"


def station_glyph(x: int, y: int, kind: str, active: bool, t: dict) -> list[str]:
    out = []
    if active:
        out.append(f'<circle class="pulse" cx="{x}" cy="{y}" r="7" fill="none" stroke="{t["accent"]}" stroke-width="1.5"/>')
    if kind == "shipped":
        out.append(f'<circle cx="{x}" cy="{y}" r="7.5" fill="{t["accent"]}"/>')
        out.append(f'<circle cx="{x}" cy="{y}" r="11.5" fill="none" stroke="{t["accent"]}" stroke-width="1"/>')
    elif kind in ("building", "alpha"):
        out.append(f'<circle cx="{x}" cy="{y}" r="7.5" fill="{t["bg"]}" stroke="{t["accent"]}" stroke-width="2"/>')
        out.append(f'<circle cx="{x}" cy="{y}" r="2.6" fill="{t["accent"]}"/>')
    else:
        out.append(f'<circle cx="{x}" cy="{y}" r="7.5" fill="{t["bg"]}" stroke="{t["muted"]}" stroke-width="1.6" stroke-dasharray="3 2.4"/>')
    return out


def pr_mark(x: float, y: float, status: str, t: dict, s: float = 9) -> str:
    h = s / 2
    if status == "merged":
        return f'<rect x="{x - h:.1f}" y="{y - h:.1f}" width="{s}" height="{s}" rx="1.5" fill="{t["merged"]}"/>'
    if status == "open":
        return f'<rect x="{x - h + .75:.1f}" y="{y - h + .75:.1f}" width="{s - 1.5}" height="{s - 1.5}" rx="1.5" fill="none" stroke="{t["open"]}" stroke-width="1.5"/>'
    if status == "draft":
        return f'<rect x="{x - h + .75:.1f}" y="{y - h + .75:.1f}" width="{s - 1.5}" height="{s - 1.5}" rx="1.5" fill="none" stroke="{t["draft"]}" stroke-width="1.3" stroke-dasharray="2 1.6"/>'
    return f'<path d="M{x - h + 1.5:.1f} {y - h + 1.5:.1f}L{x + h - 1.5:.1f} {y + h - 1.5:.1f}M{x + h - 1.5:.1f} {y - h + 1.5:.1f}L{x - h + 1.5:.1f} {y + h - 1.5:.1f}" stroke="{t["closed"]}" stroke-width="1.5" stroke-linecap="round" opacity=".8"/>'


def counts(prs: list[dict]) -> dict:
    c = {"merged": 0, "open": 0, "draft": 0, "closed": 0}
    for p in prs:
        c[p["status"]] += 1
    return c


def render_atlas(repos: dict, prs: list[dict], t: dict, today: dt.date) -> str:
    w, h = 1000, 600
    now = dt.datetime.combine(today, dt.time(23, 59), tzinfo=dt.timezone.utc)
    c = counts(prs)
    latest_repo, latest = max(repos.items(), key=lambda kv: kv[1]["committed"])
    latest_label = next(s[1] for s in STATIONS if s[0] == latest_repo)
    out = svg_open(
        w, h, t, "Field Atlas of aspire488",
        f"A surveyed map of Joel Jigo's work. Applications, tooling and infrastructure projects are stations marked by maturity; "
        f"stations with a commit in the last {ACTIVE_DAYS} days pulse. The upstream coast marks {c['merged']} merged, "
        f"{c['open'] + c['draft']} open and {c['closed']} closed pull requests to other projects. Surveyed {today.isoformat()}.",
    )
    out += plate_header(w, t, "ASPIRE488 — FIELD ATLAS", f"PLATE 0 · SURVEYED {today.isoformat()}")

    # Map: clip so contours never leave their frame.
    mx, my, mw, mh = 432, 64, 540, 512
    out.append(f'<defs><clipPath id="map"><rect x="{mx}" y="{my}" width="{mw}" height="{mh}" rx="4"/></clipPath>'
               f'<pattern id="sea" width="10" height="7" patternUnits="userSpaceOnUse"><path d="M0 3.5H6" stroke="{t["line"]}" stroke-width="1"/></pattern></defs>')
    out.append(f'<rect x="{mx}" y="{my}" width="{mw}" height="{mh}" rx="4" fill="none" stroke="{t["line"]}"/>')
    out.append('<g clip-path="url(#map)">')
    shore = [(mx + mw * i / 24, 150 + 9 * math.sin(i * 0.9) + 5 * math.sin(i * 2.3)) for i in range(24, -1, -1)]
    edge = "".join(f"{'M' if i == 0 else 'L'}{x:.1f} {y:.1f}" for i, (x, y) in enumerate(shore))
    out.append(f'<path d="M{mx} {my}H{mx + mw}V{shore[0][1]:.1f}{edge.replace("M", "L", 1)}Z" fill="url(#sea)"/>')
    out.append(f'<path d="{edge}" fill="none" stroke="{t["muted"]}" stroke-width="1" opacity=".55"/>')
    for (cx, cy, rings, seed) in ((560, 310, 7, 0.4), (840, 300, 5, 2.1), (690, 505, 4, 4.2)):
        for k in range(1, rings + 1):
            out.append(f'<path d="{contour_ring(cx, cy, 16 * k + 6, seed + k * 0.35)}" fill="none" stroke="{t["contour"]}" stroke-width="1"/>')
    out.append("</g>")

    # Zone names, set like a cartographer's lettering.
    for x, y, label in ((452, 200, "I N F R A S T R U C T U R E"), (742, 414, "T O O L I N G"), (452, 562, "A P P L I C A T I O N S")):
        out.append(text(x, y, label, t, size=11, fill="muted", family=SERIF, italic=True))

    # Upstream coast: one mark per external PR, oldest to newest.
    out.append(text(452, 92, "UPSTREAM", t, size=13, family=SERIF, italic=True, spacing="3"))
    out.append(text(452, 112, f"{c['merged']} merged · {c['open'] + c['draft']} open · {c['closed']} closed", t, size=11.5, fill="muted"))
    n = len(prs)
    if n:
        span = mw - 48
        for i, p in enumerate(prs):
            x = mx + 24 + (span * i / max(n - 1, 1))
            y = 132 + 4 * math.sin(i * 0.9)
            out.append(pr_mark(x, y, p["status"], t, 8))

    # Routes that exist in the code: KIO is built on AURA; OSS Atlas records the upstream work.
    pos = {s[0]: (s[4], s[5]) for s in STATIONS}
    ax, ay = pos["AURA"]
    kx, ky = pos["Kio"]
    out.append(f'<path class="flow" d="M{ax} {ay}Q{ax + 10} {ky + 10} {kx} {ky}" fill="none" stroke="{t["accent"]}" stroke-width="1.4" stroke-dasharray="4 6"/>')
    out.append(text(ax + 20, (ay + ky) / 2 + 22, "built on", t, size=11, fill="muted", family=SERIF, italic=True))
    ox, oy = pos["oss-atlas"]
    out.append(f'<path class="flow" d="M{ox} {oy - 10}V150" fill="none" stroke="{t["merged"]}" stroke-width="1.4" stroke-dasharray="4 6"/>')
    out.append(text(ox - 10, 182, "records", t, size=11, fill="muted", family=SERIF, italic=True, anchor="end"))

    for repo, label, kind, note, x, y, anchor in STATIONS:
        info = repos[repo]
        active = (now - info["committed"]).days < ACTIVE_DAYS
        out += station_glyph(x, y, kind, active, t)
        detail = info["release"] if kind == "shipped" and info["release"] else note
        when = fmt_day(info["committed"])
        lx = x + 18 if anchor == "start" else x - 18
        out.append(text(lx, y + 1, label, t, size=18, family=SERIF, weight="700", anchor=anchor))
        out.append(text(lx, y + 19, f"{detail} · {when}", t, size=11.5, fill="accent" if active else "muted", anchor=anchor))

    # Identity column.
    g = ['<g class="rise">']
    g.append(text(40, 106, "THE WORKING WORLD OF", t, size=12, fill="accent", spacing="2.6"))
    g.append(text(38, 168, "Joel Jigo", t, size=60, family=SERIF, weight="700", spacing="-1"))
    g.append(text(40, 200, "aspire488 · Kochi, India", t, size=13, fill="muted"))
    lines = ["Computer science engineering", "student. I build applications,", "developer tooling and AI", "infrastructure, then fix what", "I find in other people's code."]
    for i, line in enumerate(lines):
        g.append(text(40, 252 + i * 30, line, t, size=21, family=SERIF))
    g.append(f'<path d="M40 410H392" stroke="{t["line"]}"/>')
    g.append(text(40, 436, "LEGEND", t, size=11, fill="muted", spacing="2.4"))
    legend = [
        ("shipped", "shipped release"),
        ("building", "in development"),
        ("frozen", "frozen or paused"),
    ]
    for i, (kind, label) in enumerate(legend):
        y = 466 + i * 28
        g += station_glyph(52, y - 4, kind, False, t)
        g.append(text(74, y, label, t, size=13))
    g.append(f'<circle cx="236" cy="462" r="7" fill="none" stroke="{t["accent"]}" stroke-width="1.5"/>')
    g.append(text(252, 466, f"commit < {ACTIVE_DAYS}d", t, size=13))
    for i, (status, label) in enumerate((("merged", "merged"), ("open", "open"), ("draft", "draft"), ("closed", "closed"))):
        x = 236 + (i % 2) * 82
        y = 490 + (i // 2) * 28
        g.append(pr_mark(x, y - 4, status, t, 10))
        g.append(text(x + 14, y, label, t, size=13))
    g.append(text(40, 572, f"latest commit · {latest_label} · {latest['committed'].date().isoformat()}", t, size=11.5, fill="muted"))
    g.append("</g>")
    out += g
    out.append("</svg>")
    return "".join(out)


def render_upstream(prs: list[dict], t: dict, today: dt.date) -> str:
    w = 1000
    c = counts(prs)
    by_repo: dict[str, list[dict]] = {}
    for p in prs:
        by_repo.setdefault(p["repository"]["nameWithOwner"], []).append(p)
    ranked = sorted(by_repo.items(), key=lambda kv: (-sum(p["status"] == "merged" for p in kv[1]), -len(kv[1]), kv[0].lower()))
    shown, rest = ranked[:12], ranked[12:]
    row, top = 30, 196
    h = top + row * len(shown) + (40 if rest else 0) + 66
    out = svg_open(
        w, h, t, "Upstream ledger",
        f"Pull requests by aspire488 to projects owned by others, from the GitHub API on {today.isoformat()}: "
        f"{c['merged']} merged, {c['open']} open, {c['draft']} draft, {c['closed']} closed without merge, across {len(by_repo)} repositories.",
    )
    out += plate_header(w, t, "PLATE IV — UPSTREAM LEDGER", f"GITHUB API · {today.isoformat()}")
    stats = (("merged", "merged upstream"), ("open", "open, in review"), ("draft", "open as draft"), ("closed", "closed, not merged"))
    for i, (status, label) in enumerate(stats):
        x = 40 + i * 236
        out.append(text(x, 108, str(c[status]), t, size=44, family=SERIF, weight="700", fill=status if status != "draft" else "fg"))
        out.append(pr_mark(x + 5, 132, status, t, 10))
        out.append(text(x + 18, 136, label, t, size=12.5, fill="muted"))
    out.append(f'<path d="M40 162H{w - 40}" stroke="{t["line"]}"/>')
    out.append(text(40, 186, "REPOSITORY", t, size=11, fill="muted", spacing="2"))
    out.append(text(500, 186, "ONE MARK PER PULL REQUEST, OLDEST FIRST", t, size=11, fill="muted", spacing="2"))
    for i, (repo, items) in enumerate(shown):
        y = top + row * i + 22
        if i % 2 == 0:
            out.append(f'<rect x="28" y="{y - 20}" width="{w - 56}" height="{row}" rx="3" fill="{t["faint"]}"/>')
        owner, name = repo.split("/", 1)
        out.append(f'<text x="40" y="{y}" font-family="{MONO}" font-size="14"><tspan fill="{t["muted"]}">{escape(owner)}/</tspan><tspan fill="{t["fg"]}">{escape(name)}</tspan></text>')
        for j, p in enumerate(items):
            out.append(pr_mark(506 + j * 18, y - 5, p["status"], t, 12))
    y = top + row * len(shown)
    if rest:
        extra = sum(len(v) for _, v in rest)
        out.append(text(40, y + 30, f"+ {len(rest)} more repositories · {extra} pull requests", t, size=13, fill="muted"))
        y += 40
    out.append(text(40, y + 38, "Merged means merged by the upstream maintainers. PRs to my own repositories and forks are excluded.", t, size=12, fill="muted", family=SERIF, italic=True))
    out.append("</svg>")
    return "".join(out)


def chip(x, y, label, t, *, done=False, current=False, w=None) -> tuple[list[str], int]:
    width = w or int(len(label) * 8.6 + (40 if done else 26))
    stroke = t["accent"] if current else t["line"]
    out = [f'<rect x="{x}" y="{y}" width="{width}" height="34" rx="5" fill="{t["accent_soft"] if current else t["bg"]}" stroke="{stroke}" stroke-width="{1.6 if current else 1}"/>']
    tx = x + 13
    if done:
        out.append(f'<path d="M{x + 12} {y + 17}l4 4 8-9" fill="none" stroke="{t["accent"]}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>')
        tx = x + 30
    if current:
        out.append(f'<circle class="pulse" cx="{x + width - 12}" cy="{y + 17}" r="3" fill="{t["accent"]}"/>')
        out.append(f'<circle cx="{x + width - 12}" cy="{y + 17}" r="3" fill="{t["accent"]}"/>')
    out.append(text(tx, y + 22, label, t, size=14))
    return out, width


def arrow(x1, y, x2, t) -> str:
    return f'<path d="M{x1 + 4} {y}H{x2 - 6}m-5 -4l5 4-5 4" fill="none" stroke="{t["muted"]}" stroke-width="1.3"/>'


def chain(x, y, items, t, gap=26) -> tuple[list[str], int]:
    out = []
    for i, item in enumerate(items):
        label, opts = item if isinstance(item, tuple) else (item, {})
        parts, cw = chip(x, y, label, t, **opts)
        out += parts
        if i < len(items) - 1:
            out.append(arrow(x + cw, y + 17, x + cw + gap, t))
        x += cw + gap
    return out, x


def render_systems(t: dict) -> str:
    w, h = 1000, 640
    out = svg_open(
        w, h, t, "Systems under construction",
        "Three systems. KIO, an orchestration runtime advanced through audited gates and built on the AURA memory runtime, has finished convergence gates C-1 to C-3 and is on C-4. "
        "UEA routes engineering work through a keyword classifier first, uses an optional local model only for unknown tasks, then verifies in tiers. "
        "gh-ops runs six GitHub operations jobs through one dispatcher in CI and locally and sends a Telegram brief only when a run found something meaningful.",
    )
    out += plate_header(w, t, "PLATE III — SYSTEMS UNDER CONSTRUCTION", "STATUS AS RECORDED IN EACH REPOSITORY")
    rows = [(70, "KIO + AURA", "ACTIVE · GATED CONVERGENCE"), (262, "UEA", "PUBLIC ALPHA · v0.1.0"), (454, "gh-ops", "FROZEN · MAINTENANCE")]
    for i, (y, name, tag) in enumerate(rows):
        if i:
            out.append(f'<path d="M28 {y - 18}H{w - 28}" stroke="{t["line"]}"/>')
        out.append(text(40, y + 34, name, t, size=28, family=SERIF, weight="700"))
        out.append(text(40, y + 58, tag, t, size=11.5, fill="accent", spacing="1.6"))

    # KIO: the convergence gate map from ANCHORED_SUMMARY.md.
    parts, _ = chain(300, 92, [("C-1 context", {"done": True}), ("C-2 registry", {"done": True}), ("C-3 planning", {"done": True}), ("C-4 response", {"current": True})], t, gap=22)
    out += parts
    out.append(text(300, 162, "Phase 0 deleted 5,167 lines before any new gate began.", t, size=13, fill="muted"))
    out.append(text(300, 186, "Built on AURA: episodic, semantic and working memory, beliefs, goals, reasoning traces.", t, size=13, fill="muted"))
    out.append(text(300, 210, "AURA itself is paused since June 2026.", t, size=13, fill="muted"))
    out.append(text(40, 160, "An orchestration runtime,", t, size=15, family=SERIF))
    out.append(text(40, 182, "advanced one audited gate", t, size=15, family=SERIF))
    out.append(text(40, 204, "at a time.", t, size=15, family=SERIF))

    # UEA: deterministic-first routing, then tiered verification.
    parts, end = chain(300, 284, ["task", "keyword classifier", "specialist", ("verify", {"current": False})], t)
    out += parts
    out.append(f'<path d="M413 318V344H436" fill="none" stroke="{t["muted"]}" stroke-width="1.3" stroke-dasharray="3 3"/>')
    out.append(text(442, 349, "UNKNOWN → optional local model (Laya), lazy-loaded, fail-soft", t, size=13, fill="muted"))
    tiers = ["minimal", "standard", "strict", "security", "full"]
    x = 300
    for i, tier in enumerate(tiers):
        tw = int(len(tier) * 8.4 + 22)
        op = 0.35 + 0.13 * i
        out.append(f'<rect x="{x}" y="378" width="{tw}" height="26" rx="13" fill="none" stroke="{t["accent"]}" stroke-opacity="{op:.2f}"/>')
        out.append(text(x + 11, 396, tier, t, size=13))
        x += tw + 8
    out.append(text(x + 6, 396, "verification tiers", t, size=12, fill="muted", family=SERIF, italic=True))
    out.append(text(40, 352, "Deterministic tools first;", t, size=15, family=SERIF))
    out.append(text(40, 374, "a model only where the", t, size=15, family=SERIF))
    out.append(text(40, 396, "rules run out.", t, size=15, family=SERIF))

    # gh-ops: one dispatcher, same in CI and locally.
    jobs = ["daily", "monitoring", "weekly-report", "oss-hunt", "security", "status"]
    x, y = 300, 476
    for job in jobs:
        jw = int(len(job) * 8.4 + 22)
        if x + jw > 960:
            x, y = 300, y + 34
        out.append(f'<rect x="{x}" y="{y}" width="{jw}" height="26" rx="13" fill="none" stroke="{t["line"]}"/>')
        out.append(text(x + 11, y + 18, job, t, size=13))
        x += jw + 8
    parts, _ = chain(300, 552, ["src.jobs <job>", "Actions or local", "Telegram brief, if meaningful"], t)
    out += parts
    out.append(text(40, 544, "A personal GitHub", t, size=15, family=SERIF))
    out.append(text(40, 566, "operations layer, running", t, size=15, family=SERIF))
    out.append(text(40, 588, "on GitHub Actions.", t, size=15, family=SERIF))
    out.append("</svg>")
    return "".join(out)


def main() -> None:
    today = dt.datetime.now(dt.timezone.utc).date()
    repos = fetch_repos()
    prs = fetch_prs()
    OUT.mkdir(parents=True, exist_ok=True)
    for name, theme in (("dark", DARK), ("light", LIGHT)):
        (OUT / f"atlas.{name}.svg").write_text(render_atlas(repos, prs, theme, today), encoding="utf-8")
        (OUT / f"upstream.{name}.svg").write_text(render_upstream(prs, theme, today), encoding="utf-8")
        (OUT / f"systems.{name}.svg").write_text(render_systems(theme), encoding="utf-8")


if __name__ == "__main__":
    main()
