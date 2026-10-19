<!-- aspire488 · Field Atlas. The plates and cards in assets/profile are regenerated hourly by .github/workflows/profile-cards.yml -->

<a href="#field-notes">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/profile/atlas.dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="./assets/profile/atlas.light.svg">
    <img src="./assets/profile/atlas.light.svg" width="100%" alt="Field Atlas of aspire488: a map of Joel Jigo's projects grouped into applications, tooling and infrastructure, each marked by maturity, with an upstream coastline of pull requests to other projects.">
  </picture>
</a>

<p align="center">
  <sub>
    <a href="#field-notes">field notes</a> &nbsp;·&nbsp;
    <a href="#shipped">shipped</a> &nbsp;·&nbsp;
    <a href="#systems-under-construction">systems</a> &nbsp;·&nbsp;
    <a href="#upstream">upstream</a> &nbsp;·&nbsp;
    <a href="#live-signal">live signal</a> &nbsp;·&nbsp;
    <a href="https://aspire488.github.io/aspire488/">portfolio ↗</a>
  </sub>
</p>

**Computer science engineering student.** I build applications, developer tooling and AI infrastructure, and I send fixes to other people's projects. The map above is redrawn every hour from the GitHub API: a station pulses when its project had a commit in the last two weeks, and every mark on the coast is one pull request to someone else's repository, coloured by what actually happened to it.

<br>

<sub><code>PLATE I</code></sub>

## Field notes

<sub>Lines from my own READMEs and design documents. They are the nearest thing this profile has to a manifesto.</sub>

> Coding agents are strongest when they reason about novel problems. They are a poor place to repeatedly re-derive facts that deterministic tools can establish faster and more reliably.
>
> <sub>— [UEA, README](https://github.com/aspire488/Universal-Engineering-Augmentation#readme)</sub>

<!-- note -->

> KIO never presents a ROADMAP fact as CURRENT.
>
> <sub>— [KIO identity canon, INV.002](https://github.com/aspire488/Kio/blob/main/KIO_IDENTITY_CANON.md)</sub>

<!-- note -->

> It never prints a password. Running it again changes nothing.
>
> <sub>— [Campus Bus, on its Windows setup script](https://github.com/aspire488/campus-bus#readme)</sub>

<!-- note -->

> **LLM token/call reduction:** not currently measured.
>
> <sub>— [UEA, on what it does not claim](https://github.com/aspire488/Universal-Engineering-Augmentation#readme)</sub>

<br>

<sub><code>PLATE II</code></sub>

## Shipped

<sub>Two projects with a public release you can download and run today.</sub>

<a href="https://github.com/aspire488/campus-bus"><img src="./assets/profile/work/campus-bus-seat-map.png" width="100%" alt="Campus Bus seat map: a route from High Court to the campus with every stop and time, above a bus layout where seat 07 is selected."></a>

### Campus Bus

<sub><code>SHIPPED · v1.1</code> &nbsp; Windows desktop · Java · Swing + JavaFX WebView · JDBC · MySQL 8</sub>

Seat reservation for a college transport office. Students find a bus by trip and stop, choose a seat on the bus map, and get a pass they can save as a PDF; the office manages buses, routes, timetables, students and reservations.

The release engineering is the interesting part: a 76 MB zip with its own Java 25 runtime built with `jlink`, and a setup script that installs a private, per-user MySQL on port 3310 with no admin rights. It gives every demo account a new random password, never prints one, and does nothing if run twice.

[**Download v1.1 ↗**](https://github.com/aspire488/campus-bus/releases/tag/v1.1) &nbsp;·&nbsp; [Source ↗](https://github.com/aspire488/campus-bus) &nbsp;·&nbsp; [All screenshots ↗](https://github.com/aspire488/campus-bus/tree/main/docs/screenshots)

<br>

<a href="https://aspire488.github.io/Pipo/"><img src="./assets/profile/work/pipo-world.jpg" width="100%" alt="Pipo's 3D room in the browser: a small round robot stands on a rug between his bed, his desk and a workbench, with Nib, his pet robot, beside him."></a>

### Pipo

<sub><code>SHIPPED · v1.0</code> &nbsp; Android 8.0+ · Kotlin · Three.js on GitHub Pages</sub>

A small robot with moods, memories, habits and projects who lives in a room on your phone. Nothing runs in the background: when the app reopens, the time you were away is replayed through the same behaviour engine, so something has changed when you come back. Sometimes he isn't home at all, just a note on the door. No account and no analytics.

The browser version is a Three.js room with a live day–night cycle, his pet robot Nib, and a "Where is Pipo?" camera.

[**Visit the room ↗**](https://aspire488.github.io/Pipo/) &nbsp;·&nbsp; [Android APK v1.0 ↗](https://github.com/aspire488/Pipo/releases/tag/v1.0) &nbsp;·&nbsp; [Source ↗](https://github.com/aspire488/Pipo)

<br>

<sub><code>PLATE III</code></sub>

## Systems under construction

<sub>Long-running work, at the stage each repository records for itself.</sub>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/profile/systems.dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="./assets/profile/systems.light.svg">
  <img src="./assets/profile/systems.light.svg" width="100%" alt="Three system diagrams. KIO: convergence gates C-1 context, C-2 registry and C-3 planning done, C-4 response in progress, built on AURA. UEA: task, keyword classifier, specialist, verify, with an optional local model only for unknown tasks and five verification tiers. gh-ops: six jobs through one dispatcher, in GitHub Actions or locally, ending in a Telegram brief.">
</picture>

- **[KIO](https://github.com/aspire488/Kio)** is an orchestration runtime that moves forward through audited gates; its convergence began by deleting 5,167 lines. It runs on **[AURA](https://github.com/aspire488/AURA)**, an event-driven memory and reasoning backend that has been paused since June 2026. KIO has no public README yet; its governance documents live in the repository root.
- **[UEA](https://github.com/aspire488/Universal-Engineering-Augmentation)** moves repeatable engineering work out of model reasoning and into deterministic tools: tree-sitter analysis, blast-radius impact, property and mutation testing, Z3 checks. It's a public alpha, tested in CI on Python 3.10–3.12.
- **[gh-ops](https://github.com/aspire488/gh-ops)** is my GitHub operations layer: monitoring, security, weekly reports and open-source scouting on GitHub Actions. It's frozen; its README records 1,495 passing tests at the freeze.

<details>
<summary><strong>Also on the map</strong>: two frozen prototypes and the ledger</summary>
<br>

| Project | State | What it is |
| --- | --- | --- |
| [CodeFlow](https://github.com/aspire488/codeflow) · [demo ↗](https://codeflow-app-sigma.vercel.app) | frozen prototype | Programming lessons that treat program state, output and control flow as the thing being taught. |
| [MediMind](https://github.com/aspire488/medimind) · [demo ↗](https://medimind-seven.vercel.app/) | frozen prototype | A medication-reminder workflow on synthetic data only; "not a medical device" is a design constraint, not a disclaimer. |
| [OSS Atlas](https://github.com/aspire488/oss-atlas) | updated daily | My ledger of open-source work, with notes, case studies and what I learned, kept current by GitHub Actions. |

</details>

<br>

<sub><code>PLATE IV</code></sub>

## Upstream

<sub>Pull requests to projects I don't own, generated hourly from the GitHub API. A pull request counts as merged only when upstream maintainers merged it.</sub>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/profile/upstream.dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="./assets/profile/upstream.light.svg">
  <img src="./assets/profile/upstream.light.svg" width="100%" alt="Upstream ledger: counts of merged, open, draft and closed pull requests to other projects, and one mark per pull request for each repository.">
</picture>

### Selected merged work

| Project | Pull request | What changed |
| --- | --- | --- |
| Microsoft PyRIT | [#2762](https://github.com/microsoft/PyRIT/pull/2762) | Added a dataset summary API. |
| Microsoft PyRIT | [#2823](https://github.com/microsoft/PyRIT/pull/2823) · [#2882](https://github.com/microsoft/PyRIT/pull/2882) · [#2976](https://github.com/microsoft/PyRIT/pull/2976) | Kept HarmBench context, fixed exact-text matching on an empty target, kept word-selection parameters in converter identifiers. |
| Inspect AI <sub>UK AISI</sub> | [#5670](https://github.com/UKGovernmentBEIS/inspect_ai/pull/5670) | An explicit Google API key now wins over ambient ADC credentials. |
| aios | [#2457](https://github.com/eumemic/aios/pull/2457) · [#2458](https://github.com/eumemic/aios/pull/2458) · [#2459](https://github.com/eumemic/aios/pull/2459) · [#2460](https://github.com/eumemic/aios/pull/2460) | Preserved finish reasons, truncation, timeout bounds and LiteLLM parameter translation across streaming and workflows. |

[Every pull request ↗](https://github.com/pulls?q=is%3Apr+author%3Aaspire488+-user%3Aaspire488) &nbsp;·&nbsp; [OSS Atlas ↗](https://github.com/aspire488/oss-atlas)

<br>

<sub><code>PLATE V</code></sub>

## Live signal

<sub>Rendered from GitHub data by this repository's own workflow, then committed as plain SVG. No third-party image service sits between you and these numbers.</sub>

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

<br>

<sub><code>PLATE VI</code></sub>

## The unsurveyed edge

The map isn't finished, and it isn't meant to be. KIO's next gate is C-4, response separation. The open marks on the upstream coast are waiting for maintainers. New projects get a station when there's something there to visit.

<p align="center">
  <a href="https://aspire488.github.io/aspire488/"><strong>Portfolio ↗</strong></a> &nbsp;·&nbsp;
  <a href="https://github.com/aspire488?tab=repositories"><strong>Repositories ↗</strong></a> &nbsp;·&nbsp;
  <a href="https://github.com/aspire488/oss-atlas"><strong>OSS Atlas ↗</strong></a>
</p>

<p align="center"><sub>Plates drawn by <a href="./scripts/render_profile_atlas.py"><code>scripts/render_profile_atlas.py</code></a> · cards by <a href="https://github.com/seijikohara/profile-cards-action">profile-cards-action</a> · refreshed hourly</sub></p>
