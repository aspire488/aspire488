import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  EMPTY_SNAPSHOT,
  activityFrom,
  describeEvent,
  formatDate,
  languageShare,
  loadGitHubData,
  relativeTime,
  trimEvent,
} from './github'
import type { GhEventLike, GhProfile, GhRepo, Snapshot } from './types'

const PROFILE: GhProfile = {
  login: 'aspire488',
  name: 'Joel Jigo',
  bio: null,
  public_repos: 56,
  followers: 4,
  following: 9,
  created_at: '2025-11-20T00:00:00Z',
  avatar_url: 'https://example.test/avatar.png',
  html_url: 'https://github.com/aspire488',
}

const REPO: GhRepo = {
  id: 1,
  name: 'Kio',
  full_name: 'aspire488/Kio',
  description: 'companion runtime',
  language: 'Python',
  stargazers_count: 2,
  forks_count: 0,
  pushed_at: '2026-10-17T00:00:00Z',
  created_at: '2025-11-30T00:00:00Z',
  homepage: null,
  html_url: 'https://github.com/aspire488/Kio',
  archived: false,
  fork: false,
  default_branch: 'main',
  topics: [],
  license: null,
}

function snapshotFixture(): Snapshot {
  return {
    ...EMPTY_SNAPSHOT,
    generatedAt: '2026-10-18T09:00:00.000Z',
    repos: [REPO],
    languages: { 'aspire488/Kio': { Python: 4000, JavaScript: 1000 } },
    events: [],
    prs: [],
  }
}

function jsonResponse(data: unknown, ok = true, status = 200) {
  return { ok, status, statusText: ok ? 'OK' : 'Error', json: async () => data }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('describeEvent', () => {
  it('turns a push into a readable sentence with the first commit message', () => {
    const event: GhEventLike = {
      id: '1',
      type: 'PushEvent',
      created_at: '2026-10-18T10:00:00Z',
      repo: { name: 'aspire488/Kio' },
      payload: { commits: [{ message: 'fix(memory): trim old entries\n\nbody' }, { message: 'b' }] },
    }
    const item = describeEvent(event)
    expect(item).toMatchObject({
      kind: 'push',
      repo: 'aspire488/Kio',
      text: 'pushed 2 commits to aspire488/Kio',
      detail: 'fix(memory): trim old entries',
      url: 'https://github.com/aspire488/Kio/commits',
    })
  })

  it('distinguishes a merged pull request from a closed one', () => {
    const base = {
      id: '2',
      type: 'PullRequestEvent',
      created_at: '2026-10-18T10:00:00Z',
      repo: { name: 'microsoft/PyRIT' },
      payload: { action: 'closed', number: 2976, pull_request: { number: 2976, title: 't' } },
    }
    expect(describeEvent({ ...base, payload: { ...base.payload, pull_request: { ...base.payload.pull_request, merged: true } } })?.text).toBe(
      'merged pull request #2976 in microsoft/PyRIT',
    )
    expect(describeEvent(base)?.text).toBe('closed pull request #2976 in microsoft/PyRIT')
  })

  it('drops events we do not surface', () => {
    expect(
      describeEvent({ id: '3', type: 'WatchEvent', created_at: '', payload: { action: 'started' } })?.kind,
    ).toBe('star')
    expect(describeEvent({ id: '4', type: 'WatchEvent', created_at: '', payload: {} })).toBeNull()
    expect(
      describeEvent({ id: '5', type: 'CreateEvent', created_at: '', payload: { ref_type: 'repository' } }),
    ).toBeNull()
    expect(describeEvent({ id: '6', type: 'GollumEvent', created_at: '' })).toBeNull()
  })
})

describe('trimEvent', () => {
  it('keeps only the fields the describer reads', () => {
    const trimmed = trimEvent({
      id: '9',
      type: 'PushEvent',
      created_at: 'now',
      repo: { name: 'aspire488/Pipo' },
      payload: { commits: [{ message: 'm', sha: 'abcdef' }] },
    } as unknown as GhEventLike)
    expect(trimmed).toEqual({
      id: '9',
      type: 'PushEvent',
      created_at: 'now',
      repo: { name: 'aspire488/Pipo' },
      payload: { commits: [{ message: 'm' }] },
    })
  })
})

describe('activityFrom', () => {
  it('normalises stored events and drops unhandled types', () => {
    const items = activityFrom({
      events: [
        { id: '1', type: 'PushEvent', created_at: 'x', repo: { name: 'a/b' }, payload: { commits: [{ message: 'm' }] } },
        { id: '2', type: 'GollumEvent', created_at: 'x' },
      ],
    })
    expect(items).toHaveLength(1)
    expect(items[0].text).toContain('pushed 1 commit')
  })
})

describe('loadGitHubData fallback order', () => {
  it('reports live data when the API answers', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string) => {
        const url = String(input)
        if (url.includes('snapshot.json')) return jsonResponse(snapshotFixture())
        if (url.includes('/events')) return jsonResponse([])
        if (url.includes('/repos')) return jsonResponse([REPO])
        return jsonResponse(PROFILE)
      }),
    )

    const result = await loadGitHubData()
    expect(result.source).toBe('live')
    expect(result.data.profile?.login).toBe('aspire488')
    expect(result.notice).toBeUndefined()
  })

  it('falls back to the build snapshot with a notice when the live request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string) => {
        const url = String(input)
        if (url.includes('snapshot.json')) return jsonResponse(snapshotFixture())
        throw new Error('network down')
      }),
    )

    const result = await loadGitHubData()
    expect(result.source).toBe('snapshot')
    expect(result.data.repos).toHaveLength(1)
    expect(result.asOf).toBe('2026-10-18T09:00:00.000Z')
    expect(result.notice).toContain('network down')
  })

  it('never invents data when both the snapshot and the API are unavailable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('offline')
      }),
    )

    const result = await loadGitHubData()
    expect(result.source).toBe('none')
    expect(result.data.repos).toHaveLength(0)
    expect(result.data.profile).toBeNull()
    expect(result.notice).toMatch(/offline/)
  })
})

describe('formatting helpers', () => {
  it('formats relative and absolute dates stably', () => {
    expect(relativeTime('2026-10-16T00:00:00Z', new Date('2026-10-18T00:00:00Z'))).toBe('2 days ago')
    expect(formatDate('2026-10-18')).toBe('18 Oct 2026')
    expect(formatDate('')).toBe('—')
    expect(relativeTime('not-a-date')).toBe('—')
  })

  it('tallies primary languages across own repositories', () => {
    const share = languageShare([
      REPO,
      { ...REPO, id: 2, name: 'uea', full_name: 'aspire488/uea' },
      { ...REPO, id: 3, name: 'pipo', full_name: 'aspire488/pipo', language: 'Kotlin' },
    ])
    expect(share[0]).toMatchObject({ name: 'Python', count: 2 })
    expect(share[1]).toMatchObject({ name: 'Kotlin', count: 1 })
  })
})
