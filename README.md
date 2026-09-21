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

**Current:** Phases 1–8 are implemented, with GitHub Actions and Telegram operations live. The next work is persistent cross-run OSS opportunity state and its notification path.

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

**Observe → Reason → Plan → Execute → Verify → Adapt**

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

#### 🔄 Open upstream PRs

**Current batch**

- [Hiero Bot #100 — Coalesce concurrent config cache misses](https://github.com/AnthropicBots/hiero-bot-py/pull/100)  
  Adds per-repository in-flight request coalescing so concurrent webhook bursts issue one GitHub contents request, with regression coverage.

- [Thrylos #4 — Enforce Tier-A determinism in CI](https://github.com/thrylos-labs/thrylos/issues/4)  
  Adds an auditable CI source check preventing floating-point types from entering Tier-A consensus-critical Rust crates.

- [Coder #29668 — Deduplicate `Unknown` AI Gateway clients](https://github.com/coder/coder/pull/29668)  
  Groups nullable and literal `Unknown` client values by their displayed identity and adds regression coverage.

- [quiche #2756 — Unify PTO-based timer duration](https://github.com/cloudflare/quiche/pull/2756)  
  Centralizes the 3×PTO duration used by timeout paths to keep timer calculations consistent.

- [MVT #939 — Preserve equals signs in STIX indicator values](https://github.com/mvt-project/mvt/pull/939)  
  Fixes STIX parsing for values containing `=` and adds regression coverage for URL query parameters.

- [ai-memory #828 — Expand agent-memory comparison coverage](https://github.com/akitaonrails/ai-memory/pull/828)  
  Expands the comparison matrix with Engram, Caura, TencentDB Agent Memory, memU, and EverOS.

- [RisingWave #27181 — Inspect correlated refs in LogicalValues](https://github.com/risingwavelabs/risingwave/pull/27181)  
  Fixes optimizer correlation detection for `LogicalValues` rows and adds regression coverage for correlated input references.

- [OpenTelemetry Erlang #822 — Isolate Req spans across retries and redirects](https://github.com/open-telemetry/opentelemetry-erlang-contrib/pull/822)  
  Fixes Req client-span state leaking into parent traces across retries/redirects and adds regression coverage for retry isolation.

**Earlier upstream work**

- [AI Platform AWS #4 — direct Anthropic provider routing](https://github.com/tysoncung/ai-platform-aws/pull/4)  
  Direct Anthropic Claude matches resolve before generic Bedrock routing independent of provider registration order, with regression coverage.

- [OpenHands #17579 — Condenser settings validation](https://github.com/OpenHands/OpenHands/pull/17579)  
  Adds validation and regression coverage for invalid negative values while preserving zero as valid.

- [AgentBench #8 — Global command palette](https://github.com/PicadoLabs/agent-bench/pull/8)  
  Global command navigation, fuzzy search, keyboard interaction, accessibility semantics, and architecture documentation.

- [GoalAI #1 — Prediction Intelligence Lab](https://github.com/adityamallia7/GoalAI-Score-predictor-26/pull/1)  
  Reproducible Monte Carlo analysis, sensitivity analysis, stability metrics, tests, and documentation.

- [N3MO #39 — Language routing and parser regression coverage](https://github.com/RajX-dev/N3MO/pull/39)

- [Clicky #72 — Contributor quickstart revamp](https://github.com/daniel5151/clicky/pull/72)  
  Emulator contributor workflow covering boot paths, safe disk-image setup, firmware smoke tests, troubleshooting, and development handoff.

#### 💬 Community technical discussions

- [Lexical #8771 — Named Slots for paginated editors](https://github.com/facebook/lexical/discussions/8771)  
  Discussed separating page-region modeling from pagination/flow logic.

- [MCP Registry #921 — Using the published Docker image](https://github.com/modelcontextprotocol/registry/discussions/921)  
  Explained the GHCR image workflow and PostgreSQL-backed deployment model.

- [VS Code Discussions #3109 — Diagnosing Electron main-process hangs](https://github.com/microsoft/vscode-discussions/discussions/3109)  
  Proposed an incident-diagnostics workflow around watchdogs, event-loop health, Node diagnostic reports, process dumps, profiling, and IPC telemetry.

- [MVT Discussions — STIX indicator parsing](https://github.com/mvt-project/mvt/discussions)  
  Discussed whether MVT should keep lightweight STIX parsing or introduce a small explicit parsing/validation boundary for malformed and edge-case indicator values.


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
  <img alt="GitHub overview" src="./assets/profile/overview.light.svg" width="100%"/>
</picture>
</p>

<p align="center">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/profile/contributions.dark.svg" />
  <img alt="Contribution history" src="./assets/profile/contributions.light.svg" width="100%"/>
</picture>
</p>

<p align="center">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/profile/lifetime.dark.svg" />
  <img alt="Lifetime contribution history" src="./assets/profile/lifetime.light.svg" width="100%"/>
</picture>
</p>

<p align="center">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/profile/languages.dark.svg" />
  <img alt="Language composition" src="./assets/profile/languages.light.svg" width="100%"/>
</picture>
</p>

<p align="center">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/profile/rhythm.dark.svg" />
  <img alt="Contribution rhythm" src="./assets/profile/rhythm.light.svg" width="100%"/>
</picture>
</p>

<p align="center">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/profile/composition.dark.svg" />
  <img alt="Contribution composition" src="./assets/profile/composition.light.svg" width="100%"/>
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
