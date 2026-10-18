/**
 * Upstream pull requests authored by aspire488 in repositories they do not
 * own. Every row was read from the GitHub API on 18 October 2026 — merged
 * status comes from `merged_at`, not from the issue being closed.
 *
 * `scripts/snapshot.mjs` re-checks these states on every build; when the
 * snapshot is available the UI shows the refreshed state and date instead
 * of the ones written here.
 */

export type PrStatus = 'merged' | 'open' | 'closed'

export interface PrEntry {
  repo: string
  number: number
  title: string
  status: PrStatus
  url: string
  /** ISO date the PR was merged or closed; empty while open. */
  date: string
}

/** Date the curated statuses below were verified against the API. */
export const VERIFIED_ON = '2026-10-18'

const pr = (
  repo: string,
  number: number,
  title: string,
  status: PrStatus,
  date = '',
): PrEntry => ({
  repo,
  number,
  title,
  status,
  date,
  url: `https://github.com/${repo}/pull/${number}`,
})

export const PULL_REQUESTS: PrEntry[] = [
  /* --- merged upstream ------------------------------------------------ */
  pr('UKGovernmentBEIS/inspect_ai', 5670, 'fix(google): prefer explicit API keys over ambient ADC', 'merged', '2026-10-04'),
  pr('microsoft/PyRIT', 2976, 'Preserve word-selection parameters in converter identifiers', 'merged', '2026-10-06'),
  pr('microsoft/PyRIT', 2882, 'Validation for empty targets in exact-text matching', 'merged', '2026-09-28'),
  pr('microsoft/PyRIT', 2823, 'Use the HarmBench context string where available', 'merged', '2026-09-25'),
  pr('microsoft/PyRIT', 2762, 'Add dataset summary API', 'merged', '2026-09-24'),
  pr('NousResearch/hermes-agent', 127233, 'fix(mcp): render get_prompt content blocks', 'merged', '2026-09-29'),
  pr('run-llama/llama_index', 23201, 'Preserve retrieved scores during prev/next expansion', 'merged', '2026-09-23'),
  pr('Agent-Field/agentfield', 1073, 'test(go): cover explicit harness provider factory paths', 'merged', '2026-09-26'),
  pr('eumemic/aios', 2460, 'Preserve LiteLLM parameter translation', 'merged', '2026-09-23'),
  pr('eumemic/aios', 2459, 'Preserve the timeout bound in child outcomes', 'merged', '2026-09-24'),
  pr('eumemic/aios', 2458, 'Record streaming length as truncated output', 'merged', '2026-09-24'),
  pr('eumemic/aios', 2457, 'Preserve the length finish reason across streaming trailers', 'merged', '2026-09-23'),
  pr('0xarchit/github-profile-analyzer', 30, 'Impact-score evidence', 'merged', '2026-09-23'),
  pr('kirodotdev/KiroCrew', 12861, 'Restore PDF search behind bounded extraction', 'merged', '2026-09-22'),
  pr('uutils/coreutils', 14812, 'ls: preserve canonical quoting style in dired metadata', 'merged', '2026-09-22'),
  pr('PicadoLabs/agent-bench', 8, 'Global command palette', 'merged', '2026-09-26'),

  /* --- open ----------------------------------------------------------- */
  pr('microsoft/PyRIT', 3309, 'Role-play preamble fix', 'open', '2026-10-18'),
  pr('NousResearch/hermes-agent', 134658, 'Type-only imports for session source types', 'open', '2026-10-07'),
  pr('UKGovernmentBEIS/inspect_ai', 5675, 'Preserve the error when converting a log with --stream', 'open', '2026-10-04'),
  pr('UKGovernmentBEIS/inspect_ai', 5672, 'Preserve cached input tokens across provider bridges', 'open', '2026-10-04'),
  pr('UKGovernmentBEIS/inspect_ai', 5671, 'Convert structured validation failures to parsing errors', 'open', '2026-10-04'),
  pr('NousResearch/hermes-agent', 123850, 'Keep tool-search bridge trajectories', 'open', '2026-09-26'),
  pr('NousResearch/hermes-agent', 123846, 'Accept Fire tuple args and numeric run names', 'open', '2026-09-26'),
  pr('Younesfdj/gitfut', 125, 'Active years from contributions', 'open', '2026-09-26'),
  pr('NVIDIA/garak', 2234, 'Paraphrase transformers compatibility', 'open', '2026-09-25'),
  pr('collective/icalendar', 1835, 'Start/end duration mismatch', 'open', '2026-09-25'),
  pr('KARAN-D05/TopoCore', 1, 'Detect repeated spatial execution states', 'open', '2026-09-23'),
  pr('cloudflare/quiche', 2759, 'fix(reno): ignore ACKs for non-in-flight packets', 'open', '2026-09-22'),
  pr('cloudflare/quiche', 2758, 'Verify peers when using a custom CA', 'open', '2026-09-22'),
  pr('cloudflare/quiche', 2756, 'Unify PTO-based timer duration', 'open', '2026-09-21'),
  pr('intellij-powershell/intellij-powershell', 506, 'Resolve pwsh reparse point', 'open', '2026-09-22'),
  pr('risingwavelabs/risingwave', 27181, 'Inspect correlated refs in LogicalValues', 'open', '2026-09-21'),
  pr('mvt-project/mvt', 939, 'STIX indicator equality', 'open', '2026-09-21'),
  pr('coder/coder', 29668, 'Deduplicate Unknown AI Gateway clients', 'open', '2026-09-21'),
  pr('OpenHands/OpenHands', 17579, 'Align condenser max size with agent-server minimum', 'open', '2026-09-20'),
  pr('adityamallia7/GoalAI-Score-predictor-26', 1, 'Prediction Intelligence Lab with reproducible Monte Carlo analysis', 'open', '2026-09-20'),
  pr('RajX-dev/N3MO', 39, 'Cover Ruby and Kotlin language routing', 'open', '2026-09-10'),
  pr('tysoncung/ai-platform-aws', 4, 'Provider routing specificity', 'open', '2026-09-21'),

  /* --- closed without merge ------------------------------------------- */
  pr('NousResearch/hermes-agent', 135229, 'Update lock custodian partner v2', 'closed', '2026-10-08'),
  pr('microsoft/PyRIT', 2919, 'Inverted score metadata', 'closed', '2026-09-30'),
  pr('microsoft/PyRIT', 2885, 'Prompt-shield parser (closed as duplicate)', 'closed', '2026-09-27'),
  pr('pydantic/pydantic-ai', 8823, 'Avoid redundant RunContext copy when validation context is unset', 'closed', '2026-09-26'),
  pr('run-llama/llama_index', 23260, 'Preserve retrieved scores during prev/next expansion', 'closed', '2026-09-26'),
  pr('microsoft/PyRIT', 2743, 'Garak exploitation scenario', 'closed', '2026-09-22'),
  pr('open-telemetry/opentelemetry-erlang-contrib', 822, 'Isolate spans across retries and redirects', 'closed', '2026-09-21'),
  pr('akitaonrails/ai-memory', 828, 'Expand agent-memory comparison coverage', 'closed', '2026-09-21'),
  pr('github-linguist/linguist', 8220, 'Add support for Salam', 'closed', '2026-09-21'),
  pr('daniel5151/clicky', 72, 'Revamp contributor quickstart', 'closed', '2026-09-20'),
  pr('NousResearch/hermes-agent', 121771, 'Recover when gateway ref is stale', 'closed', '2026-09-24'),
]

/** Merge states from the freshest snapshot, keyed "repo#number". */
export type PrStatusMap = Record<string, { status: PrStatus; date: string | null }>

export function prKey(repo: string, number: number): string {
  return `${repo}#${number}`
}

/**
 * Effective view of each PR: snapshot state when we have one (it was
 * re-checked by GitHub Actions), the curated API-verified state otherwise.
 * Never guesses.
 */
export function resolvePullRequests(fresh: PrStatusMap | null): {
  entries: PrEntry[]
  counts: Record<PrStatus, number>
  /** True when every row's status came from the refreshed snapshot. */
  refreshed: boolean
} {
  let refreshed = true
  const entries = PULL_REQUESTS.map((entry) => {
    const hit = fresh?.[prKey(entry.repo, entry.number)]
    if (!hit) {
      refreshed = false
      return entry
    }
    return { ...entry, status: hit.status, date: hit.date ?? entry.date }
  }).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.number - a.number))

  const counts: Record<PrStatus, number> = { merged: 0, open: 0, closed: 0 }
  for (const entry of entries) counts[entry.status] += 1

  return { entries, counts, refreshed: entries.length > 0 && refreshed }
}

/** Distinct upstream repositories touched, most recent PR first. */
export function repositoriesWithPullRequests(entries: PrEntry[]): string[] {
  const seen = new Map<string, string>()
  for (const entry of entries) {
    if (!seen.has(entry.repo)) seen.set(entry.repo, entry.date)
  }
  return [...seen.keys()]
}
