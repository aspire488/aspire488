import { useRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CommandPalette, { type PaletteAction } from './CommandPalette'

function buildActions(runs: Record<string, () => void>): PaletteAction[] {
  return [
    { id: 'go-work', group: 'Sections', label: 'Go to Work', run: runs.sections ?? vi.fn() },
    { id: 'project-pipo', group: 'Projects', label: 'Pipo', hint: 'A robot who lives in your phone', run: runs.project ?? vi.fn() },
    { id: 'theme', group: 'Display', label: 'Switch to ink (dark) theme', run: runs.theme ?? vi.fn() },
  ]
}

function Harness({
  open = true,
  onClose = vi.fn(),
  actions,
}: {
  open?: boolean
  onClose?: () => void
  actions?: PaletteAction[]
}) {
  const backgroundRef = useRef<HTMLDivElement>(null)
  const runs: Record<string, () => void> = {}
  return (
    <>
      <div ref={backgroundRef} id="page">
        <button type="button">behind the dialog</button>
      </div>
      <CommandPalette
        open={open}
        actions={actions ?? buildActions(runs)}
        backgroundRef={backgroundRef}
        onClose={onClose}
      />
    </>
  )
}

describe('command palette', () => {
  it('renders a modal combobox wired to a listbox', () => {
    render(<Harness />)
    const dialog = screen.getByRole('dialog', { name: 'Command palette' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')

    const input = screen.getByRole('combobox')
    expect(input).toHaveAttribute('aria-expanded', 'true')
    const listboxId = input.getAttribute('aria-controls')
    expect(listboxId).toBeTruthy()
    expect(document.getElementById(listboxId!)).toHaveAttribute('role', 'listbox')

    expect(screen.getAllByRole('option').length).toBeGreaterThan(1)
    expect(screen.getByRole('status')).toHaveTextContent('3 results')
  })

  it('moves the active option with the arrow keys via aria-activedescendant', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const input = screen.getByRole('combobox')

    input.focus()
    expect(input).toHaveAttribute('aria-activedescendant', expect.stringContaining('-opt-0'))

    await user.keyboard('{ArrowDown}')
    const activeId = input.getAttribute('aria-activedescendant')
    expect(activeId).toMatch(/-opt-1$/)
    expect(document.getElementById(activeId!)).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('option', { name: /Go to Work/ })).toHaveAttribute('aria-selected', 'false')

    await user.keyboard('{ArrowUp}')
    expect(input.getAttribute('aria-activedescendant')).toMatch(/-opt-0$/)

    await user.keyboard('{End}')
    expect(input.getAttribute('aria-activedescendant')).toMatch(/-opt-2$/)
  })

  it('filters as you type and reports the result count', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.type(screen.getByRole('combobox'), 'theme')
    expect(screen.getByRole('option', { name: /Switch to ink/ })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: /Pipo/ })).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('1 result')

    await user.type(screen.getByRole('combobox'), '-nothing-matches')
    expect(screen.getByText(/No command matches/)).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('0 results')
  })

  it('runs the active command on Enter and reports the close', async () => {
    const user = userEvent.setup()
    const themeRun = vi.fn()
    const onClose = vi.fn()
    render(<Harness onClose={onClose} actions={buildActions({ theme: themeRun })} />)

    const input = screen.getByRole('combobox')
    input.focus()
    await user.keyboard('{End}{Enter}')

    expect(themeRun).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })

  it('closes on Escape', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<Harness onClose={onClose} />)

    screen.getByRole('combobox').focus()
    await user.keyboard('{Escape}')
    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })

  it('returns nothing at all when closed', () => {
    render(<Harness open={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('keeps background content out of the tab order while open', async () => {
    render(<Harness />)
    const behind = screen.getByRole('button', { name: 'behind the dialog' })
    expect(behind.closest('#page')).toHaveAttribute('inert')
  })
})
