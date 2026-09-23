<p align="center">
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0d1117,50:1a1b27,100:70a5fd&height=220&section=header&text=Joel%20%7C%20aspire488&fontSize=42&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=CS%20Student%20%E2%80%A2%20Builder%20%E2%80%A2%20Systems%20Focus&descAlignY=56&descSize=16" width="100%"/>
</p>

<p align="center">
<img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&size=20&pause=900&color=70A5FD&center=true&vCenter=true&width=800&lines=Building+systems+that+actually+do+things.;From+ideas+to+execution.;Automation+%2B+AI+%2B+real+tools.;Learning+by+shipping.;Engineering+systems%2C+not+just+demos."/>
</p>

<p align="center">
<img src="https://komarev.com/ghpvc/?username=aspire488&style=flat-square&label=Profile+Views"/>
<img src="https://img.shields.io/github/followers/aspire488?style=flat-square&label=Followers"/>
<img src="https://img.shields.io/github/stars/aspire488?style=flat-square&label=Stars"/>
<img src="https://img.shields.io/github/commit-activity/y/aspire488/Universal-Engineering-Augmentation?style=flat-square&label=UEA%20Activity"/>
</p>

---

# 👋 Joel — systems-focused CSE student

> **GitHub Developer Program Member** — building and experimenting with software that integrates with the GitHub ecosystem. GitHub automatically displays the official Developer Program Member badge on eligible profiles. [Program details](https://docs.github.com/en/integrations/concepts/github-developer-program)

I build **AI systems, developer tools, automation, and experimental software systems** with an emphasis on execution, architecture, verification, and measurable behavior.

> **What should an AI reason about, and what should reliable software do deterministically?**

I learn by shipping, breaking things, measuring them, and then hardening the parts that are worth keeping.


<p align="center">
  <a href="https://joel-jigo-portfolio--joeljigo3.replit.app"><img src="https://img.shields.io/badge/%E2%86%92%20Portfolio-Visit%20Joel's%20Portfolio-70a5fd?style=for-the-badge"/></a>
</p>

---

## 🏗️ Engineering Portfolio

### Architecture at a glance

```mermaid
flowchart LR
    A[Intent / Problem] --> B[AI Reasoning]
    B --> C[Deterministic Systems]
    C --> D[Execution]
    D --> E[Verification]
    E --> F[Evidence / State]
    F --> B
    UEA[UEA\nEngineering Augmentation] --> C
    KIO[KIO\nExecution Kernel] --> D
    AURA[AURA\nMemory & Cognition] --> B
    KIO <--> AURA
    UEA --> KIO
```

This is the design boundary running through the portfolio: **reasoning handles ambiguity; deterministic infrastructure owns execution, state, safety, and verification.**

### ⚙️ [gh-ops](https://github.com/aspire488/gh-ops) — Operational Intelligence Platform

A reusable, deterministic GitHub operations layer running on GitHub Actions. gh-ops combines repository, CI, release, and security monitoring with OSS opportunity intelligence, developer activity reporting, persistent state, scheduled workflows, and outbound Telegram notifications.

The system is deliberately **read-only against GitHub**: collection and analysis are automated, while execution boundaries, state, and verification remain deterministic.

`Python` `GitHub Actions` `GitHub API` `Telegram` `State & Events` `OSS Intelligence`

<a href="https://github.com/aspire488/gh-ops"><img src="https://img.shields.io/badge/Repository-Open-70a5fd?style=for-the-badge"/></a>
<a href="https://github.com/aspire488/gh-ops/actions"><img src="https://img.shields.io/github/actions/workflow/status/aspire488/gh-ops/daily.yml?branch=master&style=for-the-badge&label=Actions"/></a>

**Current:** Phases 1–8 are implemented, with scheduled GitHub Actions, dedicated CI validation, and Telegram operations live. CI validates Ruff, mypy, and the full pytest suite on pushes and pull requests. The latest CI hardening fixed an editable-install failure caused by an unsupported setuptools backend in [`gh-ops #2`](https://github.com/aspire488/gh-ops/pull/2). The next work is persistent cross-run OSS opportunity state and its notification path.

### 🛠️ [Universal Engineering Augmentation](https://github.com/aspire488/Universal-Engineering-Augmentation) — Public Alpha

Agent-neutral engineering infrastructure for coding agents. UEA moves repeatable engineering work from probabilistic reasoning into deterministic code intelligence, dependency/impact analysis, verification, property/mutation testing, formal reasoning, candidate isolation, routing, provenance, event logging, analytics, and reusable capabilities.

The core stays agent-neutral while integrations can sit beside **OpenCode, Claude Code, Codex, or other coding agents**.

`Python` `Tree-sitter` `Z3` `Hypothesis` `SQLite` `DuckDB` `MCP`

<a href="https://github.com/aspire488/Universal-Engineering-Augmentation"><img src="https://img.shields.io/badge/Repository-Open-70a5fd?style=for-the-badge"/></a>
<a href="https://github.com/aspire488/Universal-Engineering-Augmentation/actions"><img src="https://img.shields.io/github/actions/workflow/status/aspire488/Universal-Engineering-Augmentation/ci.yml?branch=main&style=for-the-badge&label=CI"/></a>
<a href="https://github.com/aspire488/Universal-Engineering-Augmentation/releases"><img src="https://img.shields.io/github/v/release/aspire488/Universal-Engineering-Augmentation?style=for-the-badge&label=Release"/></a>
<a href="https://github.com/aspire488/Universal-Engineering-Augmentation/issues"><img src="https://img.shields.io/github/issues/aspire488/Universal-Engineering-Augmentation?style=for-the-badge&label=Issues"/></a>

### 🧠 [AURA](https://github.com/aspire488/AURA) — Paused

**Autonomous Unified Reasoning Architecture** — a FastAPI-based memory and cognition backend implementing persistent memory storage/retrieval, cognitive artifacts, and reflection-oriented processing for long-lived agent state.

`Python` `FastAPI` `Memory` `Cognitive Artifacts` `Agents`

<a href="https://github.com/aspire488/AURA"><img src="https://img.shields.io/badge/Repository-Explore-70a5fd?style=for-the-badge"/></a>

### 🤖 [KIO](https://github.com/aspire488/Kio) — Paused after Gate 5

**Kernel for Intelligent Orchestration** — a modular execution kernel that resolves capabilities, plans actions, applies security gates, dispatches providers, executes tools, and verifies resulting state.

KIO turns intent into real actions through:

> **Observe → Reason → Plan → Execute → Verify → Adapt**

It owns capability resolution, provider dispatch, security gates, browser/MCP execution, artifacts, runtime state, recovery, and verification of real side effects.

The repository currently contains **63 validated automation templates** integrated through the canonical KIO execution path.

`Python` `Automation` `Browser Automation` `MCP` `Provider Systems` `Verification`

<a href="https://github.com/aspire488/Kio"><img src="https://img.shields.io/badge/Repository-Explore-70a5fd?style=for-the-badge"/></a>
<a href="https://github.com/aspire488/Kio"><img src="https://img.shields.io/badge/63-Validated%20Automations-2ea44f?style=for-the-badge"/></a>
<a href="https://github.com/aspire488/Kio#readme"><img src="https://img.shields.io/badge/Architecture-Read-70a5fd?style=for-the-badge"/></a>

> **Architecture principle:** AI handles ambiguity and strategy; deterministic software owns execution, safety, state, and verification.

---

## 🧪 Frozen Product Prototypes

These projects are no longer active product-development tracks. They have been hardened into inspectable, reproducible portfolio artifacts.

### ⚡ [CodeFlow](https://github.com/aspire488/codeflow) — Frozen Prototype

Execution-first programming-learning prototype focused on visible execution state, code visualization, exercises, and bounded AI assistance.

**Live:** [codeflow-app-sigma.vercel.app](https://codeflow-app-sigma.vercel.app)

`JavaScript` `Vite` `Execution Visualization` `PWA`

<a href="https://codeflow-app-sigma.vercel.app"><img src="https://img.shields.io/badge/%E2%96%B6%20LIVE%20DEMO-Open-success?style=for-the-badge"/></a>
<a href="https://github.com/aspire488/codeflow"><img src="https://img.shields.io/badge/Source-GitHub-70a5fd?style=for-the-badge"/></a>
<a href="https://github.com/aspire488/codeflow/actions"><img src="https://img.shields.io/github/actions/workflow/status/aspire488/codeflow/ci.yml?branch=main&style=for-the-badge&label=CI"/></a>
<a href="https://github.com/aspire488/codeflow/releases"><img src="https://img.shields.io/github/v/release/aspire488/codeflow?style=for-the-badge&label=Releases"/></a>

**Final hardening:** Node 22, Vite 8, production-build CI, tagged release validation, Dependabot, CodeQL, deployment security headers, explicit prototype boundary, and MIT licensing.

### 💊 [MediMind Care](https://github.com/aspire488/medimind) — Frozen Prototype

AI-assisted medication-reminder and health-workflow prototype exploring role-specific UX, deterministic reminders, accessibility, synthetic data, and bounded AI assistance.

**Live:** [medimind-seven.vercel.app](https://medimind-seven.vercel.app/)

`React 18` `Vite 6` `Gemini` `Accessibility` `Safety Boundaries`

<a href="https://medimind-seven.vercel.app/"><img src="https://img.shields.io/badge/%E2%96%B6%20LIVE%20DEMO-Open-success?style=for-the-badge"/></a>
<a href="https://github.com/aspire488/medimind"><img src="https://img.shields.io/badge/Source-GitHub-70a5fd?style=for-the-badge"/></a>
<a href="https://github.com/aspire488/medimind/actions"><img src="https://img.shields.io/github/actions/workflow/status/aspire488/medimind/ci.yml?branch=main&style=for-the-badge&label=CI"/></a>
<a href="https://github.com/aspire488/medimind/releases"><img src="https://img.shields.io/github/v/release/aspire488/medimind?style=for-the-badge&label=Releases"/></a>

**Final hardening:** Node 22 CI baseline, Playwright browser smoke coverage, Chromium validation, CodeQL, Dependabot, deployment security headers, environment/credential hygiene, explicit medical safety boundary, and MIT licensing.

The application intentionally remains on its React 18/Vite 6 prototype stack rather than taking an unvalidated framework migration.

---

## 🔗 Project Map

| Project | Stage | Repository | Live / Docs |
|---|---|---|---|
| ⚙️ gh-ops | Operational / Phase 8 | [GitHub](https://github.com/aspire488/gh-ops) | [README](https://github.com/aspire488/gh-ops#readme) |
| 🤖 KIO | Paused after Gate 5 | [GitHub](https://github.com/aspire488/Kio) | [README](https://github.com/aspire488/Kio#readme) |
| 🧠 AURA | Paused | [GitHub](https://github.com/aspire488/AURA) | [Architecture](https://github.com/aspire488/AURA#readme) |
| 🛠️ UEA | Public Alpha | [GitHub](https://github.com/aspire488/Universal-Engineering-Augmentation) | [README](https://github.com/aspire488/Universal-Engineering-Augmentation#readme) |
| ⚡ CodeFlow | Frozen Prototype | [GitHub](https://github.com/aspire488/codeflow) | [Live](https://codeflow-app-sigma.vercel.app) |
| 💊 MediMind | Frozen Prototype | [GitHub](https://github.com/aspire488/medimind) | [Live](https://medimind-seven.vercel.app/) |

---

## 🔀 Open-Source Engineering

I use open source as an external engineering track: working across unfamiliar codebases, contributing real changes, and learning how software is built and maintained outside my own projects.

### Upstream work

I distinguish **merged work from open proposals** so the repository status is explicit.

#### ✅ Merged upstream work

- [aios #2457 — Preserve `length` finish reason across streaming trailers](https://github.com/eumemic/aios/pull/2457)  
  Merged upstream fix preserving provider-reported `finish_reason="length"` when trailing streaming chunks clobber the assembled finish reason, with regression coverage and `content_filter` precedence handling.

- [aios #2460 — Preserve LiteLLM parameter translation](https://github.com/eumemic/aios/pull/2460)  
  Merged upstream fix that preserves LiteLLM provider-specific parameter translation while retaining explicit `allowed_openai_params` overrides, with regression coverage for mapped, unmapped, and explicitly forced parameters.

#### 🔄 Open upstream PRs — September 2026

**25 open PRs currently tracked**, spanning AI infrastructure, developer tooling, databases/query optimizers, observability, security tooling, and systems software. This list is intentionally curated around substantive engineering work rather than contribution-count inflation.

- [KiroCrew #12861 — Restore PDF search behind bounded extraction](https://github.com/kirodotdev/KiroCrew/pull/12861) — bounded PDF extraction with isolated child processing, Windows-safe execution, truncation handling, and regression coverage.
- [PyRIT #2762 — Add dataset summary API](https://github.com/microsoft/PyRIT/pull/2762) — memory-backed dataset summaries covering grouped examples, seed pieces, objectives, modalities, and harm metadata.
- [LlamaIndex #23201 — Preserve retrieved scores during prev/next expansion](https://github.com/run-llama/llama_index/pull/23201) — preserves original retrieval scores through overlapping previous/next-node expansion.
- [GitHub Profile Analyzer #30 — Evidence-weighted impact scoring](https://github.com/0xarchit/github-profile-analyzer/pull/30) — balances adoption signals with independent repository evidence and regression coverage.
- [OpenHands #17579 — Align condenser max-size validation](https://github.com/OpenHands/OpenHands/pull/17579) — aligns the UI metadata and persistence mocks with the agent-server `condenser.max_size` contract and minimum of 20.
- [N3MO #39 — Ruby/Kotlin language routing coverage](https://github.com/RajX-dev/N3MO/pull/39) — regression coverage for parser loading, extension routing, and symbol extraction.
- [IntelliJ PowerShell #506 — Resolve pwsh reparse points](https://github.com/intellij-powershell/intellij-powershell/pull/506) — handles WindowsApps PowerShell executable reparse points.
- [quiche #2756 — Unify PTO timer duration](https://github.com/cloudflare/quiche/pull/2756) — centralizes PTO-based timer duration.
- [quiche #2758 — Verify peers with custom CA](https://github.com/cloudflare/quiche/pull/2758) — keeps peer verification enabled when a custom CA is supplied.
- [quiche #2759 — Ignore ACKs for non-in-flight packets](https://github.com/cloudflare/quiche/pull/2759) — prevents Reno congestion-window growth from ACKs for non-in-flight packets.
- [OpenTelemetry Erlang #822 — Isolate Req spans across retries](https://github.com/open-telemetry/opentelemetry-erlang-contrib/pull/822) — isolates client span state across retries and redirects.
- [RisingWave #27181 — Inspect correlated refs in LogicalValues](https://github.com/risingwavelabs/risingwave/pull/27181) — detects correlated references inside `LogicalValues` rows to protect decorrelation.
- [MVT #939 — Preserve equals signs in STIX indicators](https://github.com/mvt-project/mvt/pull/939) — fixes parsing of indicator values containing `=`.
- [Coder #29668 — Deduplicate Unknown AI Gateway clients](https://github.com/coder/coder/pull/29668) — normalizes nullable/literal Unknown client identities.
- [AI Platform AWS #4 — Fix provider routing specificity](https://github.com/tysoncung/ai-platform-aws/pull/4) — fixes routing precedence between direct Anthropic and generic Bedrock Claude paths.
- [AgentBench #8 — Add global command palette](https://github.com/PicadoLabs/agent-bench/pull/8) — adds global command navigation, fuzzy search, keyboard interaction, and accessibility semantics.
- [GoalAI #1 — Prediction Intelligence Lab](https://github.com/adityamallia7/GoalAI-Score-predictor-26/pull/1) — reproducible seeded Monte Carlo analysis, sensitivity/stability metrics, tests, and documentation.
- [aios #2458 — Record streaming length as truncated output](https://github.com/eumemic/aios/pull/2458) — preserves provider timeout/truncation telemetry at the loop layer.
- [aios #2459 — Preserve timeout bound in child outcome](https://github.com/eumemic/aios/pull/2459) — retains whether child execution hit the deadline or spend ceiling and now exposes that bound through the caller-visible `AgentError` contract with regression coverage.
- [Cognee #2 — Telemetry error-type fix](https://github.com/aspire488/cognee/pull/2) — fork-side validation branch for telemetry error classification; not an upstream contribution.
- [Cognee #1 — Active agent status](https://github.com/aspire488/cognee/pull/1) — fork-side active-agent status work; maintained separately from upstream contributions.
- [UEA #15 — Publish agent adapter and CLI integration](https://github.com/aspire488/Universal-Engineering-Augmentation/pull/15) — documents the agent adapter and CLI integration path.
- [Profile README #3 — Refresh engineering activity](https://github.com/aspire488/aspire488/pull/3) — profile-repository documentation work; current README updates are also applied directly to main.
- [linguist #1 — Trim .example suffix before detection](https://github.com/aspire488/linguist/pull/1) — fork-side language-detection fix under review.

> **Status note:** Open means the PR is currently open on GitHub; it does not imply maintainer acceptance or CI success. Fork-side PRs are explicitly identified so they are not confused with upstream contributions.

#### 🧪 In progress

- [Cognee #4957 — Detect active agent connections](https://github.com/aspire488/cognee/tree/fix/4957-active-agent-status)  
  Implements active-connection detection in the dashboard/integrations hook with focused regression coverage. The fix remains on the fork branch pending upstream PR creation.

- [Cognee telemetry follow-up — validation branch](https://github.com/aspire488/cognee/tree/fix/telemetry-error-type)  
  Explored a narrow pipeline error-type telemetry fix, then verified it overlaps with existing upstream telemetry work (#5159). It is therefore **not listed as an upstream contribution**.

##### Recent OSS validation — September 2026

The aios contribution sequence now includes two merged upstream fixes (#2457 and #2460), with #2460 following the earlier streaming/truncation work as a separate provider-parameter correctness fix. #2460 was merged upstream after a maintainer-led wire-level review and CI validation; the remaining aios follow-ups (#2458 and #2459) stay open and separately scoped. For #2459, the latest follow-up also makes the timeout bound caller-visible (`deadline` vs `spend`) and adds regression coverage for precedence and legacy timeout behavior.

The latest local validation pass covered three repositories with focused fixes/regression coverage and remote PR updates. Separately, `gh-ops` CI was investigated from the failing workflow logs and the packaging failure was isolated and fixed in [`gh-ops #2`](https://github.com/aspire488/gh-ops/pull/2):

- [gh-ops #2](https://github.com/aspire488/gh-ops/pull/2) — fixes the CI editable-install failure by switching from the unsupported `setuptools.backends._legacy:_Backend` to `setuptools.build_meta`.
- [PyRIT #2762](https://github.com/microsoft/PyRIT/pull/2762) — addressed dataset-summary review feedback around metadata aggregation and row multiplication; current branch keeps aggregation and metadata collection in a single database-side query.
- [N3MO #39](https://github.com/RajX-dev/N3MO/pull/39) — fixed Kotlin call-target extraction exposed by the real AST regression test; targeted Ruby/Kotlin tests passed.
- [OpenHands #17579](https://github.com/OpenHands/OpenHands/pull/17579) — aligned condenser max-size metadata with the agent-server minimum, updated persistence mocks/tests, and recorded focused local validation.

> Local validation is reported separately from upstream CI; platform-specific or maintainer-side checks remain the responsibility of the upstream project.

#### Earlier upstream work

- [Clicky #72 — Contributor quickstart revamp](https://github.com/daniel5151/clicky/pull/72)  
  Emulator contributor workflow covering boot paths, safe disk-image setup, firmware smoke tests, troubleshooting, and development handoff.

#### 🔎 Upstream code review

- [Agent Substrate #1104 — dual-stack egress regression review](https://github.com/agent-substrate/substrate/pull/1104)  
  Reviewed the in-cluster egress test against [#1089](https://github.com/agent-substrate/substrate/issues/1089), identifying that the dual-stack case currently verifies only eventual HTTP success and does not directly prove the broken-IPv6 → IPv4 fallback behavior. Suggested making the regression test exercise the actual no-route/fallback condition rather than merely adding family coverage.

#### 🔎 Upstream architecture discussions

- [Agent Sandbox #1615 — Routing requests across multiple claimed Sandboxes](https://github.com/kubernetes-sigs/agent-sandbox/issues/1615)  
  Discussed the boundary between higher-level orchestration and the sandbox router for multi-Sandbox request distribution, including instance selection, readiness/capacity signals, retry/failover semantics, and a clean orchestrator → router → Sandbox responsibility split.

#### 💬 Community technical discussions

- [Lexical #8771 — Named Slots for paginated editors](https://github.com/facebook/lexical/discussions/8771)  
  Discussed separating page-region modeling from pagination/flow logic.

- [MCP Registry #921 — Using the published Docker image](https://github.com/modelcontextprotocol/registry/discussions/921)  
  Explained the GHCR image workflow and PostgreSQL-backed deployment model.

- [VS Code Discussions #3109 — Diagnosing Electron main-process hangs](https://github.com/microsoft/vscode-discussions/discussions/3109)  
  Proposed an incident-diagnostics workflow around watchdogs, event-loop health, Node diagnostic reports, process dumps, profiling, and IPC telemetry.

- [MVT Discussions — STIX indicator parsing](https://github.com/mvt-project/mvt/discussions)  
  Discussed whether MVT should keep lightweight STIX parsing or introduce a small explicit parsing/validation boundary for malformed and edge-case indicator values.

- [OpenAI Codex #46658 — Beyond Auto mode: adaptive allocation](https://github.com/openai/codex/discussions/46658)  
  Discussed evidence-driven allocation of models, reasoning effort, tools, and subagents, including reassessment triggers, effective inherited configuration, rerouting observability, verification boundaries, and attributable compute cost.

> **Selected, not exhaustive.** This section intentionally distinguishes **proposed upstream work** from **accepted/merged work**. Discussion participation is listed separately from code contributions.

 This section favors substantive engineering work over activity-count inflation.

**Open-source contribution history:** [View my PRs across GitHub](https://github.com/pulls?q=is%3Apr%20author%3Aaspire488)

---

## 💬 Technical Discussions

I also contribute through **GitHub Discussions** — answering concrete engineering questions in unfamiliar codebases and sharing implementation-level reasoning with maintainers and other developers.

### Recent discussions

- 🧩 [Lexical #8771 — Named Slots for paginated editors](https://github.com/facebook/lexical/discussions/8771)  
  Discussed separating **page-region modeling** from **pagination/flow logic**, using Named Slots for independently editable header/footer regions while keeping content pagination as a higher-level layout concern.

- 🐳 [MCP Registry #921 — Using the published Docker image](https://github.com/modelcontextprotocol/registry/discussions/921)  
  Explained the GHCR image workflow, the distinction between the pre-built Registry image and the full local development environment, and the PostgreSQL dependency for persistent deployments.

- ⚡ [VS Code Discussions #3109 — Diagnosing Electron main-process hangs](https://github.com/microsoft/vscode-discussions/discussions/3109)  
  Proposed a practical incident-diagnostics workflow around external watchdogs, event-loop health, Node diagnostic reports, process dumps, CPU profiling, IPC telemetry, and separating JavaScript starvation from synchronous/native/OS blocking.

- 🧩 [MVT Discussions — STIX indicator parsing](https://github.com/mvt-project/mvt/discussions)  
  Discussed the parsing boundary around STIX indicators, including values containing `=`, malformed patterns, validation, and preserving existing detection semantics.

> Discussion answers are kept focused on reproducible engineering practices, implementation details, and primary documentation rather than activity for its own sake.

---

## 🧠 Engineering Principles

- **Deterministic software owns execution; AI handles ambiguity.**
- **Verification is part of implementation, not a final step.**
- **Measure behavior before claiming improvement.**

---

## 🛠️ Stack

<p align="center">
<strong>Languages</strong><br/>
<img src="https://skillicons.dev/icons?i=python,js,c,html,css&theme=dark"/>
<br/><br/>
<strong>Frameworks & Platforms</strong><br/>
<img src="https://skillicons.dev/icons?i=react,nodejs,vite,tailwind,electron,fastapi&theme=dark"/>
<br/><br/>
<strong>Tools & Infrastructure</strong><br/>
<img src="https://skillicons.dev/icons?i=git,github,vscode,vercel,linux,docker,postgres,redis&theme=dark"/>
</p>

---

## 🏷️ Technologies & Tools

<p align="center">
<strong>Languages</strong><br/>
<img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white"/>
<img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"/>
<img src="https://img.shields.io/badge/C-A8B9CC?style=for-the-badge&logo=c&logoColor=black"/>
<img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white"/>
<img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white"/>
</p>

<p align="center">
<strong>Systems & Frameworks</strong><br/>
<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/>
<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white"/>
<img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white"/>
<img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>
<img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white"/>
</p>

<p align="center">
<strong>Engineering & Infrastructure</strong><br/>
<img src="https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white"/>
<img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white"/>
<img src="https://img.shields.io/badge/Linux-FCC624?style=for-the-badge&logo=linux&logoColor=black"/>
<img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white"/>
<img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white"/>
<img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white"/>
</p>

<p align="center">
<strong>AI / Developer Workflow</strong><br/>
<img src="https://img.shields.io/badge/Claude-D97757?style=for-the-badge&logo=claude&logoColor=white"/>
<img src="https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white"/>
<img src="https://img.shields.io/badge/VS_Code-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white"/>
<img src="https://img.shields.io/badge/MCP-111827?style=for-the-badge"/>
</p>

> These badges describe the technologies currently represented in my public projects and engineering workflow — they are not certification badges.

---

## 📊 GitHub Activity

<p align="center">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/profile/overview.dark.svg" />
  <source media="(prefers-color-scheme: light)" srcset="./assets/profile/overview.light.svg" />
  <img alt="GitHub overview" src="./assets/profile/overview.dark.svg" width="100%"/>
</picture>
</p>

<p align="center">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/profile/lifetime.dark.svg" />
  <source media="(prefers-color-scheme: light)" srcset="./assets/profile/lifetime.light.svg" />
  <img alt="Full-width contribution history" src="./assets/profile/lifetime.dark.svg" width="100%"/>
</picture>
</p>

<p align="center">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/profile/languages.dark.svg" />
  <source media="(prefers-color-scheme: light)" srcset="./assets/profile/languages.light.svg" />
  <img alt="Language composition" src="./assets/profile/languages.dark.svg" width="100%"/>
</picture>
</p>

<p align="center">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/profile/rhythm.dark.svg" />
  <source media="(prefers-color-scheme: light)" srcset="./assets/profile/rhythm.light.svg" />
  <img alt="Contribution rhythm" src="./assets/profile/rhythm.dark.svg" width="100%"/>
</picture>
</p>

<p align="center">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/profile/composition.dark.svg" />
  <source media="(prefers-color-scheme: light)" srcset="./assets/profile/composition.light.svg" />
  <img alt="Contribution composition" src="./assets/profile/composition.dark.svg" width="100%"/>
</picture>
</p>

> Activity cards are generated by GitHub Actions and committed to this profile repository, avoiding fragile third-party statistics endpoints.

---

## 🎯 Current Direction

| Track | State / next milestone |
|---|---|
| ⚙️ gh-ops | Phase 8 operational hardening + OSS persistence |
| 🤖 KIO | Paused after Gate 5 completion |
| 🧠 AURA | Paused; core cognition architecture checkpoint complete |
| 🛠️ UEA | Public alpha + reusable engineering infrastructure |
| ⚡ CodeFlow | Frozen, hardened prototype |
| 💊 MediMind | Frozen, hardened prototype |
| 🌍 Open Source | Cross-project contributions + upstream engineering |

---

<p align="center">
<img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&size=18&pause=900&color=70A5FD&center=true&vCenter=true&width=800&lines=Not+just+building+ideas...;Building+systems+that+execute.;Turning+code+into+real+world+actions.;Learning+by+shipping.;Building+in+public."/>
</p>

<p align="center">
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:70a5fd,100:0d1117&height=140&section=footer" width="100%"/>
</p>

<p align="center"><strong>Building in public • Shipping real systems • Learning by doing</strong></p>
