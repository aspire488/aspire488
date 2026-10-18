/** Prefix a public/ path with the deployment base (GitHub Pages project path). */
export function asset(path: string): string {
  const base = import.meta.env.BASE_URL
  return `${base}${path.replace(/^\/+/, '')}`
}
