<!-- aspire488 · profile README. Design notes: docs/DESIGN.md. Live cards in assets/profile are redrawn by .github/workflows/profile-cards.yml -->

<h1>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/profile/hero.dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="./assets/profile/hero.light.svg">
    <img src="./assets/profile/hero.light.svg" width="720" alt="Joel Jigo. Build things. Make them hold up.">
  </picture>
</h1>

I'm Joel, a CSE student in Kochi. I build AI systems, developer tools, and one small robot who lives in a phone. Some of it ships, some of it gets frozen early. The note beside each thing says which.

Start with what shipped: [**Pipo**](#pipo) and [**Campus Bus**](#campus-bus). Or skip to [other people's code](#other-peoples-code).

## On the desk

### Pipo

`shipped · v1.0`

<a href="https://aspire488.github.io/Pipo/"><img src="./assets/profile/work/pipo-world.jpg" width="100%" alt="Pipo's room in the browser: a small round robot on a rug between his bed, desk and workbench, with Nib, his pet robot, beside him."></a>

A small robot with moods, habits and projects who lives in a room on your phone. Close the app, come back later, and his day has happened anyway; he'll tell you about it. No account, no analytics: it's a robot and a JSON file. His room also runs in the browser, built with Three.js.

✓ v1.0 APK on Releases · 175 tests recorded, checked on a Galaxy S23 · not yet: a green APK build in CI (the last run failed)

[Android APK v1.0](https://github.com/aspire488/Pipo/releases/tag/v1.0) · [Pipo's room in your browser](https://aspire488.github.io/Pipo/) · [Pipo source](https://github.com/aspire488/Pipo)

### Campus Bus

`shipped · v1.1 · tested on one PC`

<a href="https://github.com/aspire488/campus-bus"><img src="./assets/profile/work/campus-bus-seat-map.png" width="100%" alt="Campus Bus seat map: a route from High Court to the campus with every stop and time, above a bus layout where seat 07 is selected."></a>

Bus seat booking for a college transport office: pick your trip and stop, pick a seat, get a PDF pass. Java, Swing with a JavaFX WebView, and MySQL. The Windows zip carries its own Java runtime and sets up a private MySQL without admin rights.

✓ 166 tests, 0 failures, on the v1.1 release build · sandboxed install on one PC · not yet: Windows 10, a second PC

[Windows download v1.1](https://github.com/aspire488/campus-bus/releases/tag/v1.1) · [Campus Bus source](https://github.com/aspire488/campus-bus)

### KIO

`building · gate C-4 next`

The kernel of a personal companion runtime, rebuilt one gate at a time. Phase 0 was deleting 5,167 lines. Gates C-1 to C-3 are marked done; at last record about 245 tests pass and 6 fail. No README yet, the design notes live in the repo root.

[KIO source](https://github.com/aspire488/Kio)

### UEA

`alpha · v0.1.0`

Gives coding agents real tools for the checkable parts: tree-sitter parsing, blast-radius analysis, property and mutation tests, Z3. The model stops guessing at things a tool can prove. Does it save tokens? Not measured yet, so I don't claim it.

✓ CI on Python 3.10 to 3.12 · not yet: a tagged release, any token measurements

[UEA source](https://github.com/aspire488/Universal-Engineering-Augmentation)

### AURA

`built, not verified · last worked on in June 2026`

Memory for KIO's runtime: episodic, semantic and working memory, beliefs, goals and reasoning traces, behind FastAPI. Plugging it into KIO is gate C-7.

[AURA source](https://github.com/aspire488/AURA)

### gh-ops

`frozen`

My GitHub ops crew on Actions: monitoring, security checks, weekly reports, open-source scouting, and a Telegram brief only when a run found something. Frozen at 1,495 recorded passing tests; maintenance only.

[gh-ops source](https://github.com/aspire488/gh-ops)

<details>
<summary>Earlier experiments: MediMind and CodeFlow, both frozen prototypes from spring 2026</summary>
<br>

- **[MediMind](https://github.com/aspire488/medimind)** `frozen prototype` · medication reminders for made-up patients only, not a medical device. [MediMind demo](https://medimind-seven.vercel.app/)
- **[CodeFlow](https://github.com/aspire488/codeflow)** `frozen prototype` · teaches C by stepping through simple programs; the real executor never got built. [CodeFlow demo](https://codeflow-app-sigma.vercel.app)

</details>

## Other people's code

`upstream`

As of 19 October 2026, pull requests to 30 repositories that aren't mine: **12 merged · 17 open · 7 draft · 15 closed without merging.** Some of the merged ones:

- [Microsoft PyRIT #2762](https://github.com/microsoft/PyRIT/pull/2762): an API that summarises datasets.
- [Microsoft PyRIT #2882](https://github.com/microsoft/PyRIT/pull/2882) and [#2976](https://github.com/microsoft/PyRIT/pull/2976): exact-text matching on an empty target, and converter identifiers that keep their settings.
- [Inspect AI #5670](https://github.com/UKGovernmentBEIS/inspect_ai/pull/5670): an explicit Google API key now wins over ambient credentials.
- [aios #2457](https://github.com/eumemic/aios/pull/2457) and [#2458](https://github.com/eumemic/aios/pull/2458): replies cut off by length are recorded as truncated, not complete.
- [agent-bench #8](https://github.com/PicadoLabs/agent-bench/pull/8): a command palette for the whole app.

One more: my own Hermes Agent PR ([#121771](https://github.com/NousResearch/hermes-agent/pull/121771)) was closed, and a maintainer carried its fix and tests, with my commits and credit, into [#126144](https://github.com/NousResearch/hermes-agent/pull/126144), which merged.

[Every pull request I've opened to other projects](https://github.com/search?q=is%3Apr+author%3Aaspire488+-user%3Aaspire488&type=pullrequests) · [OSS Atlas, my running log of that work](https://github.com/aspire488/oss-atlas)

## The boring numbers

Redrawn every hour by this repo's workflow. The pull request total on the overview card also counts PRs to my own repos.

<p align="center">
  <a href="https://github.com/aspire488/aspire488/actions/workflows/profile-cards.yml"><img src="https://github.com/aspire488/aspire488/actions/workflows/profile-cards.yml/badge.svg" alt="Profile cards GitHub Actions workflow status"></a>
</p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/profile/overview.dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="./assets/profile/overview.light.svg">
    <img src="./assets/profile/overview.dark.svg" width="100%" alt="Live-generated GitHub overview with contribution totals, stars, followers, pull requests, issues, and repositories.">
  </picture>
</p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/profile/contributions.dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="./assets/profile/contributions.light.svg">
    <img src="./assets/profile/contributions.dark.svg" width="100%" alt="Live-generated GitHub contribution activity and streak statistics.">
  </picture>
</p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/profile/activity.dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="./assets/profile/activity.light.svg">
    <img src="./assets/profile/activity.dark.svg" width="100%" alt="Green contribution-history grid showing daily activity over the rolling past year.">
  </picture>
</p>

<details>
<summary><strong>Open the deeper analytics</strong>: languages · contribution mix · weekly rhythm</summary>
<br>
<table>
<tr>
<td width="33%" valign="top">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/profile/languages.dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="./assets/profile/languages.light.svg">
  <img src="./assets/profile/languages.dark.svg" width="100%" alt="Breakdown of programming languages across public source repositories.">
</picture>
</td>
<td width="33%" valign="top">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/profile/composition.dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="./assets/profile/composition.light.svg">
  <img src="./assets/profile/composition.dark.svg" width="100%" alt="Contribution composition by commits, pull requests, issues, reviews and private contributions.">
</picture>
</td>
<td width="33%" valign="top">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/profile/rhythm.dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="./assets/profile/rhythm.light.svg">
  <img src="./assets/profile/rhythm.dark.svg" width="100%" alt="Contribution activity by weekday and month, comparing all-time and trailing-year activity.">
</picture>
</td>
</tr>
</table>
</details>

## Still open

That's the desk as of October 2026. Still open on it: KIO hasn't cleared gate C-4, Campus Bus hasn't met a second PC, and seven of those upstream pull requests are drafts. More projects will turn up here as they get far enough to show.

[All my repositories](https://github.com/aspire488?tab=repositories) · [Portfolio site](https://aspire488.github.io/aspire488/)
