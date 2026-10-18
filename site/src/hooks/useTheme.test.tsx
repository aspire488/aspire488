import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { useTheme } from './useTheme'

function ThemeProbe() {
  const { theme, toggle } = useTheme()
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button type="button" onClick={toggle}>
        flip
      </button>
    </div>
  )
}

describe('useTheme', () => {
  it('defaults to the system preference when nothing is stored', () => {
    render(<ThemeProbe />)
    expect(screen.getByTestId('theme')).toHaveTextContent('light')
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('restores the stored theme and applies it to the document', () => {
    window.localStorage.setItem('edition-theme', 'dark')
    render(<ThemeProbe />)
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('toggles, persists and re-applies on every flip', async () => {
    const user = userEvent.setup()
    window.localStorage.setItem('edition-theme', 'dark')
    render(<ThemeProbe />)

    await user.click(screen.getByRole('button', { name: 'flip' }))
    expect(screen.getByTestId('theme')).toHaveTextContent('light')
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(window.localStorage.getItem('edition-theme')).toBe('light')

    await user.click(screen.getByRole('button', { name: 'flip' }))
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(window.localStorage.getItem('edition-theme')).toBe('dark')
  })

  it('survives blocked storage without crashing', async () => {
    const user = userEvent.setup()
    const original = window.localStorage.setItem
    window.localStorage.setItem = () => {
      throw new DOMException('denied', 'SecurityError')
    }
    try {
      render(<ThemeProbe />)
      await user.click(screen.getByRole('button', { name: 'flip' }))
      expect(document.documentElement.dataset.theme).toBe('dark')
    } finally {
      window.localStorage.setItem = original
    }
  })
})
