import { defineConfig } from 'vite'

// GitHub Pages serves this project site from /aspire488/. BASE_PATH overrides
// it when the same build is hosted somewhere else.
const base = process.env.BASE_PATH ?? '/aspire488/'

export default defineConfig({
  base,
  build: {
    // the homepage plus two project pages, each a real HTML file so refreshes and deep links work on GitHub Pages
    rollupOptions: { input: { main: 'index.html', eventHorizon: 'event-horizon/index.html', codeflow: 'codeflow/index.html' } },
    outDir: 'dist',
    target: 'es2022',
    sourcemap: false,
  },
})
