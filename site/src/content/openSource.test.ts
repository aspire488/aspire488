import { describe, expect, it } from 'vitest'
import {
  PULL_REQUESTS,
  prKey,
  repositoriesWithPullRequests,
  resolvePullRequests,
} from './openSource'

/** Every curated row, as the snapshot would report it (identity refresh). */
function fullMap(overrides: Record<string, { status: 'merged' | 'open' | 'closed'; date: string | null }> = {}) {
  return Object.fromEntries(
    PULL_REQUESTS.map((entry) => [
      prKey(entry.repo, entry.number),
      overrides[prKey(entry.repo, entry.number)] ?? {
        status: entry.status,
        date: entry.date || null,
      },
    ]),
  )
}

describe('resolvePullRequests', () => {
  it('uses the API-verified curated statuses when no snapshot is present', () => {
    const { entries, counts, refreshed } = resolvePullRequests(null)
    expect(entries).toHaveLength(PULL_REQUESTS.length)
    expect(counts.merged).toBeGreaterThan(0)
    expect(counts.open).toBeGreaterThan(0)
    expect(counts.closed).toBeGreaterThan(0)
    expect(counts.merged + counts.open + counts.closed).toBe(entries.length)
    expect(refreshed).toBe(false)
  })

  it('takes state from the snapshot when it covers every row', () => {
    const map = fullMap({
      [prKey('microsoft/PyRIT', 3309)]: { status: 'merged', date: '2026-10-19' },
    })
    const { entries, counts, refreshed } = resolvePullRequests(map)
    expect(refreshed).toBe(true)

    const changed = entries.find((entry) => entry.repo === 'microsoft/PyRIT' && entry.number === 3309)
    expect(changed?.status).toBe('merged')
    expect(changed?.date).toBe('2026-10-19')
    expect(counts.merged).toBeGreaterThan(16)
  })

  it('never guesses: a partial snapshot leaves uncovered rows on verified data', () => {
    const { refreshed, entries } = resolvePullRequests({
      [prKey('microsoft/PyRIT', 3309)]: { status: 'merged', date: '2026-10-19' },
    })
    expect(refreshed).toBe(false)
    expect(entries.find((entry) => entry.number === 3309)?.status).toBe('merged')
  })

  it('sorts newest first', () => {
    const { entries } = resolvePullRequests(null)
    const dates = entries.map((entry) => entry.date)
    const sorted = [...dates].sort((a, b) => (a < b ? 1 : a > b ? -1 : 0))
    expect(dates).toEqual(sorted)
  })
})

describe('repositoriesWithPullRequests', () => {
  it('deduplicates upstream repositories in first-seen order', () => {
    const repos = repositoriesWithPullRequests(resolvePullRequests(null).entries)
    expect(new Set(repos).size).toBe(repos.length)
    expect(repos).toContain('microsoft/PyRIT')
    expect(repos).toContain('cloudflare/quiche')
  })
})
