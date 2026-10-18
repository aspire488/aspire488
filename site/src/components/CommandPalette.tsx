import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from 'react'
import { createPortal } from 'react-dom'
import { useModal } from '../hooks/useModal'
import { IconSearch } from './icons'

export interface PaletteAction {
  id: string
  group: string
  label: string
  hint?: string
  run: () => void
}

interface PaletteProps {
  open: boolean
  actions: PaletteAction[]
  backgroundRef: RefObject<HTMLElement | null>
  onClose: () => void
}

/**
 * Command palette: a modal combobox over navigation, projects, filters and
 * display controls. Focus stays on the input; the active option is exposed
 * through aria-activedescendant, per the ARIA combobox pattern.
 */
/**
 * Consecutive runs of actions sharing a group, preserving each action's
 * global index — option ids and activedescendant must stay list-wide.
 */
interface GroupedResults {
  name: string
  entries: { action: PaletteAction; index: number }[]
}

function groupResults(results: PaletteAction[]): GroupedResults[] {
  const groups: GroupedResults[] = []
  results.forEach((action, index) => {
    const last = groups[groups.length - 1]
    if (last && last.name === action.group) last.entries.push({ action, index })
    else groups.push({ name: action.group, entries: [{ action, index }] })
  })
  return groups
}

export default function CommandPalette({ open, actions, backgroundRef, onClose }: PaletteProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()
  const statusId = useId()

  const [term, setTerm] = useState('')
  const [active, setActive] = useState(0)

  useModal({
    open,
    onClose,
    containerRef: dialogRef,
    backgroundRef,
    initialFocusRef: inputRef,
  })

  const results = useMemo(() => {
    const needle = term.trim().toLowerCase()
    if (!needle) return actions
    return actions.filter((action) =>
      `${action.group} ${action.label} ${action.hint ?? ''}`.toLowerCase().includes(needle),
    )
  }, [actions, term])

  // Reset the cursor whenever the result set can change.
  useEffect(() => {
    setActive(0)
  }, [term])

  useEffect(() => {
    if (!open) {
      setTerm('')
      setActive(0)
    }
  }, [open])

  // Keep the active option visible while arrowing through it.
  useEffect(() => {
    if (!open) return
    const list = listRef.current
    const option = list?.querySelector<HTMLElement>('[aria-selected="true"]')
    option?.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  if (!open) return null

  const runAction = (action: PaletteAction | undefined) => {
    if (!action) return
    onClose()
    action.run()
  }

  const onKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((index) => (results.length === 0 ? 0 : (index + 1) % results.length))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((index) => (results.length === 0 ? 0 : (index - 1 + results.length) % results.length))
    } else if (event.key === 'Home') {
      event.preventDefault()
      setActive(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      setActive(Math.max(0, results.length - 1))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      runAction(results[active])
    }
  }

  return createPortal(
    <div className="palette" ref={dialogRef} role="dialog" aria-modal="true" aria-label="Command palette">
      <button type="button" className="palette__scrim" onClick={onClose} tabIndex={-1} aria-hidden="true" />

      <div className="palette__panel">
        <div className="palette__field">
          <span className="palette__icon" aria-hidden="true">
            <IconSearch />
          </span>
          <input
            ref={inputRef}
            data-autofocus
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listboxId}
            aria-activedescendant={results.length > 0 ? `${listboxId}-opt-${active}` : undefined}
            aria-autocomplete="list"
            aria-label="Search commands, projects and sections"
            placeholder="Search projects, sections, actions…"
            autoComplete="off"
            spellCheck={false}
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            onKeyDown={onKeyDown}
          />
          <kbd className="mono palette__esc" aria-hidden="true">
            esc
          </kbd>
        </div>

        <p className="visually-hidden" role="status" aria-live="polite" id={statusId}>
          {results.length} {results.length === 1 ? 'result' : 'results'}
        </p>

        {results.length === 0 ? (
          <div className="palette__empty">
            <p>No command matches “{term}”.</p>
            <p className="prose">Try a project name, a section, or “theme”.</p>
          </div>
        ) : (
          <div className="palette__list" ref={listRef} role="listbox" id={listboxId} aria-label="Commands">
            {groupResults(results).map((group, groupIndex) => (
              <div key={group.name} role="group" aria-labelledby={`${listboxId}-group-${groupIndex}`}>
                <p className="palette__group mono" id={`${listboxId}-group-${groupIndex}`}>
                  {group.name}
                </p>
                {group.entries.map(({ action, index }) => (
                  <div
                    key={action.id}
                    role="option"
                    id={`${listboxId}-opt-${index}`}
                    aria-selected={index === active}
                    className="palette__option"
                    onMouseMove={() => setActive(index)}
                    onClick={() => runAction(action)}
                  >
                    <span className="palette__label">{action.label}</span>
                    {action.hint ? <span className="palette__hint mono">{action.hint}</span> : null}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        <div className="palette__foot mono">
          <span>↑↓ move</span>
          <span>↵ open</span>
          <span>esc close</span>
        </div>
      </div>
    </div>,
    document.body,
  )
}
