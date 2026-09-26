# Joel Jigo — `aspire488`

**CSE student · systems engineering · AI tooling · open-source contributor**

I build deterministic software around AI systems: execution kernels, developer tooling, automation, memory systems, and security/red-teaming infrastructure.

> **Engineering principle:** AI can help reason and accelerate implementation; the resulting software still has to be understandable, testable, reviewable, and defensible.

## Open-source engineering

Open source is a **core engineering track**, not a side metric. I contribute across unfamiliar codebases, but I care about the actual change, maintainer feedback, regression coverage, and whether I can explain the work.

### Verified upstream merges

- **Microsoft PyRIT #2762 — Dataset Summary API** — merged September 24, 2026 after multiple maintainer review rounds.  
  https://github.com/microsoft/PyRIT/pull/2762
- **Microsoft PyRIT #2823 — HarmBench context preservation** — merged September 25, 2026 with regression coverage.  
  https://github.com/microsoft/PyRIT/pull/2823
- **eumemic/aios #2457** — streaming `finish_reason="length"` preservation.  
  https://github.com/eumemic/aios/pull/2457
- **eumemic/aios #2458** — record streaming length as truncated output.  
  https://github.com/eumemic/aios/pull/2458
- **eumemic/aios #2459** — preserve timeout-bound semantics in child outcomes.  
  https://github.com/eumemic/aios/pull/2459
- **eumemic/aios #2460** — preserve LiteLLM parameter translation.  
  https://github.com/eumemic/aios/pull/2460
- **github-profile-analyzer #30** — evidence-weighted impact scoring.  
  https://github.com/0xarchit/github-profile-analyzer/pull/30
- **PicadoLabs/agent-bench #8** — global command palette, merged September 26, 2026.  
  https://github.com/PicadoLabs/agent-bench/pull/8

**Current external OSS ledger:** 8 merged upstream · 19 open upstream · 7 fork-side · 6 closed without merge.  
**Total tracked external OSS PRs: 40.**

Full evidence ledger: https://github.com/aspire488/oss-atlas

## Current upstream work

- **GitFut #125** — derive active years from annual GitHub contribution history instead of owned-repository timestamps; regression coverage included.  
  https://github.com/Younesfdj/gitfut/pull/125
- **AgentField #1073** — explicit Claude Code/OpenCode provider factory tests.  
  https://github.com/Agent-Field/agentfield/pull/1073
- **Hermes Agent #121771** — stale desktop gateway reference recovery.  
  https://github.com/NousResearch/hermes-agent/pull/121771
- **collective/icalendar #1835** — `DTEND` + `DURATION` handling.  
  https://github.com/collective/icalendar/pull/1835
- **NVIDIA garak #2234** — Transformers paraphrase compatibility.  
  https://github.com/NVIDIA/garak/pull/2234

More work is tracked in OSS Atlas with explicit upstream/fork provenance.

## Engineering projects

### ⚙️ gh-ops
Deterministic GitHub operations and OSS intelligence platform: repository/CI/release/security monitoring, developer activity, scheduled workflows, state, reporting, and Telegram delivery.

https://github.com/aspire488/gh-ops

### 🤖 KIO
**Kernel for Intelligent Orchestration** — execution-focused runtime for capability resolution, provider dispatch, security gates, tool execution, browser/MCP integration, state, recovery, and verification.

**Current state:** active restoration/integration. It is not presented as a completed architecture milestone.

https://github.com/aspire488/Kio

### 🛠️ UEA
**Universal Engineering Augmentation** — agent-neutral engineering infrastructure for code intelligence, dependency/impact analysis, verification, testing, provenance, routing, and reusable capabilities.

https://github.com/aspire488/Universal-Engineering-Augmentation

### 🧠 AURA
Memory and cognition backend for persistent agent state, retrieval, cognitive artifacts, and reflection-oriented processing.

**Current state:** architecture checkpoint; no active feature-development line.

https://github.com/aspire488/AURA

### 💊 MediMind Care
Hardened healthcare-workflow prototype with deterministic reminders, bounded AI assistance, accessibility, synthetic data, CI, browser regression coverage, and explicit non-clinical boundaries.

https://github.com/aspire488/medimind

### ⚡ CodeFlow
Execution-first programming-learning prototype with visible execution state and bounded AI assistance.

https://github.com/aspire488/codeflow

## How I work

- Prefer a **small, defensible change** over activity for activity's sake.
- Read the surrounding code before changing it.
- Add regression coverage when behavior changes.
- Treat maintainer review as part of the engineering process.
- Use AI tools openly as accelerators, while retaining responsibility for understanding and verifying the resulting code.
- Keep upstream acceptance, fork-side work, and experiments clearly separated.

**Building in public. Shipping real systems. Contributing upstream.**
