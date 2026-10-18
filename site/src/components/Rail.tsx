import { useEffect, useRef, useState, type RefObject } from 'react'
import type { Theme } from '../hooks/useTheme'
import { USERNAME } from '../lib/github'
import { IconClose, IconMenu, IconMoon, IconSearch, IconSun } from './icons'

export interface NavItem {
  id: string
  label: string
}

interface RailProps {
  items: NavItem[]
  theme: Theme
  onToggleTheme: () => void
  onOpenPalette: () => void
  paletteButtonRef: RefObject<HTMLButtonElement | null>
}

/**
 * Fixed identity rail: section navigation, page progress and the two
 * global controls (theme, command palette). Collapses to a top bar with a
 * disclosure menu below 1100px.
 */
export default function Rail({
  items,
  theme,
  onToggleTheme,
  onOpenPalette,
  paletteButtonRef,
}: RailProps) {
  const railRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const [active, setActive] = useState(items[0]?.id ?? '')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0
      const root = document.documentElement
      const scrollable = root.scrollHeight - window.innerHeight
      const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0
      railRef.current?.style.setProperty('--progress', progress.toFixed(4))

      let current = items[0]?.id ?? ''
      for (const item of items) {
        const section = document.getElementById(item.id)
        if (section && section.getBoundingClientRect().top <= 160) current = item.id
      }
      setActive(current)
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [items])

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    const onClick = (event: MouseEvent) => {
      if (!railRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onClick)
    }
  }, [menuOpen])

  return (
    <header className="rail" ref={railRef} data-menu-open={menuOpen || undefined}>
      <div className="rail__bar">
        <a
          className="rail__wordmark no-ring"
          href={`#${items[0]?.id ?? 'front'}`}
          onClick={() => setMenuOpen(false)}
        >
          <span className="rail__name">Joel Jigo</span>
          <span className="rail__handle mono">@{USERNAME}</span>
        </a>
      </div>

      <nav className="rail__nav" id="rail-nav" aria-label="Sections" data-open={menuOpen || undefined}>
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={active === item.id ? 'true' : undefined}
                onClick={() => setMenuOpen(false)}
              >
                <span className="rail__marker" aria-hidden="true" />
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="rail__nav-foot">
          <a
            className="rail__gh mono"
            href={`https://github.com/${USERNAME}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/{USERNAME}
          </a>
        </div>
      </nav>

      <div className="rail__controls">
        <button
          type="button"
          className="rail__icon-btn"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'ink' : 'paper'} theme`}
          title={`Switch to ${theme === 'light' ? 'ink' : 'paper'} theme`}
        >
          {theme === 'light' ? <IconMoon /> : <IconSun />}
        </button>

        <button
          type="button"
          className="rail__palette"
          onClick={onOpenPalette}
          ref={paletteButtonRef}
          aria-keyshortcuts="Control+K Meta+K"
        >
          <IconSearch />
          <span className="rail__palette-label">Search</span>
          <kbd className="mono" aria-hidden="true">
            ⌘K
          </kbd>
        </button>

        <button
          type="button"
          className="rail__icon-btn rail__menu-btn"
          ref={menuButtonRef}
          aria-expanded={menuOpen}
          aria-controls="rail-nav"
          aria-label={menuOpen ? 'Close section menu' : 'Open section menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <IconClose /> : <IconMenu />}
        </button>
      </div>

      <div className="rail__progress" aria-hidden="true">
        <span className="rail__progress-fill" />
      </div>
    </header>
  )
}
