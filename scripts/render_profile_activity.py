#!/usr/bin/env python3
"""Render the rolling GitHub contribution history used by the profile README."""
from __future__ import annotations

import datetime as dt
import json
import os
import urllib.request
from pathlib import Path

LOGIN = "aspire488"
OUT = Path("assets/profile")
WIDTH = 1100
HEIGHT = 365
CELL = 15
GAP = 3
STEP = CELL + GAP
LEFT = 42
TOP = 102

DARK = {
    "bg": "#0d1117", "border": "#30363d", "text": "#f0f6fc", "muted": "#8b949e",
    "empty": "#161b22", "l1": "#0e4429", "l2": "#006d32", "l3": "#26a641", "l4": "#39d353",
}
LIGHT = {
    "bg": "#ffffff", "border": "#d0d7de", "text": "#1f2328", "muted": "#656d76",
    "empty": "#ebedf0", "l1": "#9be9a8", "l2": "#40c463", "l3": "#30a14e", "l4": "#216e39",
}
LEVELS = {
    "NONE": 0,
    "FIRST_QUARTILE": 1,
    "SECOND_QUARTILE": 2,
    "THIRD_QUARTILE": 3,
    "FOURTH_QUARTILE": 4,
}

def graphql() -> dict:
    end = dt.datetime.now(dt.timezone.utc).date()
    start = end - dt.timedelta(days=365)
    query = """
    query($login:String!, $from:DateTime!, $to:DateTime!) {
      user(login:$login) {
        contributionsCollection(from:$from, to:$to) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                contributionLevel
              }
            }
          }
        }
      }
    }
    """
    payload = json.dumps({
        "query": query,
        "variables": {
            "login": LOGIN,
            "from": f"{start.isoformat()}T00:00:00Z",
            "to": f"{end.isoformat()}T23:59:59Z",
        },
    }).encode()
    req = urllib.request.Request(
        "https://api.github.com/graphql",
        data=payload,
        headers={
            "Authorization": f"bearer {os.environ['GITHUB_TOKEN']}",
            "Accept": "application/vnd.github+json",
            "Content-Type": "application/json",
            "User-Agent": "aspire488-profile-cards",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as response:
        body = json.load(response)
    if body.get("errors"):
        raise RuntimeError(body["errors"])
    return body["data"]["user"]["contributionsCollection"]["contributionCalendar"]

def streaks(days: list[dict]) -> tuple[int, int]:
    counts = [d["contributionCount"] > 0 for d in days]
    longest = current = 0
    for active in counts:
        current = current + 1 if active else 0
        longest = max(longest, current)
    current_streak = 0
    for active in reversed(counts):
        if not active:
            break
        current_streak += 1
    return current_streak, longest

def render(calendar: dict, theme: dict, theme_name: str, end_date: dt.date) -> str:
    weeks = calendar["weeks"]
    cells = []
    all_days = []
    for week in weeks:
        by_day = {d["date"]: d for d in week["contributionDays"]}
        row = []
        first = dt.date.fromisoformat(week["contributionDays"][0]["date"])
        for offset in range(7):
            date = first + dt.timedelta(days=offset)
            item = by_day.get(date.isoformat(), {
                "date": date.isoformat(), "contributionCount": 0, "contributionLevel": "NONE"
            })
            row.append(LEVELS[item["contributionLevel"]])
            if date <= end_date:\n                all_days.append(item)
        cells.append(row)

    labels = []
    for i, week in enumerate(weeks):
        first = dt.date.fromisoformat(week["contributionDays"][0]["date"])
        if i == 0 or first.day <= 7:
            labels.append((i, first.strftime("%b")))

    current_streak, longest_streak = streaks(all_days)
    total = calendar["totalContributions"]
    out = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {WIDTH} {HEIGHT}" width="{WIDTH}" height="{HEIGHT}" role="img" aria-label="Contribution history for {LOGIN}: {total} contributions in the past 12 months, through {end_date.isoformat()}.">',
        "<title>Contribution history</title>",
        f'<desc>Rolling contribution history for {LOGIN} through {end_date.isoformat()}.</desc>',
        f'<rect width="{WIDTH}" height="{HEIGHT}" rx="12" fill="{theme["bg"]}"/>',
        f'<rect x="1" y="1" width="{WIDTH-2}" height="{HEIGHT-2}" rx="11" fill="none" stroke="{theme["border"]}"/>',
        f'<text x="22" y="30" fill="{theme["text"]}" font-family="Arial,sans-serif" font-size="17" font-weight="700">Contribution history</text>',
        f'<text x="22" y="49" fill="{theme["muted"]}" font-family="Arial,sans-serif" font-size="10">ROLLING 12 MONTHS • THROUGH {end_date.isoformat()}</text>',
    ]
    for week, label in labels:
        out.append(f'<text x="{LEFT + week*STEP}" y="78" fill="{theme["muted"]}" font-family="Arial,sans-serif" font-size="10">{label}</text>')

    for w, row in enumerate(cells):
        for d, level in enumerate(row):
            date = dt.date.fromisoformat(weeks[w]["contributionDays"][0]["date"]) + dt.timedelta(days=d)
            fill = [theme["empty"], theme["l1"], theme["l2"], theme["l3"], theme["l4"]][level]
            future = date > end_date
            stroke = f' stroke="{theme["border"]}" stroke-opacity=".35"' if future else ""
            fill = theme["bg"] if future else fill
            out.append(f'<rect x="{LEFT+w*STEP}" y="{TOP+d*STEP}" width="{CELL}" height="{CELL}" rx="3" fill="{fill}"{stroke}/>')

    out.append(f'<text x="22" y="250" fill="{theme["muted"]}" font-family="Arial,sans-serif" font-size="10">Less</text>')
    for i, fill in enumerate([theme["empty"], theme["l1"], theme["l2"], theme["l3"], theme["l4"]]):
        out.append(f'<rect x="{62+i*18}" y="241" width="12" height="12" rx="3" fill="{fill}"/>')
    out.append(f'<text x="160" y="250" fill="{theme["muted"]}" font-family="Arial,sans-serif" font-size="10">More</text>')
    out.append(f'<text x="22" y="300" fill="{theme["muted"]}" font-family="Arial,sans-serif" font-size="10">{total} contributions in the past 12 months • current streak {current_streak} days • longest streak {longest_streak} days</text>')
    out.append(f'<text x="1078" y="340" text-anchor="end" fill="{theme["muted"]}" font-family="monospace" font-size="9">REFRESHED {end_date.isoformat()}</text></svg>')
    return "".join(out)

def main() -> None:
    calendar = graphql()
    end_date = dt.datetime.now(dt.timezone.utc).date()
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "activity.dark.svg").write_text(render(calendar, DARK, "dark", end_date), encoding="utf-8")
    (OUT / "activity.light.svg").write_text(render(calendar, LIGHT, "light", end_date), encoding="utf-8")

if __name__ == "__main__":
    main()
