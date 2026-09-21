# Joel Jigo

**CSE student · systems-focused builder · software engineering / AI infrastructure**

I build software systems around a simple principle: **use deterministic software for work that can be verified, and AI where reasoning or ambiguity actually matters.**

My public work spans developer infrastructure, execution-based education, AI-assisted applications, and open-source engineering.

---

## Engineering Portfolio

### 🛠️ [Universal Engineering Augmentation](https://github.com/aspire488/Universal-Engineering-Augmentation)
**Public alpha · Python · developer infrastructure**

A tool-agnostic engineering layer that gives coding agents deterministic capabilities instead of making an LLM re-derive everything.

**Engineering evidence**
- Python package with canonical installation
- CI across Python 3.10–3.12
- 52+ automated tests + 16 verification checks
- Tree-sitter structural analysis, Z3 verification, Hypothesis property testing
- candidate isolation, provenance, specialist routing, event logging
- reproducible deterministic benchmark harness
- Dependabot + tagged release automation
- Claude Code, Codex, and generic CLI integration surfaces

**Current:** broader language support, release hardening, and external open-source collaboration.

### ⚡ [CodeFlow](https://github.com/aspire488/codeflow)
**Prototype · JavaScript / Vite · execution-based learning**

An execution-first programming-learning environment focused on making control flow, state, and output visible instead of treating code as static text.

**Engineering evidence**
- deterministic Node test suite
- production-build CI
- explicit architecture documentation
- live deployment: https://codeflow-app-sigma.vercel.app
- tagged release workflow
- AST-backed execution model tracked as the next major milestone

### 💊 [MediMind](https://github.com/aspire488/medimind)
**Prototype · React / Vite · safety-conscious AI-assisted UX**

A medication-reminder and health-workflow prototype exploring role-based UX, accessibility, deterministic workflow state, and bounded AI assistance.

**Engineering evidence**
- synthetic-data boundary
- explicit non-clinical safety contract
- production-build CI
- Playwright browser regression smoke coverage
- live deployment: https://medimind-seven.vercel.app

---

## Open-source engineering

I use open source as an external engineering track: working in unfamiliar codebases, following repository-specific contribution rules, making focused changes, and learning through real maintainer review.

### Current upstream work

- [AI Platform AWS #4 — Provider routing specificity](https://github.com/tysoncung/ai-platform-aws/pull/4) — **open upstream PR**
  - Fixes provider-resolution precedence so explicit direct Anthropic routing is not shadowed by generic Bedrock Claude matching, with regression coverage.

- [OpenHands #17579 — Condenser settings validation](https://github.com/OpenHands/OpenHands/pull/17579) — **open upstream PR**
  - Prevents negative Condenser Max Number of Events values with UI/save-time validation and regression coverage.

- [AgentBench #8 — Global command palette](https://github.com/PicadoLabs/agent-bench/pull/8) — **open upstream PR**
  - Adds global command navigation, fuzzy search, keyboard interaction, accessibility semantics, and architecture documentation.

- [GoalAI #1 — Prediction Intelligence Lab](https://github.com/adityamallia7/GoalAI-Score-predictor-26/pull/1) — **open upstream PR**
  - Adds reproducible Monte Carlo analysis, model validation, deterministic checks, CI, and documentation.

- [N3MO #39 — Language routing and parser regression coverage](https://github.com/RajX-dev/N3MO/pull/39) — **open upstream PR**

- [Clicky #72 — Contributor quickstart revamp](https://github.com/daniel5151/clicky/pull/72) — **open upstream PR**
  - Reworks the contributor workflow with setup, boot/debug paths, safe disk-image guidance, troubleshooting, and development handoff.

- [Linguist #7712 — .example suffix detection](https://github.com/github-linguist/linguist/issues/7712) — **upstream contribution**
  - Improves language detection for example/configuration template filenames such as README.md.example and .env.example.

> **Selected, not exhaustive.** The goal is to show representative engineering work rather than inflate activity with low-signal changes.

**[View all my GitHub pull requests](https://github.com/pulls?q=is%3Apr%20author%3Aaspire488)**

---

## Engineering direction

| Area | Focus |
|---|---|
| Developer infrastructure | deterministic analysis, verification, agent augmentation |
| AI systems | explicit boundaries, routing, memory, execution |
| Software engineering | testing, CI/CD, release discipline, observability |
| Education | executable models and visible program behavior |
| Product engineering | prototypes → measurable → hardened systems |
| Open source | focused contributions, maintainer feedback, long-term collaboration |

### Principles

- **Measure before claiming.**
- **Verification is part of generation.**
- **Deterministic systems should own deterministic work.**
- **AI should be bounded by explicit interfaces and evidence.**
- **A prototype is not production software until the engineering contract says what is tested and what is not.**
- **Public work should be reproducible, inspectable, and honest about limitations.**

---

## Current roadmap

1. Complete the UEA adapter/CLI release path.
2. Finish the AST-backed execution model in CodeFlow.
3. Expand browser regression coverage in MediMind.
4. Continue meaningful external open-source contributions.
5. Turn the strongest systems into documented, versioned releases with reproducible benchmarks.

---

## Activity

The cards below are generated from GitHub data by GitHub Actions and stored locally in this repository.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/profile/overview.dark.svg" />
  <img alt="GitHub overview" src="./assets/profile/overview.light.svg" width="100%" />
</picture>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/profile/contributions.dark.svg" />
  <img alt="Contribution history" src="./assets/profile/contributions.light.svg" width="100%" />
</picture>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/profile/languages.dark.svg" />
  <img alt="Language composition" src="./assets/profile/languages.light.svg" width="100%" />
</picture>

---

## Contributing

This profile repository is primarily for portfolio content, generated activity artifacts, and supporting documentation.

If you spot an inaccurate claim, broken link, stale metric, or documentation issue, please open an issue or pull request. See [CONTRIBUTING.md](CONTRIBUTING.md) for the contribution workflow.

---

## About

I am currently focused on becoming a stronger systems/software engineer by building, testing, releasing, and contributing — not just collecting technologies.

**Primary stack:** Python · JavaScript · React · Vite · GitHub Actions · SQLite · DuckDB · Z3 · Tree-sitter · Hypothesis · MCP

**Public profile:** https://github.com/aspire488
