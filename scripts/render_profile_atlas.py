#!/usr/bin/env python3
"""Render the Field Atlas plates used by the profile README.

atlas.*     the traverse: one station per project in order of first commit, lane by kind, live state
upstream.*  ledger of pull requests to other people's repositories, by state
systems.*   KIO's convergence gates and its pairing with AURA (static)
tooling.*   UEA's routing and verification tiers, gh-ops' job dispatcher (static)

Live data comes from the GitHub GraphQL API. Every plate is rendered in memory first and nothing is
written unless every query succeeded, so a failed refresh leaves the last good plates in place.
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
ACTIVE_DAYS = 14  # ring: a human commit on the default branch this recently
QUIET_DAYS = 60  # hollow station: no human commit on the default branch for this long

SERIF = "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'Times New Roman', serif"
MONO = "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace"

# Primer-aligned so the plates sit beside the generated profile cards in either theme.
DARK = {
    "bg": "#0d1117", "fg": "#e6edf3", "muted": "#8b949e", "line": "#30363d", "faint": "#161b22", "edge": "#484f58",
    "accent": "#f0883e", "accent_soft": "#3d2817",
    "merged": "#a371f7", "open": "#3fb950", "draft": "#8b949e", "closed": "#f85149",
}
LIGHT = {
    "bg": "#ffffff", "fg": "#1f2328", "muted": "#59636e", "line": "#d1d9e0", "faint": "#f6f8fa", "edge": "#afb8c1",
    "accent": "#bc4c00", "accent_soft": "#fff1e5",
    "merged": "#8250df", "open": "#1a7f37", "draft": "#6e7781", "closed": "#cf222e",
}

# Type scale in viewBox units. Plates are 640-760 units wide and shown at most at that width, so on a
# 358px phone every tier below stays at or above ~8px and the names stay above 12px.
SIZE = {"name": 27, "body": 19, "small": 17, "caption": 16, "atlas": 19}

# Curated project metadata. `first` is each repository's first commit on its default branch (GitHub API,
# fixed history); release and last-commit dates are fetched live.
# maturity: released | alpha | building | frozen | ledger | upstream
PROJECTS = [
    {"repo": "medimind", "label": "MediMind", "lane": "applications", "first": "2026-03-18", "maturity": "frozen", "note": "frozen prototype"},
    {"repo": "codeflow", "label": "CodeFlow", "lane": "applications", "first": "2026-04-15", "maturity": "frozen", "note": "frozen prototype"},
    {"repo": "AURA", "label": "AURA", "lane": "systems", "first": "2026-06-21", "maturity": "building", "note": "memory layer"},
    {"repo": "Kio", "label": "KIO", "lane": "systems", "first": "2026-07-15", "maturity": "building", "note": "gated kernel"},
    {"repo": "Universal-Engineering-Augmentation", "label": "UEA", "lane": "tooling", "first": "2026-09-10", "maturity": "alpha", "note": "public alpha"},
    {"repo": None, "label": "Upstream PRs", "lane": "upstream", "first": "2026-09-10", "maturity": "upstream", "note": ""},
    {"repo": "gh-ops", "label": "gh-ops", "lane": "tooling", "first": "2026-09-21", "maturity": "frozen", "note": "frozen"},
    {"repo": "oss-atlas", "label": "OSS Atlas", "lane": "tooling", "first": "2026-09-23", "maturity": "ledger", "note": "OSS notes"},
    {"repo": "Pipo", "label": "Pipo", "lane": "applications", "first": "2026-09-29", "maturity": "released", "note": "released"},
    {"repo": "campus-bus", "label": "Campus Bus", "lane": "applications", "first": "2026-10-11", "maturity": "released", "note": "released"},
]
LANE_X = {"applications": 150, "systems": 290, "tooling": 430, "upstream": 570}
PAIRS = [("AURA", "Kio", "pairs with")]  # drawn only where both repositories describe the pairing

STYLE = (
    "<style>"
    ".pulse{transform-box:fill-box;transform-origin:center;animation:pulse 2.4s ease-out 3}"
    "@keyframes pulse{0%{transform:scale(1);opacity:.8}100%{transform:scale(2.2);opacity:0}}"
    "@media (prefers-reduced-motion:reduce){.pulse{animation:none;opacity:0}}"
    "</style>"
)


# ---------------------------------------------------------------- data

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


def parse_time(value: str) -> dt.datetime:
    return dt.datetime.fromisoformat(value.replace("Z", "+00:00"))


def is_bot(commit: dict) -> bool:
    author = commit.get("author") or {}
    login = (author.get("user") or {}).get("login") or author.get("name") or ""
    return login.endswith("[bot]")


def fetch_repos() -> dict:
    repos = [p["repo"] for p in PROJECTS if p["repo"]]
    fields = [
        f'r{i}: repository(owner:"{LOGIN}", name:"{repo}") {{'
        " defaultBranchRef { target { ... on Commit { history(first:100) { nodes {"
        " committedDate author { name user { login } } } } } } }"
        " releases(first:1, orderBy:{field:CREATED_AT, direction:DESC}) { nodes { tagName publishedAt } } }"
        for i, repo in enumerate(repos)
    ]
    data = graphql("query {" + " ".join(fields) + "}")
    out = {}
    for i, repo in enumerate(repos):
        node = data[f"r{i}"]
        # Activity means people working, so automated commits (OSS Atlas' dashboard bot) don't count.
        human = [c for c in node["defaultBranchRef"]["target"]["history"]["nodes"] if not is_bot(c)]
        if not human:
            raise RuntimeError(f"no human commit among the last 100 on {repo}")
        release = (node["releases"]["nodes"] or [None])[0]
        out[repo] = {
            "last": parse_time(human[0]["committedDate"]),
            "release": release["tagName"] if release else None,
            "released": parse_time(release["publishedAt"]) if release and release.get("publishedAt") else None,
        }
    return out


def fetch_prs() -> list[dict]:
    query = """
    query($q:String!, $after:String) {
      search(query:$q, type:ISSUE, first:100, after:$after) {
        pageInfo { hasNextPage endCursor }
        nodes { ... on PullRequest {
          number title url state isDraft createdAt mergedAt
          repository { nameWithOwner name owner { login } }
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
    # Upstream only: a PR's repository is its base, so PRs from my forks into other projects count and
    # PRs into my own repositories or forks do not.
    external = [p for p in prs if p["repository"]["owner"]["login"].lower() != LOGIN.lower()]
    if not external:
        raise RuntimeError("search returned no upstream pull requests; keeping the last plates")
    for p in external:
        if p["state"] == "MERGED":
            p["status"] = "merged"
        elif p["state"] == "OPEN":
            p["status"] = "draft" if p["isDraft"] else "open"
        else:
            p["status"] = "closed"
    return sorted(external, key=lambda p: (p["createdAt"], p["url"]))


def counts(prs: list[dict]) -> dict:
    c = {"merged": 0, "open": 0, "draft": 0, "closed": 0}
    for p in prs:
        c[p["status"]] += 1
    return c


def summary(c: dict) -> str:
    return f"{c['merged']} merged · {c['open']} open · {c['draft']} draft · {c['closed']} closed"


# ---------------------------------------------------------------- drawing helpers

def fmt_day(d: dt.date | dt.datetime) -> str:
    return f"{d.strftime('%b')} {d.day}"


def svg_open(w: int, h: int, t: dict, title: str, desc: str) -> list[str]:
    return [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img" aria-labelledby="t d">',
        f'<title id="t">{escape(title)}</title><desc id="d">{escape(desc)}</desc>',
        STYLE,
        f'<rect width="{w}" height="{h}" fill="{t["bg"]}"/>',
        f'<rect x=".5" y=".5" width="{w - 1}" height="{h - 1}" rx="6" fill="none" stroke="{t["line"]}"/>',
    ]


def text(x, y, s, t, *, size=SIZE["body"], fill="fg", family=MONO, weight=None, anchor=None, spacing=None, italic=False, halo=False) -> str:
    attrs = [f'x="{x}"', f'y="{y}"', f'fill="{t[fill]}"', f'font-family="{family}"', f'font-size="{size}"']
    if halo:
        # Cartographic halo: the route passes under labels instead of through them.
        attrs.append(f'stroke="{t["bg"]}" stroke-width="8" stroke-linejoin="round" paint-order="stroke"')
    if weight:
        attrs.append(f'font-weight="{weight}"')
    if anchor:
        attrs.append(f'text-anchor="{anchor}"')
    if spacing:
        attrs.append(f'letter-spacing="{spacing}"')
    if italic:
        attrs.append('font-style="italic"')
    return f"<text {' '.join(attrs)}>{escape(s)}</text>"


def header(w: int, t: dict, left: str, right: str = "") -> list[str]:
    out = [text(24, 34, left, t, size=SIZE["caption"], fill="muted", spacing="2.4")]
    if right:
        out.append(text(w - 24, 34, right, t, size=SIZE["caption"], fill="muted", spacing="1", anchor="end"))
    out.append(f'<path d="M0 52H{w}" stroke="{t["line"]}"/>')
    return out


def pr_mark(x: float, y: float, status: str, t: dict, s: float = 14) -> str:
    h = s / 2
    if status == "merged":
        return f'<rect x="{x - h:.1f}" y="{y - h:.1f}" width="{s}" height="{s}" rx="2" fill="{t["merged"]}"/>'
    if status in ("open", "draft"):
        color = t[status]
        box = f'<rect x="{x - h + 1:.1f}" y="{y - h + 1:.1f}" width="{s - 2}" height="{s - 2}" rx="2" fill="none" stroke="{color}" stroke-width="1.8"/>'
        # Draft gets a centre dot so it stays distinct from open when the plate is scaled down.
        return box + (f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{s / 7:.1f}" fill="{color}"/>' if status == "draft" else "")
    k = h - 2
    return f'<path d="M{x - k:.1f} {y - k:.1f}L{x + k:.1f} {y + k:.1f}M{x + k:.1f} {y - k:.1f}L{x - k:.1f} {y + k:.1f}" stroke="{t["closed"]}" stroke-width="2" stroke-linecap="round"/>'


def station(x: float, y: float, maturity: str, t: dict, *, active: bool, quiet: bool) -> list[str]:
    out = []
    if active:
        # The static ring carries the meaning; the pulse is an extra that stops after three beats.
        out.append(f'<circle cx="{x}" cy="{y}" r="17" fill="none" stroke="{t["accent"]}" stroke-width="1.6"/>')
        out.append(f'<circle class="pulse" cx="{x}" cy="{y}" r="17" fill="none" stroke="{t["accent"]}" stroke-width="1.6"/>')
    if maturity == "upstream":
        for dx, dy, status in ((-7, -7, "merged"), (7, -7, "open"), (-7, 7, "draft"), (7, 7, "closed")):
            out.append(pr_mark(x + dx, y + dy, status, t, 11))
    elif quiet:
        out.append(f'<circle cx="{x}" cy="{y}" r="10" fill="{t["bg"]}" stroke="{t["muted"]}" stroke-width="1.6"/>')
    elif maturity == "released":
        out.append(f'<circle cx="{x}" cy="{y}" r="11" fill="{t["accent"]}"/>')
    elif maturity == "frozen":
        out.append(f'<circle cx="{x}" cy="{y}" r="10" fill="{t["bg"]}" stroke="{t["muted"]}" stroke-width="2" stroke-dasharray="4 3"/>')
    else:  # alpha, building, ledger
        out.append(f'<circle cx="{x}" cy="{y}" r="10" fill="{t["bg"]}" stroke="{t["accent"]}" stroke-width="2.4"/>')
        out.append(f'<circle cx="{x}" cy="{y}" r="3.5" fill="{t["accent"]}"/>')
    return out


def chip(x, y, label, t, *, done=False, accent=False, dashed=False) -> tuple[list[str], int]:
    size = SIZE["small"]
    width = int(len(label) * size * 0.61 + (46 if done else 28))
    stroke = t["accent"] if accent else (t["muted"] if dashed else t["edge"])
    dash = ' stroke-dasharray="5 4"' if dashed else ""
    fill = t["accent_soft"] if accent else t["bg"]
    out = [f'<rect x="{x}" y="{y}" width="{width}" height="38" rx="5" fill="{fill}" stroke="{stroke}" stroke-width="{1.8 if accent else 1.2}"{dash}/>']
    tx = x + 14
    if done:
        out.append(f'<path d="M{x + 13} {y + 19}l5 5 9-10" fill="none" stroke="{t["accent"]}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>')
        tx = x + 34
    out.append(text(tx, y + 25, label, t, size=size))
    return out, width


def steps(x: int, y: int, items: list, t: dict) -> tuple[list[str], list[tuple[int, int, int]], int]:
    """Chips stacked top to bottom joined by down arrows. Returns parts, each chip's (x, y, width), bottom edge."""
    out, boxes = [], []
    for i, item in enumerate(items):
        label, opts = item if isinstance(item, tuple) else (item, {})
        parts, w = chip(x, y, label, t, **opts)
        out += parts
        boxes.append((x, y, w))
        if i < len(items) - 1:
            out.append(f'<path d="M{x + 20} {y + 42}V{y + 58}m-5 -6l5 6 5-6" fill="none" stroke="{t["muted"]}" stroke-width="1.5"/>')
        y += 62
    return out, boxes, y - 24


def pills(x0: int, y: int, labels: list[str], t: dict, *, right: int, ramp: bool = False) -> tuple[list[str], int]:
    out, x = [], x0
    size = SIZE["small"]
    for i, label in enumerate(labels):
        w = int(len(label) * size * 0.61 + 26)
        if x > x0 and x + w > right:
            x, y = x0, y + 42
        opacity = f' stroke-opacity="{0.4 + 0.15 * i:.2f}"' if ramp else ""
        out.append(f'<rect x="{x}" y="{y}" width="{w}" height="32" rx="16" fill="none" stroke="{t["accent"] if ramp else t["edge"]}"{opacity} stroke-width="1.4"/>')
        out.append(text(x + 13, y + 22, label, t, size=size))
        x += w + 10
    return out, y + 32


def block_title(y: int, name: str, tag: str, t: dict) -> list[str]:
    return [
        text(24, y, name, t, size=32, family=SERIF, weight="700"),
        text(24, y + 28, tag, t, size=SIZE["caption"], fill="accent", spacing="1.4"),
    ]


# ---------------------------------------------------------------- plates

def project_state(p: dict, repos: dict, c: dict, now: dt.datetime) -> dict:
    if p["maturity"] == "upstream":
        return {"active": False, "quiet": False, "detail": summary(c)}
    info = repos[p["repo"]]
    age = (now - info["last"]).days
    quiet = age >= QUIET_DAYS and p["maturity"] not in ("frozen", "released")
    if p["maturity"] == "released" and info["release"] and info["released"]:
        detail = f"{info['release']} · {fmt_day(info['released'])}"
    elif p["maturity"] == "frozen":
        detail = p["note"]
    else:
        detail = f"{p['note']} · {fmt_day(info['last'])}"
    return {"active": age < ACTIVE_DAYS, "quiet": quiet, "detail": detail}


def render_atlas(repos: dict, prs: list[dict], t: dict, today: dt.date) -> str:
    w, row_h, gap_h, top = 760, 56, 32, 116
    now = dt.datetime.combine(today, dt.time(23, 59), tzinfo=dt.timezone.utc)
    c = counts(prs)

    # One row per station in order of first commit; a calendar month with no first commit gets a thin
    # row, so the vertical axis is honest about time without pretending to be to scale.
    rows, prev = [], None
    for p in PROJECTS:
        first = dt.date.fromisoformat(p["first"])
        if prev:
            months = (first.year - prev.year) * 12 + first.month - prev.month
            for k in range(1, months):
                m = prev.month + k
                rows.append(("gap", dt.date(prev.year + (m - 1) // 12, (m - 1) % 12 + 1, 1)))
        rows.append(("station", p))
        prev = first
    body_h = sum(row_h if kind == "station" else gap_h for kind, _ in rows)
    unsurveyed_y = top + body_h + 18
    h = unsurveyed_y + 96

    states = {p["label"]: project_state(p, repos, c, now) for p in PROJECTS}
    out = svg_open(
        w, h, t, "Field Atlas: the route so far",
        "Projects in order of first commit, March to October 2026. "
        + "; ".join(f"{p['label']}, first {'pull request' if p['maturity'] == 'upstream' else 'commit'} {fmt_day(dt.date.fromisoformat(p['first']))}: {states[p['label']]['detail']}" for p in PROJECTS)
        + f". The route continues into unsurveyed ground. Surveyed {today.isoformat()}.",
    )
    out += header(w, t, "FIELD ATLAS · 2026", f"SURVEYED {today.isoformat()}")
    for lane, x in LANE_X.items():
        out.append(text(x, 90, lane, t, size=SIZE["atlas"], fill="muted", family=SERIF, italic=True, anchor="middle"))
        out.append(f'<path d="M{x} 104V{unsurveyed_y - 8}" stroke="{t["line"]}" stroke-dasharray="1 6"/>')

    y, points, seen = top, [], set()
    for kind, item in rows:
        if kind == "gap":
            out.append(f'<rect x="16" y="{y + 5}" width="{w - 32}" height="{gap_h - 10}" rx="3" fill="{t["faint"]}"/>')
            out.append(text(28, y + gap_h / 2 + 6, item.strftime("%b").upper(), t, size=SIZE["atlas"], fill="muted"))
            y += gap_h
            continue
        cy = y + row_h / 2
        if item["first"][:7] not in seen:
            seen.add(item["first"][:7])
            out.append(text(28, cy + 7, dt.date.fromisoformat(item["first"]).strftime("%b").upper(), t, size=SIZE["atlas"], weight="700"))
        points.append((item, LANE_X[item["lane"]], cy))
        y += row_h

    # The traverse: one dotted route through the stations in order, then on into unsurveyed ground.
    route = f"M{points[0][1]} {points[0][2]:.0f}"
    for (_, x1, y1), (_, x2, y2) in zip(points, points[1:]):
        route += f" V{y1 + row_h / 2:.0f} H{x2} V{y2:.0f}" if x1 != x2 else f" V{y2:.0f}"
    route += f" V{unsurveyed_y + 20}"
    out.append(f'<path d="{route}" fill="none" stroke="{t["accent"]}" stroke-width="2.2" stroke-dasharray="1 7" stroke-linecap="round" stroke-linejoin="round"/>')
    where = {p["repo"]: (x, cy) for p, x, cy in points if p["repo"]}
    for a, b, label in PAIRS:
        (ax, ay), (bx, by) = where[a], where[b]
        out.append(text(ax - 14, (ay + by) / 2 + 6, label, t, size=SIZE["caption"], fill="muted", family=SERIF, italic=True, anchor="end"))

    for p, x, cy in points:
        state = states[p["label"]]
        out += station(x, cy, p["maturity"], t, active=state["active"], quiet=state["quiet"])
        left = x + 300 > w
        lx, anchor = (x - 28, "end") if left else (x + 28, "start")
        out.append(text(lx, cy + 1, p["label"], t, size=SIZE["name"], family=SERIF, weight="700", anchor=anchor, halo=True))
        out.append(text(lx, cy + 22, state["detail"], t, size=SIZE["atlas"], fill="accent" if state["active"] else "muted", anchor=anchor, halo=True))

    # Unsurveyed ground: where the route is heading, deliberately left blank.
    out.append(f'<defs><pattern id="hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V9" stroke="{t["line"]}" stroke-width="1.4"/></pattern></defs>')
    out.append(f'<rect x="16" y="{unsurveyed_y}" width="{w - 32}" height="72" rx="4" fill="url(#hatch)"/>')
    out.append(f'<rect x="{w / 2 - 110}" y="{unsurveyed_y + 18}" width="220" height="36" rx="4" fill="{t["bg"]}"/>')
    out.append(text(w / 2, unsurveyed_y + 44, "unsurveyed", t, size=24, family=SERIF, italic=True, anchor="middle", fill="muted"))
    out.append("</svg>")
    return "".join(out)


def render_upstream(prs: list[dict], t: dict, today: dt.date) -> str:
    w, row, top = 640, 40, 214
    c = counts(prs)
    by_repo: dict[str, list[dict]] = {}
    for p in prs:
        by_repo.setdefault(p["repository"]["nameWithOwner"], []).append(p)
    ranked = sorted(by_repo.items(), key=lambda kv: (-sum(p["status"] == "merged" for p in kv[1]), -len(kv[1]), kv[0].lower()))
    shown, rest = ranked[:8], ranked[8:]
    h = top + row * len(shown) + (54 if rest else 0) + 26

    def tally(items: list[dict]) -> str:
        return ", ".join(f"{n} {s}" for s in ("merged", "open", "draft", "closed") if (n := sum(p["status"] == s for p in items)))

    out = svg_open(
        w, h, t, "Upstream ledger",
        f"Pull requests by {LOGIN} to repositories owned by others, from the GitHub API on {today.isoformat()}: "
        f"{c['merged']} merged, {c['open']} open, {c['draft']} draft, {c['closed']} closed without merge, across {len(by_repo)} repositories. "
        + "; ".join(f"{repo}: {tally(items)}" for repo, items in shown) + ".",
    )
    out += header(w, t, "UPSTREAM LEDGER", f"GITHUB API · {today.isoformat()}")
    for i, status in enumerate(("merged", "open", "draft", "closed")):
        x = 24 + i * 152
        out.append(text(x, 120, str(c[status]), t, size=50, family=SERIF, weight="700"))
        out.append(pr_mark(x + 8, 148, status, t, 16))
        out.append(text(x + 24, 154, status, t, size=SIZE["small"], fill="muted"))
    out.append(f'<path d="M24 180H{w - 24}" stroke="{t["line"]}"/>')
    out.append(text(24, 204, "one mark per pull request, oldest first", t, size=SIZE["caption"], fill="muted", family=SERIF, italic=True))
    for i, (repo, items) in enumerate(shown):
        y = top + row * i + 28
        if i % 2 == 0:
            out.append(f'<rect x="16" y="{y - 26}" width="{w - 32}" height="{row}" rx="4" fill="{t["faint"]}"/>')
        out.append(text(28, y, repo.split("/", 1)[1], t, size=SIZE["body"]))
        for j, p in enumerate(items):
            out.append(pr_mark(330 + j * 22, y - 6, p["status"], t, 16))
    if rest:
        extra = sum(len(v) for _, v in rest)
        out.append(text(28, top + row * len(shown) + 36, f"+ {len(rest)} more repositories, {extra} pull requests", t, size=SIZE["small"], fill="muted"))
    out.append("</svg>")
    return "".join(out)


def render_systems(t: dict) -> str:
    w, right = 560, 536
    body = block_title(98, "KIO", "GATED CONVERGENCE · C-4 NEXT", t)
    gates = [("C-1 context", {"done": True}), ("C-2 registry", {"done": True}), ("C-3 planning", {"done": True}), ("C-4 response", {"accent": True})]
    parts, boxes, y = steps(24, 140, gates, t)
    body += parts
    gx, gy, gw = boxes[-1]
    body.append(text(gx + gw + 16, gy + 25, "next, as recorded in ANCHORED_SUMMARY.md", t, size=SIZE["caption"], fill="muted", family=SERIF, italic=True))
    y += 36
    body.append(f'<path d="M24 {y}H{w - 24}" stroke="{t["line"]}"/>')
    body += block_title(y + 46, "AURA", "MEMORY AND REASONING LAYER", t)
    parts, y = pills(24, y + 90, ["episodic memory", "semantic memory", "beliefs", "goals", "reasoning traces"], t, right=right)
    body += parts
    parts, w2 = chip(24, y + 24, "integration into KIO: gate C-7", t, dashed=True)
    body += parts
    h = y + 24 + 38 + 30
    head = svg_open(
        w, h, t, "KIO and AURA",
        "KIO, the Kernel for Intelligent Orchestration, advances through recorded convergence gates: C-1 context, "
        "C-2 registry and C-3 planning are marked done and C-4 response is next. AURA is the memory and reasoning "
        "layer designed to pair with it (episodic and semantic memory, beliefs, goals, reasoning traces); "
        "integrating it into KIO is gate C-7.",
    )
    return "".join(head + header(w, t, "SYSTEMS") + body + ["</svg>"])


def render_tooling(t: dict) -> str:
    w, right = 560, 536
    body = block_title(98, "UEA", "PUBLIC ALPHA · v0.1.0", t)
    parts, boxes, y = steps(24, 140, ["task", "keyword classifier", "specialist", "verify"], t)
    body += parts
    cx, cy, cw = boxes[1]
    body.append(f'<path d="M{cx + cw + 6} {cy + 19}H{cx + cw + 40}" fill="none" stroke="{t["muted"]}" stroke-width="1.5" stroke-dasharray="3 3"/>')
    body.append(text(cx + cw + 48, cy + 25, "UNKNOWN →", t, size=SIZE["small"], fill="muted"))
    body.append(text(cx + cw + 48, cy + 47, "optional local model", t, size=SIZE["small"], fill="muted"))
    body.append(text(24, y + 40, "verify runs one of five tiers:", t, size=SIZE["caption"], fill="muted", family=SERIF, italic=True))
    parts, y = pills(24, y + 56, ["minimal", "standard", "strict", "security", "full"], t, right=right, ramp=True)
    body += parts
    y += 36
    body.append(f'<path d="M24 {y}H{w - 24}" stroke="{t["line"]}"/>')
    body += block_title(y + 46, "gh-ops", "FROZEN · MAINTENANCE", t)
    parts, y = pills(24, y + 90, ["daily", "monitoring", "weekly-report", "oss-hunt", "security", "status"], t, right=right)
    body += parts
    parts, _, y = steps(24, y + 24, ["python -m src.jobs <job>", "same dispatcher in CI or locally", "Telegram brief, only if a run found something"], t)
    body += parts
    h = y + 30
    head = svg_open(
        w, h, t, "UEA and gh-ops",
        "UEA routes engineering work through a keyword classifier to a specialist, sends unknown tasks to an optional "
        "local model, and verifies in five tiers: minimal, standard, strict, security, full. gh-ops runs six jobs "
        "(daily, monitoring, weekly-report, oss-hunt, security, status) through one dispatcher, the same in CI and "
        "locally, and sends a Telegram brief only when a run found something.",
    )
    return "".join(head + header(w, t, "TOOLING") + body + ["</svg>"])


def main() -> None:
    today = dt.datetime.now(dt.timezone.utc).date()
    repos = fetch_repos()
    prs = fetch_prs()
    files = {}
    for name, theme in (("dark", DARK), ("light", LIGHT)):
        files[f"atlas.{name}.svg"] = render_atlas(repos, prs, theme, today)
        files[f"upstream.{name}.svg"] = render_upstream(prs, theme, today)
        files[f"systems.{name}.svg"] = render_systems(theme)
        files[f"tooling.{name}.svg"] = render_tooling(theme)
    OUT.mkdir(parents=True, exist_ok=True)
    for filename, svg in files.items():
        (OUT / filename).write_text(svg, encoding="utf-8")


if __name__ == "__main__":
    main()
