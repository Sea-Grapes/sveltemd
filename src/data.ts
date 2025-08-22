import { page } from '$app/state'
import { resolve } from '$app/paths'

// @ts-ignore
const files = import.meta.glob('/src/routes/**/*.md', { eager: true })

const trim_path = (string: string) => {
  return '/' + string.split('/').slice(3, -1).join('/')
}

interface FrontmatterOptions {
  path?: string
}

export function metadata({
  path = '/src/routes',
}: FrontmatterOptions = {}): any {
  const currentPath = page.route.id || ''

  const filter = Object.entries(files)
    .filter(([key, val]) => key.startsWith('/src/routes' + currentPath))
    .map(([path, val]: [string, any]) => {
      let url_raw = resolve(path, {})

      return {
        path: trim_path(path),
        path_raw: path,
        url: trim_path(url_raw),
        url_raw,
        ...val.metadata,
      }
    })

  return filter
}
