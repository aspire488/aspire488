import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// GitHub Pages serves this project site from /aspire488/. BASE_PATH overrides
// it when the same build is hosted somewhere else.
const base = process.env.BASE_PATH ?? '/aspire488/'

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    outDir: 'dist',
    target: 'es2022',
    sourcemap: false,
    assetsInlineLimit: 4096,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
    restoreMocks: true,
  },
})
