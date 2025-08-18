import { page } from '$app/state'

// @ts-ignore
const files = import.meta.glob('/src/routes/**/*.md', { eager: true })

interface FrontmatterOptions {
  path?: string
}

export function metadata({ path = '/src/routes' }: FrontmatterOptions = {}): any {
  const currentPath = page.route.id || ''

  const filter = Object.entries(files)
    .filter(([key, val]) => key.startsWith('/src/routes' + currentPath))
    .map(([url, val]: [string, any]) => ({
      url: url.split('/').slice(3, -1).join('/'),
      ...val.metadata,
    }))

  return filter
}
