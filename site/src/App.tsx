import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Rail, { type NavItem } from './components/Rail'
import Hero from './components/Hero'
import Work from './components/Work'
import ProjectSheet from './components/ProjectSheet'
import Sources from './components/Sources'
import Upstream from './components/Upstream'
import Colophon from './components/Colophon'
import CommandPalette, { type PaletteAction } from './components/CommandPalette'
import { useTheme } from './hooks/useTheme'
import { useGitHubData } from './hooks/useGitHubData'
import { useReveal, useRevealFailsafe } from './hooks/useReveal'
import { CATEGORIES, PROJECTS, findProject, type ProjectQuery } from './content/projects'
import { USERNAME } from './lib/github'

const PROJECT_HASH = '#/p/'

export const NAV_ITEMS: NavItem[] = [
  { id: 'front', label: 'Front page' },
  { id: 'work', label: 'Work' },
  { id: 'sources', label: 'Live data' },
  { id: 'upstream', label: 'Upstream' },
  { id: 'colophon', label: 'Colophon' },
]

function isTyping(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null
  if (!element) return false
  const tag = element.tagName
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    element.isContentEditable === true
  )
}

export default function App() {
  const { theme, toggle } = useTheme()
  const github = useGitHubData()
  const pageRef = useRef<HTMLDivElement>(null)

  /* ---- project deep links (#/p/campus-bus) --------------------------- */
  const [activeSlug, setActiveSlug] = useState<string | null>(null)
  const pushedByUs = useRef(false)

  useEffect(() => {
    const sync = () => {
      const hash = window.location.hash
      if (hash.startsWith(PROJECT_HASH)) {
        const slug = decodeURIComponent(hash.slice(PROJECT_HASH.length))
        setActiveSlug(findProject(slug) ? slug : null)
      } else {
        setActiveSlug(null)
      }
    }
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  const openProject = useCallback((slug: string) => {
    pushedByUs.current = true
    window.location.hash = `${PROJECT_HASH}${encodeURIComponent(slug)}`
  }, [])

  const closeProject = useCallback(() => {
    if (pushedByUs.current && window.location.hash.startsWith(PROJECT_HASH)) {
      pushedByUs.current = false
      window.history.back()
      setActiveSlug(null)
      return
    }
    pushedByUs.current = false
    setActiveSlug(null)
    const clean = window.location.pathname + window.location.search
    window.history.replaceState(null, '', clean)
  }, [])

  const activeProject = activeSlug ? findProject(activeSlug) : undefined

  /* ---- explorer state (shared with the command palette) -------------- */
  const [query, setQuery] = useState<ProjectQuery>({ text: '', category: null, stack: null })
  const [view, setView] = useState<'plates' | 'index'>(() => {
    try {
      return window.localStorage.getItem('edition-view') === 'index' ? 'index' : 'plates'
    } catch {
      return 'plates'
    }
  })
  const searchRef = useRef<HTMLInputElement>(null)

  const setViewAndRemember = useCallback((next: 'plates' | 'index') => {
    setView(next)
    try {
      window.localStorage.setItem('edition-view', next)
    } catch {
      /* storage unavailable — view just will not persist */
    }
  }, [])

  const clearFilters = useCallback(() => {
    setQuery({ text: '', category: null, stack: null })
  }, [])

  const goTo = useCallback((id: string) => {
    const target = document.getElementById(id)
    if (!target) return
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${id}`)
  }, [])

  const focusSearch = useCallback(() => {
    goTo('work')
    // Wait for the scroll to start before moving focus.
    window.setTimeout(() => searchRef.current?.focus(), 120)
  }, [goTo])

  /* ---- command palette ---------------------------------------------- */
  const [paletteOpen, setPaletteOpen] = useState(false)
  const paletteButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey
      if (mod && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPaletteOpen((open) => !open)
        return
      }
      if (event.key === '/' && !isTyping(event.target) && !paletteOpen) {
        event.preventDefault()
        focusSearch()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [focusSearch, paletteOpen])

  const paletteActions = useMemo<PaletteAction[]>(() => {
    const sections: PaletteAction[] = NAV_ITEMS.map((item) => ({
      id: `go-${item.id}`,
      group: 'Sections',
      label: `Go to ${item.label}`,
      run: () => goTo(item.id),
    }))

    const projects: PaletteAction[] = PROJECTS.map((project) => ({
      id: `project-${project.slug}`,
      group: 'Projects',
      label: project.name,
      hint: project.tagline,
      run: () => {
        goTo('work')
        openProject(project.slug)
      },
    }))

    const filters: PaletteAction[] = CATEGORIES.map((category) => ({
      id: `filter-${category.id}`,
      group: 'Filter work',
      label: `Show ${category.label.toLowerCase()}`,
      run: () => {
        clearFilters()
        setQuery((current) => ({ ...current, category: category.id }))
        goTo('work')
      },
    }))

    const tools: PaletteAction[] = [
      {
        id: 'toggle-theme',
        group: 'Display',
        label: theme === 'light' ? 'Switch to ink (dark) theme' : 'Switch to paper (light) theme',
        run: toggle,
      },
      {
        id: 'clear-filters',
        group: 'Display',
        label: 'Clear project filters',
        run: clearFilters,
      },
      {
        id: 'focus-search',
        group: 'Display',
        label: 'Search projects',
        hint: '/',
        run: focusSearch,
      },
      {
        id: 'open-readme',
        group: 'Elsewhere',
        label: 'Open the profile README',
        run: () => window.open(`https://github.com/${USERNAME}/${USERNAME}`, '_blank', 'noopener'),
      },
      {
        id: 'open-prs',
        group: 'Elsewhere',
        label: 'Open all pull requests by aspire488',
        run: () =>
          window.open(`https://github.com/pulls?q=is%3Apr+author%3A${USERNAME}`, '_blank', 'noopener'),
      },
      {
        id: 'copy-link',
        group: 'Elsewhere',
        label: 'Copy a link to this page',
        run: () => {
          void navigator.clipboard?.writeText(window.location.href)
        },
      },
    ]

    return [...sections, ...projects, ...filters, ...tools]
  }, [clearFilters, focusSearch, goTo, openProject, theme, toggle])

  /* ---- reveals ------------------------------------------------------- */
  useReveal([activeSlug, view, query.category, query.stack, query.text])
  useRevealFailsafe()

  return (
    <>
      <div id="page" ref={pageRef}>
        <a className="skip-link" href="#work">
          Skip to the project explorer
        </a>

        <Rail
          items={NAV_ITEMS}
          theme={theme}
          onToggleTheme={toggle}
          onOpenPalette={() => setPaletteOpen(true)}
          paletteButtonRef={paletteButtonRef}
        />

        <div className="content">
          <main id="main-content">
            <Hero github={github} onExplore={() => goTo('work')} />

            <Work
              github={github}
              query={query}
              onQueryChange={setQuery}
              view={view}
              onViewChange={setViewAndRemember}
              searchRef={searchRef}
              onOpenProject={openProject}
              onClearFilters={clearFilters}
            />

            <Sources github={github} theme={theme} />

            <Upstream github={github} />
          </main>

          <Colophon theme={theme} onToggleTheme={toggle} />
        </div>
      </div>

      {activeProject ? (
        <ProjectSheet
          project={activeProject}
          github={github}
          backgroundRef={pageRef}
          onClose={closeProject}
          onNavigate={(slug) => {
            pushedByUs.current = true
            window.location.hash = `${PROJECT_HASH}${encodeURIComponent(slug)}`
          }}
        />
      ) : null}

      <CommandPalette
        open={paletteOpen}
        actions={paletteActions}
        backgroundRef={pageRef}
        onClose={() => {
          setPaletteOpen(false)
          paletteButtonRef.current?.focus()
        }}
      />
    </>
  )
}
