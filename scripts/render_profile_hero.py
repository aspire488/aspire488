#!/usr/bin/env python3
"""Render the profile README's hero: a strip of ruled notebook paper with the name and tagline.

Static (no API calls), so it runs locally rather than in the hourly workflow:

    python scripts/render_profile_hero.py

Writes assets/profile/hero.light.svg and assets/profile/hero.dark.svg. The background is left
transparent so the strip sits on GitHub's own page colour in light, dark and dimmed themes.
"""
from __future__ import annotations

from pathlib import Path
from xml.sax.saxutils import escape

OUT = Path("assets/profile")
W, H = 720, 306
MARGIN_X = 70  # the red margin line of an exercise book
TEXT_X = 92

SERIF = "Georgia, 'Noto Serif', 'DejaVu Serif', 'Times New Roman', serif"
MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, 'DejaVu Sans Mono', monospace"

THEMES = {
    "light": {"ink": "#1f2328", "muted": "#59636e", "rule": "#d6e2ef", "margin": "#e3a090", "accent": "#b83a22"},
    "dark": {"ink": "#f0f6fc", "muted": "#9198a1", "rule": "#232e3b", "margin": "#6e3326", "accent": "#ff7b5c"},
}

NAME = "Joel Jigo"
TAGLINE = ("Build things. Make them ", "hold up.")
NOTE = "cse student · kochi, india"


def render(t: dict) -> str:
    out = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-labelledby="t">',
        f'<title id="t">{escape(NAME)}: {escape("".join(TAGLINE))}</title>',
    ]
    # Ruled lines every 36 units, the way a notebook page is ruled; the text sits on them.
    for y in range(36, H, 36):
        out.append(f'<path d="M0 {y}H{W}" stroke="{t["rule"]}" stroke-width="1"/>')
    out.append(f'<path d="M{MARGIN_X} 0V{H}" stroke="{t["margin"]}" stroke-width="2"/>')
    out.append(
        f'<text x="{TEXT_X}" y="144" fill="{t["ink"]}" font-family="{SERIF}" font-size="88" font-weight="700" letter-spacing="-1.5">{escape(NAME)}</text>'
    )
    plain, accent = TAGLINE
    out.append(
        f'<text x="{TEXT_X + 2}" y="216" fill="{t["ink"]}" font-family="{SERIF}" font-size="40">{escape(plain)}'
        f'<tspan fill="{t["accent"]}" font-style="italic">{escape(accent)}</tspan></text>'
    )
    out.append(f'<text x="{TEXT_X + 2}" y="288" fill="{t["muted"]}" font-family="{MONO}" font-size="24">{escape(NOTE)}</text>')
    out.append("</svg>")
    return "".join(out)


def main() -> None:
    files = {f"hero.{name}.svg": render(theme) for name, theme in THEMES.items()}
    OUT.mkdir(parents=True, exist_ok=True)
    for filename, svg in files.items():
        (OUT / filename).write_text(svg, encoding="utf-8")


if __name__ == "__main__":
    main()
