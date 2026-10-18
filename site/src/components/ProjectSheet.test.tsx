import { useRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProjectSheet from './ProjectSheet'
import { PROJECTS } from '../content/projects'
import type { GithubState } from '../hooks/useGitHubData'

const github: GithubState = { result: null, loading: false }
const campusBus = PROJECTS.find((project) => project.slug === 'campus-bus')!

function Harness({
  onClose = vi.fn(),
  onNavigate = vi.fn(),
  project = campusBus,
}: {
  onClose?: () => void
  onNavigate?: (slug: string) => void
  project?: (typeof PROJECTS)[number]
}) {
  const backgroundRef = useRef<HTMLDivElement>(null)
  return (
    <>
      <div ref={backgroundRef} id="page">
        <button type="button">trigger</button>
      </div>
      <ProjectSheet
        project={project}
        github={github}
        backgroundRef={backgroundRef}
        onClose={onClose}
        onNavigate={onNavigate}
      />
    </>
  )
}

describe('project record dialog', () => {
  it('is a labelled modal dialog and takes focus', async () => {
    render(<Harness />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAccessibleName(/Campus Bus/)

    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true))
    expect(document.getElementById('page')).toHaveAttribute('inert')
  })

  it('shows genuine evidence, screenshot captions and repository links', () => {
    render(<Harness />)

    expect(screen.getByRole('heading', { name: 'Campus Bus' })).toBeInTheDocument()
    expect(screen.getByText('v1.1')).toBeInTheDocument()
    expect(screen.getByText(/released 18 Oct 2026/)).toBeInTheDocument()
    expect(screen.getByText(/green seats are free/)).toBeInTheDocument()

    const repo = screen.getByRole('link', { name: /Repository/ })
    expect(repo).toHaveAttribute('href', 'https://github.com/aspire488/campus-bus')
    expect(repo?.getAttribute('rel')).toContain('noopener')

    expect(screen.getByText(/Ships as a Windows zip/)).toBeInTheDocument()
  })

  it('closes on Escape', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<Harness onClose={onClose} />)

    screen.getByRole('dialog').focus()
    await user.keyboard('{Escape}')
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
    expect(screen.getByRole('dialog')).toHaveAttribute('data-closing')
  })

  it('closes on the close control', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<Harness onClose={onClose} />)

    await user.click(screen.getByRole('button', { name: 'Close project record' }))
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
  })

  it('does not let Tab escape into the background', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    const dialog = screen.getByRole('dialog')
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true))

    for (let i = 0; i < 60; i += 1) {
      await user.tab()
      if (document.activeElement !== document.body) {
        expect(dialog.contains(document.activeElement) || document.activeElement === document.body).toBe(true)
      }
    }
  })

  it('walks to the neighbouring records', async () => {
    const user = userEvent.setup()
    const onNavigate = vi.fn()
    render(<Harness onNavigate={onNavigate} />)

    // Campus Bus is first: no previous, next is Pipo
    expect(screen.queryByRole('button', { name: /Previous/ })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Next/ }))
    expect(onNavigate).toHaveBeenCalledWith('pipo')
  })

  it('links to the release and the live demo when they exist', () => {
    render(<Harness />)
    expect(screen.getByRole('link', { name: /Windows release v1\.1/ })).toHaveAttribute(
      'href',
      'https://github.com/aspire488/campus-bus/releases/tag/v1.1',
    )
    expect(screen.getByRole('link', { name: /All releases/ })).toBeInTheDocument()
  })
})
