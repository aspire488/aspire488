import { defineConfig } from 'vite'

// GitHub Pages serves this project site from /aspire488/. BASE_PATH overrides
// it when the same build is hosted somewhere else.
const base = process.env.BASE_PATH ?? '/aspire488/'

export default defineConfig({
  base,
  build: {
    outDir: 'dist',
    target: 'es2022',
    sourcemap: false,
  },
})
