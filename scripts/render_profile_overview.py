#!/usr/bin/env python3
from __future__ import annotations
import datetime as dt
import json
import os
import urllib.request
from pathlib import Path

LOGIN = "aspire488"
OUT = Path("assets/profile")
WIDTH, HEIGHT = 1100, 190
DARK = {"bg":"#0d1117","border":"#30363d","text":"#f0f6fc","muted":"#8b949e","accent":"#39d353"}
LIGHT = {"bg":"#ffffff","border":"#d0d7de","text":"#1f2328","muted":"#656d76","accent":"#216e39"}

def graphql():
    query = """query($login:String!) {
      user(login:$login) { name login followers { totalCount } following { totalCount }
      repositories(first:1, ownerAffiliations:OWNER, privacy:PUBLIC) { totalCount }
      contributionsCollection { contributionCalendar { totalContributions } } }
    }"""
    payload = json.dumps({"query":query,"variables":{"login":LOGIN}}).encode()
    req = urllib.request.Request("https://api.github.com/graphql", data=payload, headers={
        "Authorization":"bearer " + os.environ["GITHUB_TOKEN"],
        "Accept":"application/vnd.github+json","Content-Type":"application/json",
        "User-Agent":"aspire488-profile-cards"}, method="POST")
    with urllib.request.urlopen(req, timeout=30) as response:
        body = json.load(response)
    if body.get("errors"):
        raise RuntimeError(body["errors"])
    return body["data"]["user"]

def render(user, theme, refreshed):
    display = user.get("name") or user["login"]
    total = user["contributionsCollection"]["contributionCalendar"]["totalContributions"]
    metrics = [("CONTRIBUTIONS",total),("PUBLIC REPOS",user["repositories"]["totalCount"]),
               ("FOLLOWERS",user["followers"]["totalCount"]),("FOLLOWING",user["following"]["totalCount"])]
    out = [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 190" width="1100" height="190" role="img">',
        "<title>Live GitHub overview</title>",
        '<rect width="1100" height="190" rx="12" fill="' + theme["bg"] + '"/>',
        '<rect x="1" y="1" width="1098" height="188" rx="11" fill="none" stroke="' + theme["border"] + '"/>',
        '<text x="28" y="32" fill="' + theme["text"] + '" font-family="Arial,sans-serif" font-size="17" font-weight="700">GitHub overview</text>',
        '<text x="28" y="51" fill="' + theme["muted"] + '" font-family="Arial,sans-serif" font-size="10">LIVE PROFILE DATA • REFRESHED ' + refreshed.isoformat() + '</text>',
    ]
    for (label,value), x in zip(metrics,[55,330,605,880]):
        out.append('<text x="' + str(x) + '" y="100" fill="' + theme["accent"] + '" font-family="Arial,sans-serif" font-size="28" font-weight="700">' + str(value) + '</text>')
        out.append('<text x="' + str(x) + '" y="124" fill="' + theme["muted"] + '" font-family="Arial,sans-serif" font-size="10">' + label + '</text>')
    out += ['<text x="1072" y="166" text-anchor="end" fill="' + theme["muted"] + '" font-family="monospace" font-size="9">SOURCE: GITHUB GRAPHQL API</text>','</svg>']
    return "".join(out)

def main():
    user = graphql()
    refreshed = dt.datetime.now(dt.timezone.utc).date()
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT/"overview.dark.svg").write_text(render(user,DARK,refreshed),encoding="utf-8")
    (OUT/"overview.light.svg").write_text(render(user,LIGHT,refreshed),encoding="utf-8")

if __name__ == "__main__":
    main()
