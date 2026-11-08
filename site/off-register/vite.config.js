import { defineConfig, normalizePath } from 'vite'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { injectMarkers } from './scripts/render.mjs'

// GitHub Pages serves this project site from /aspire488/. BASE_PATH overrides
// it when the same build is hosted somewhere else.
const base = process.env.BASE_PATH ?? '/aspire488/'

const file = (name) => normalizePath(fileURLToPath(new URL(`./data/${name}`, import.meta.url)))
const publicDir = fileURLToPath(new URL('./public/', import.meta.url))

// Reads a data file or throws: a build that finds a marker but no valid data must fail, never ship an empty section.
function load(name, ok) {
  let data
  try { data = JSON.parse(readFileSync(file(name), 'utf8')) } catch (e) { throw new Error(`data/${name} is missing or invalid: ${e.message}`) }
  if (!ok(data)) throw new Error(`data/${name} is empty or malformed`)
  return data
}

// Fills the <!--@featured-->, <!--@more-->, <!--@upstream--> markers in index.html from data/*.json.
function portfolioData() {
  return {
    name: 'portfolio-data',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return injectMarkers(html, {
          projects: () => {
            const d = load('projects.json', (x) => x.featured?.length && Array.isArray(x.more))
            // art may not be drawn yet: a missing file must not become a broken <img>
            for (const p of d.featured) if (p.visual && !existsSync(publicDir + p.visual)) p.visual = null
            return d
          },
          contributions: () => load('contributions.json', (x) => x.featured?.length && x.counts),
        })
      },
    },
    configureServer(server) {
      const watched = [file('projects.json'), file('contributions.json')]
      server.watcher.add(watched)
      server.watcher.on('change', (f) => { if (watched.includes(f)) server.ws.send({ type: 'full-reload' }) })
    },
  }
}

export default defineConfig({
  base,
  plugins: [portfolioData()],
  build: {
    // the homepage plus two project pages, each a real HTML file so refreshes and deep links work on GitHub Pages
    rollupOptions: { input: { main: 'index.html', eventHorizon: 'event-horizon/index.html', codeflow: 'codeflow/index.html', pipo: 'pipo/index.html', campusBus: 'campus-bus/index.html' } },
    outDir: 'dist',
    target: 'es2022',
    sourcemap: false,
  },
})
