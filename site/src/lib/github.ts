import type {
  ActivityItem,
  GhEventLike,
  GhProfile,
  GhRepo,
  LoadResult,
  Snapshot,
} from './types'

export const USERNAME = 'aspire488'
const API = 'https://api.github.com'
const LIVE_TIMEOUT_MS = 8000

/* ------------------------------------------------------------------ *
 * Event normalisation
 * ------------------------------------------------------------------ */

/**
 * Turn a raw GitHub event into a sentence a person can read.
 * Returns null for event types we deliberately do not surface.
 */
export function describeEvent(event: GhEventLike): ActivityItem | null {
  const repo = event.repo?.name ?? `${USERNAME}/…`
  const url = `https://github.com/${repo}`
  const base = { id: event.id, repo, url, createdAt: event.created_at }

  switch (event.type) {
    case 'PushEvent': {
      const commits = event.payload?.commits ?? []
      const count = commits.length
      if (count === 0) return null
      const detail = commits[0]?.message?.split('\n')[0]
      return {
        ...base,
        kind: 'push',
        text: `pushed ${count} ${count === 1 ? 'commit' : 'commits'} to ${repo}`,
        detail,
        url: `${url}/commits`,
      }
    }
    case 'PullRequestEvent': {
      const pr = event.payload?.pull_request
      const action = event.payload?.action ?? 'updated'
      const num = pr?.number ?? event.payload?.number
      if (!num) return null
      const merged = pr?.merged === true
      const verb =
        merged ? 'merged pull request' : action === 'closed' ? 'closed pull request' : 'opened pull request'
      return {
        ...base,
        kind: 'pull_request',
        text: `${verb} #${num} in ${repo}`,
        detail: pr?.title,
        url: `${url}/pull/${num}`,
      }
    }
    case 'IssuesEvent': {
      const issue = event.payload?.issue
      const num = issue?.number
      if (!num) return null
      const action = event.payload?.action ?? 'updated'
      return {
        ...base,
        kind: 'issue',
        text: `${action} issue #${num} in ${repo}`,
        detail: issue?.title,
        url: `${url}/issues/${num}`,
      }
    }
    case 'ReleaseEvent': {
      const rel = event.payload?.release
      if (!rel) return null
      const verb = event.payload?.action === 'published' ? 'published' : 'updated'
      return {
        ...base,
        kind: 'release',
        text: `${verb} release ${rel.tag_name} of ${repo}`,
        detail: rel.name,
        url: rel.html_url ?? `${url}/releases`,
      }
    }
    case 'CreateEvent': {
      const ref = event.payload?.ref
      const refType = event.payload?.ref_type ?? 'repository'
      if (refType === 'repository') return null
      return {
        ...base,
        kind: 'create',
        text: `created ${refType}${ref ? ` ${ref}` : ''} in ${repo}`,
        url: `${url}/tree`,
      }
    }
    case 'ForkEvent':
      return { ...base, kind: 'fork', text: `forked ${repo}`, url }
    case 'WatchEvent':
      return event.payload?.action === 'started'
        ? { ...base, kind: 'star', text: `starred ${repo}`, url }
        : null
    default:
      return null
  }
}

/* ------------------------------------------------------------------ *
 * Live fetch
 * ------------------------------------------------------------------ */

async function ghGet<T>(path: string, signal: AbortSignal): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    signal,
    headers: { Accept: 'application/vnd.github+json' },
  })
  if (!res.ok) {
    throw new Error(`GitHub responded ${res.status} for ${path}`)
  }
  return (await res.json()) as T
}

/**
 * Fetch profile, repositories and public events (raw, trimmed by the caller).
 * Throws so the caller can fall back to the snapshot — this never
 * fabricates data when a request fails.
 */
export async function fetchLive(): Promise<Pick<Snapshot, 'profile' | 'repos' | 'events'>> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), LIVE_TIMEOUT_MS)
  try {
    const [profile, repos, events] = await Promise.all([
      ghGet<GhProfile>(`/users/${USERNAME}`, controller.signal),
      ghGet<GhRepo[]>(`/users/${USERNAME}/repos?per_page=100&sort=updated`, controller.signal),
      ghGet<GhEventLike[]>(`/users/${USERNAME}/events/public?per_page=30`, controller.signal),
    ])
    const own = repos.filter((repo) => !repo.fork)
    return { profile, repos: own, events: events.map(trimEvent).filter((e): e is GhEventLike => e !== null) }
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Keep only the fields `describeEvent` reads — the raw payloads carry
 * avatars, shas and patch text we never want in memory or on disk.
 */
export function trimEvent(event: GhEventLike): GhEventLike | null {
  if (!event?.id || !event?.type) return null
  const payload = event.payload ?? {}
  return {
    id: event.id,
    type: event.type,
    created_at: event.created_at,
    repo: event.repo ? { name: event.repo.name } : undefined,
    payload: {
      action: payload.action,
      ref: payload.ref,
      ref_type: payload.ref_type,
      number: payload.number,
      commits: payload.commits?.map((commit) => ({ message: commit.message })),
      pull_request: payload.pull_request
        ? {
            number: payload.pull_request.number,
            title: payload.pull_request.title,
            merged: payload.pull_request.merged,
          }
        : undefined,
      issue: payload.issue ? { number: payload.issue.number, title: payload.issue.title } : undefined,
      release: payload.release
        ? {
            tag_name: payload.release.tag_name,
            name: payload.release.name,
            html_url: payload.release.html_url,
          }
        : undefined,
    },
  }
}

/** Normalised reading lines for the activity feed. */
export function activityFrom(data: Pick<Snapshot, 'events'>): ActivityItem[] {
  return (data.events ?? [])
    .map(describeEvent)
    .filter((item): item is ActivityItem => item !== null)
}

/* ------------------------------------------------------------------ *
 * Snapshot (bundled at build time by GitHub Actions)
 * ------------------------------------------------------------------ */

export function snapshotUrl(): string {
  const base = import.meta.env.BASE_URL
  return `${base}data/snapshot.json`
}

export async function loadSnapshot(url: string = snapshotUrl()): Promise<Snapshot | null> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 6000)
    const res = await fetch(url, { signal: controller.signal, cache: 'no-cache' })
    clearTimeout(timer)
    if (!res.ok) return null
    const parsed = (await res.json()) as Snapshot
    if (!parsed || typeof parsed.generatedAt !== 'string' || !Array.isArray(parsed.repos)) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export const EMPTY_SNAPSHOT: Snapshot = {
  generatedAt: '',
  profile: null,
  repos: [],
  languages: {},
  events: [],
  prs: [],
}

/**
 * Load order: snapshot first (instant, offline-safe), then try live.
 * The result always says where the data came from.
 */
export async function loadGitHubData(): Promise<LoadResult> {
  const snapshot = await loadSnapshot()

  if (!snapshot) {
    // No snapshot either — try live directly so something still shows.
    try {
      const live = await fetchLive()
      return { data: { ...EMPTY_SNAPSHOT, ...live }, source: 'live', asOf: new Date().toISOString() }
    } catch (error) {
      return {
        data: EMPTY_SNAPSHOT,
        source: 'none',
        asOf: '',
        notice: errorText(error),
      }
    }
  }

  try {
    const live = await fetchLive()
    return {
      data: { ...snapshot, ...live },
      source: 'live',
      asOf: new Date().toISOString(),
    }
  } catch (error) {
    return {
      data: snapshot,
      source: 'snapshot',
      asOf: snapshot.generatedAt,
      notice: errorText(error),
    }
  }
}

function errorText(error: unknown): string {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return 'The GitHub API did not answer in time.'
  }
  if (error instanceof Error && /403|rate limit/i.test(error.message)) {
    return 'GitHub rate-limited this page’s unauthenticated requests.'
  }
  if (error instanceof Error && error.message) return error.message
  return 'The GitHub API is unreachable right now.'
}

/* ------------------------------------------------------------------ *
 * Small helpers used across the UI
 * ------------------------------------------------------------------ */

export function relativeTime(iso: string, now: Date = new Date()): string {
  if (!iso) return '—'
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return '—'
  const seconds = Math.round((now.getTime() - then) / 1000)
  const units: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, 'second'],
    [3600, 'minute'],
    [86400, 'hour'],
    [604800, 'day'],
    [2629800, 'week'],
    [31557600, 'month'],
    [Infinity, 'year'],
  ]
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  let previous = 1
  for (const [limit, unit] of units) {
    if (seconds < limit) {
      const value = Math.round(seconds / previous)
      return formatter.format(-value, unit)
    }
    previous = limit
  }
  return '—'
}

export function formatDate(iso: string): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function languageShare(
  repos: GhRepo[],
): { name: string; count: number; bytes: number }[] {
  const tally = new Map<string, { name: string; count: number; bytes: number }>()
  for (const repo of repos) {
    const key = repo.language ?? 'Other'
    const entry = tally.get(key) ?? { name: key, count: 0, bytes: 0 }
    entry.count += 1
    tally.set(key, entry)
  }
  return [...tally.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}
