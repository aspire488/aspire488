import type { Theme } from '../hooks/useTheme'
import { USERNAME } from '../lib/github'
import { IconMoon, IconSun } from './icons'

interface ColophonProps {
  theme: Theme
  onToggleTheme: () => void
}

const SHORTCUTS: { keys: string; action: string }[] = [
  { keys: '⌘ K / Ctrl K', action: 'Open the command palette' },
  { keys: '/', action: 'Jump to project search' },
  { keys: 'Esc', action: 'Close a record or the palette' },
]

export default function Colophon({ theme, onToggleTheme }: ColophonProps) {
  return (
    <footer className="colophon" id="colophon" aria-labelledby="colophon-title">
      <div className="colophon__top" data-reveal>
        <h2 className="section-title" id="colophon-title">
          Colophon
        </h2>
        <p className="lede">
          Everything on this page is either written here, measured by GitHub, or captured from the
          running software.
        </p>
      </div>

      <div className="colophon__grid">
        <section aria-labelledby="colophon-links" data-reveal>
          <h3 className="colophon__label" id="colophon-links">
            Elsewhere
          </h3>
          <ul className="colophon__links">
            <li>
              <a href={`https://github.com/${USERNAME}`} target="_blank" rel="noopener noreferrer">
                github.com/{USERNAME}
                <span className="ext" aria-hidden="true">
                  ↗
                </span>
                <span className="visually-hidden">(opens in a new tab)</span>
              </a>
            </li>
            <li>
              <a
                href={`https://github.com/pulls?q=is%3Apr+author%3A${USERNAME}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                All pull requests
                <span className="ext" aria-hidden="true">
                  ↗
                </span>
                <span className="visually-hidden">(opens in a new tab)</span>
              </a>
            </li>
            <li>
              <a
                href={`https://github.com/${USERNAME}/${USERNAME}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Profile README
                <span className="ext" aria-hidden="true">
                  ↗
                </span>
                <span className="visually-hidden">(opens in a new tab)</span>
              </a>
            </li>
            <li>
              <a
                href={`https://github.com/${USERNAME}/${USERNAME}/tree/main/site`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Source for this site
                <span className="ext" aria-hidden="true">
                  ↗
                </span>
                <span className="visually-hidden">(opens in a new tab)</span>
              </a>
            </li>
          </ul>
        </section>

        <section aria-labelledby="colophon-keys" data-reveal>
          <h3 className="colophon__label" id="colophon-keys">
            Keyboard
          </h3>
          <dl className="keys">
            {SHORTCUTS.map((shortcut) => (
              <div key={shortcut.keys}>
                <dt>
                  <kbd className="mono">{shortcut.keys}</kbd>
                </dt>
                <dd>{shortcut.action}</dd>
              </div>
            ))}
          </dl>

          <button type="button" className="btn btn--ghost colophon__theme" onClick={onToggleTheme}>
            {theme === 'light' ? <IconMoon aria-hidden="true" /> : <IconSun aria-hidden="true" />}
            Switch to {theme === 'light' ? 'ink' : 'paper'}
          </button>
        </section>

        <section aria-labelledby="colophon-notes" data-reveal>
          <h3 className="colophon__label" id="colophon-notes">
            Notes
          </h3>
          <p className="prose colophon__note">
            Set in Archivo and IBM Plex Mono. Built with React, Vite and TypeScript, deployed on
            GitHub Pages from the profile repository. Repository figures come from the GitHub API
            with a build-time snapshot as fallback; screenshots were taken from the running
            applications.
          </p>
          <p className="prose colophon__note">
            No trackers, no analytics, no cookies beyond remembering your theme.
          </p>
          <p className="mono colophon__signoff">© 2026 Joel Jigo</p>
        </section>
      </div>
    </footer>
  )
}
