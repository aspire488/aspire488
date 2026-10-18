import { describe, expect, it } from 'vitest'
import {
  CATEGORIES,
  PROJECTS,
  filterProjects,
  findProject,
  stackOptions,
} from './projects'

describe('filterProjects', () => {
  it('returns everything when no filter is set', () => {
    expect(filterProjects(PROJECTS, {})).toHaveLength(PROJECTS.length)
    expect(filterProjects(PROJECTS, { text: '   ', category: null, stack: null })).toHaveLength(
      PROJECTS.length,
    )
  })

  it('matches multi-term search across names, stacks and evidence', () => {
    const seatMap = filterProjects(PROJECTS, { text: 'seat map' })
    expect(seatMap.map((p) => p.slug)).toEqual(['campus-bus'])

    const kotlin = filterProjects(PROJECTS, { text: 'kotlin' })
    expect(kotlin.map((p) => p.slug)).toEqual(['pipo'])

    // evidence counts are searchable, not just prose
    const tests = filterProjects(PROJECTS, { text: '1495 tests' })
    expect(tests.map((p) => p.slug)).toEqual(['gh-ops'])
  })

  it('is case-insensitive on every term', () => {
    expect(filterProjects(PROJECTS, { text: 'SWING' }).map((p) => p.slug)).toEqual(['campus-bus'])
  })

  it('filters by category and by stack together', () => {
    const automation = filterProjects(PROJECTS, { category: 'automation' })
    expect(automation.map((p) => p.slug)).toEqual(
      expect.arrayContaining(['universal-engineering-augmentation', 'gh-ops', 'oss-atlas']),
    )
    expect(automation.map((p) => p.slug)).not.toContain('campus-bus')

    const pythonAndroid = filterProjects(PROJECTS, { category: 'android', stack: 'Python' })
    expect(pythonAndroid).toHaveLength(0)

    const android = filterProjects(PROJECTS, { category: 'android', stack: 'Kotlin' })
    expect(android.map((p) => p.slug)).toEqual(['pipo'])
  })

  it('reports an empty result rather than inventing matches', () => {
    expect(filterProjects(PROJECTS, { text: 'zzzz-no-such-project' })).toHaveLength(0)
  })
})

describe('catalogue integrity', () => {
  it('keeps every slugged project unique and resolvable', () => {
    const slugs = PROJECTS.map((p) => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const slug of slugs) expect(findProject(slug)?.slug).toBe(slug)
    expect(findProject('nope')).toBeUndefined()
  })

  it('only uses categories that exist in the published list', () => {
    const known = new Set(CATEGORIES.map((c) => c.id))
    for (const project of PROJECTS) {
      expect(project.categories.length).toBeGreaterThan(0)
      for (const category of project.categories) expect(known.has(category)).toBe(true)
    }
  })

  it('keeps every internal link on github.com/aspire488 and every media file present in the catalogue', () => {
    for (const project of PROJECTS) {
      expect(project.repo.startsWith('aspire488/')).toBe(true)
      expect(project.links.length).toBeGreaterThan(0)
      for (const link of project.links) expect(link.href).toMatch(/^https:\/\//)
      for (const plate of project.plates) expect(plate.src).toMatch(/^media\//)
    }
  })

  it('lists stack options sorted and unique', () => {
    const options = stackOptions(PROJECTS)
    expect(options).toEqual([...options].sort((a, b) => a.localeCompare(b)))
    expect(new Set(options).size).toBe(options.length)
    expect(options).toContain('Kotlin')
    expect(options).toContain('Python')
  })
})
