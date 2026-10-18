import { useRef, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Work from './Work'
import { PROJECTS, type ProjectQuery } from '../content/projects'
import type { GithubState } from '../hooks/useGitHubData'
import type { ExplorerView } from './Work'

const idleGithub: GithubState = { result: null, loading: false }

function Harness({ onOpenProject = vi.fn() }: { onOpenProject?: (slug: string) => void }) {
  const [query, setQuery] = useState<ProjectQuery>({ text: '', category: null, stack: null })
  const [view, setView] = useState<ExplorerView>('plates')
  const searchRef = useRef<HTMLInputElement>(null)

  return (
    <Work
      github={idleGithub}
      query={query}
      onQueryChange={setQuery}
      view={view}
      onViewChange={setView}
      searchRef={searchRef}
      onOpenProject={onOpenProject}
      onClearFilters={() => setQuery({ text: '', category: null, stack: null })}
    />
  )
}

describe('project explorer', () => {
  it('lists every curated project with a live result count', () => {
    render(<Harness />)
    expect(screen.getByText(`9 of 9 projects`)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Campus Bus/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /MediMind/ })).toBeInTheDocument()
  })

  it('filters by search text and announces the new count', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.type(screen.getByLabelText('Search'), 'seat map')

    expect(screen.getByText('1 of 9 projects match these filters')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Campus Bus/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Pipo/ })).not.toBeInTheDocument()
  })

  it('filters by category chips and clears them again', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    const android = screen.getByRole('button', { name: 'Android' })
    await user.click(android)
    expect(android).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('1 of 9 projects match these filters')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Pipo/ })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(screen.getByText('9 of 9 projects')).toBeInTheDocument()
    expect(android).toHaveAttribute('aria-pressed', 'false')
  })

  it('filters by technology from the select', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.selectOptions(screen.getByLabelText('Technology'), 'Python')
    expect(screen.getByText('5 of 9 projects match these filters')).toBeInTheDocument()
  })

  it('shows an honest empty state and recovers with clear filters', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.type(screen.getByLabelText('Search'), 'zzzz-no-such-project')
    expect(screen.getByRole('status')).toHaveTextContent('No project matches that.')

    await user.click(screen.getByRole('button', { name: 'Clear all filters' }))
    expect(screen.getByText('9 of 9 projects')).toBeInTheDocument()
    expect(screen.getByLabelText('Search')).toHaveValue('')
  })

  it('switches between the plates and index layouts', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    const indexButton = screen.getByRole('button', { name: 'Index' })
    expect(indexButton).toHaveAttribute('aria-pressed', 'false')
    await user.click(indexButton)
    expect(indexButton).toHaveAttribute('aria-pressed', 'true')

    const rows = screen.getAllByRole('button', { name: /Universal Engineering Augmentation/ })
    expect(rows.length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Plates' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('opens a project record instead of navigating away', async () => {
    const user = userEvent.setup()
    const onOpenProject = vi.fn()
    render(<Harness onOpenProject={onOpenProject} />)

    await user.click(screen.getByRole('button', { name: /Campus Bus/ }))
    expect(onOpenProject).toHaveBeenCalledWith('campus-bus')

    const external = screen.getAllByRole('link', { name: /Windows release v1\.1/ })[0]
    expect(external).toHaveAttribute('href', 'https://github.com/aspire488/campus-bus/releases/tag/v1.1')
    expect(external?.getAttribute('rel')).toContain('noopener')
  })

  it('keeps keyboard focus parity in the index view (preview follows focus)', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole('button', { name: 'Index' }))
    const row = screen.getByRole('button', { name: /KIO/ })
    await user.tab()
    // focus lands on the search field first; move through controls to the row
    let guard = 0
    while (document.activeElement !== row && guard < 40) {
      await user.tab()
      guard += 1
    }
    expect(document.activeElement).toBe(row)

    const preview = document.querySelector('.preview')
    expect(preview).not.toBeNull()
  })

  it('exercises the full catalogue through the index view', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Index' }))
    const rows = document.querySelectorAll('.rows .row')
    expect(rows).toHaveLength(PROJECTS.length)
  })

  it('groups filters with aria-pressed state on a live region count', () => {
    render(<Harness />)
    const count = document.getElementById('explorer-count')
    expect(count).toHaveAttribute('aria-live', 'polite')
    const group = screen.getByRole('group', { name: 'Filter by category' })
    expect(within(group).getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true')
  })
})
