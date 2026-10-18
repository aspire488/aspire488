import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

const PROFILE = {
  login: 'aspire488',
  name: 'Joel Jigo',
  bio: null,
  public_repos: 56,
  followers: 4,
  following: 9,
  created_at: '2025-11-20T00:00:00Z',
  avatar_url: 'https://example.test/a.png',
  html_url: 'https://github.com/aspire488',
}

const REPO = {
  id: 1,
  name: 'campus-bus',
  full_name: 'aspire488/campus-bus',
  description: 'seat reservation',
  language: 'Java',
  stargazers_count: 1,
  forks_count: 0,
  pushed_at: '2026-10-18T08:00:00Z',
  created_at: '2026-10-11T00:00:00Z',
  homepage: null,
  html_url: 'https://github.com/aspire488/campus-bus',
  archived: false,
  fork: false,
  default_branch: 'main',
  topics: [],
  license: null,
}

const SNAPSHOT = {
  generatedAt: '2026-10-18T06:00:00.000Z',
  profile: PROFILE,
  repos: [REPO],
  languages: { 'aspire488/campus-bus': { Java: 9000 } },
  events: [],
  prs: [],
}

function ok(data: unknown) {
  return { ok: true, status: 200, statusText: 'OK', json: async () => data }
}

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string) => {
      const url = String(input)
      if (url.includes('snapshot.json')) return ok(SNAPSHOT)
      if (url.includes('/events')) return ok([])
      if (url.includes('/repos')) return ok([REPO])
      return ok(PROFILE)
    }),
  )
  window.history.replaceState(null, '', '/')
})

afterEach(() => {
  vi.unstubAllGlobals()
  window.localStorage.clear()
  document.documentElement.classList.remove('js-ready')
})

describe('the edition shell', () => {
  it('renders every section with live figures and no runtime errors', async () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<App />)

    // Sections and identity
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Joel/i)
    for (const id of ['front', 'work', 'sources', 'upstream', 'colophon']) {
      expect(document.getElementById(id)).not.toBeNull()
    }

    // Navigation points at real sections (plus the GitHub link in the rail foot)
    const nav = screen.getByRole('navigation', { name: 'Sections' })
    expect(nav.querySelectorAll('li a[href]')).toHaveLength(5)

    // Live data arrives and is labelled as live
    await waitFor(() => expect(screen.getByText(/Live from api\.github\.com/)).toBeInTheDocument())
    const heroFigures = document.querySelectorAll('.hero__figure')
    expect(heroFigures[0]).toHaveTextContent('1') // own repositories

    // Upstream ledger with API-verified statuses
    expect(screen.getByRole('button', { name: /^Merged/ })).toHaveTextContent('16')
    expect(document.querySelectorAll('.ledger__row').length).toBeGreaterThan(10)

    expect(errors).not.toHaveBeenCalled()
    errors.mockRestore()
  })

  it('jumps to search with “/” and opens the palette with Ctrl+K', async () => {
    const user = userEvent.setup()
    render(<App />)

    await waitFor(() => expect(document.getElementById('work')).not.toBeNull())

    await user.keyboard('/')
    await waitFor(
      () => expect(document.activeElement).toBe(document.getElementById('project-search')),
      { timeout: 2000 },
    )

    await user.keyboard('{Control>}k{/Control}')
    expect(screen.getByRole('dialog', { name: 'Command palette' })).toBeInTheDocument()

    await user.keyboard('{Escape}')
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Command palette' })).not.toBeInTheDocument(),
    )
  })

  it('opens a project record from a deep link (#/p/…) and closes back out', async () => {
    render(<App />)

    window.location.hash = '#/p/campus-bus'
    window.dispatchEvent(new HashChangeEvent('hashchange'))

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveAccessibleName(/Campus Bus/)

    window.location.hash = '#front'
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('filters the explorer from the command palette path without losing the catalogue', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.keyboard('{Control>}k{/Control}')
    const palette = screen.getByRole('dialog', { name: 'Command palette' })
    expect(palette).toBeInTheDocument()
    await user.type(within(palette).getByRole('combobox'), 'android')
    await user.keyboard('{Enter}')

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.getByText('1 of 9 projects match these filters')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeInTheDocument()
  })
})
