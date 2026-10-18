/** Data contracts for live GitHub data + the build-time snapshot. */

export interface GhProfile {
  login: string
  name: string | null
  bio: string | null
  public_repos: number
  followers: number
  following: number
  created_at: string
  avatar_url: string
  html_url: string
}

/** Shape of the event objects we consume from /events/public. */
export interface GhEventLike {
  id: string
  type: string
  created_at: string
  repo?: { name: string }
  payload?: {
    action?: string
    ref?: string
    ref_type?: string
    commits?: { message?: string }[]
    number?: number
    pull_request?: { number?: number; title?: string; merged?: boolean }
    issue?: { number?: number; title?: string }
    release?: { tag_name?: string; name?: string; html_url?: string }
  }
}

export interface GhRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  pushed_at: string
  created_at: string
  homepage: string | null
  html_url: string
  archived: boolean
  fork: boolean
  default_branch: string
  topics: string[]
  license: { spdx_id: string | null } | null
}

/** Normalised activity line — we never store raw payloads in the bundle. */
export interface ActivityItem {
  id: string
  kind: 'push' | 'pull_request' | 'issue' | 'release' | 'create' | 'fork' | 'star' | 'other'
  repo: string
  /** Human sentence, e.g. "pushed 3 commits to aspire488/Kio" */
  text: string
  /** Secondary detail (commit message, PR title …) when GitHub supplied one. */
  detail?: string
  url: string
  createdAt: string
}

export interface PrState {
  repo: string
  number: number
  title: string
  state: 'merged' | 'open' | 'closed'
  url: string
  /** ISO date merged or closed; null while open. */
  date: string | null
}

export interface Snapshot {
  /** When GitHub Actions last regenerated this file (ISO). */
  generatedAt: string
  profile: GhProfile | null
  /** Own (non-fork) repositories, most recently pushed first. */
  repos: GhRepo[]
  /** Per-repo language byte totals measured at snapshot time. */
  languages: Record<string, Record<string, number>>
  /**
   * Trimmed raw events (only the fields the describer reads). Normalising
   * them at runtime keeps one implementation instead of two.
   */
  events: GhEventLike[]
  prs: PrState[]
}

export type DataSource = 'live' | 'snapshot' | 'none'

export interface LoadResult {
  data: Snapshot
  source: DataSource
  /** ISO time the currently displayed data was fetched or generated. */
  asOf: string
  /** Populated when a live request failed but a fallback is on screen. */
  notice?: string
}
