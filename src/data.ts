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

export interface MetaData {
  path: string
  path_raw: string
  url: string
  url_raw: string

  [key: string]: any
}

export function metadata({ path }: FrontmatterOptions = {}): MetaData[] {
  const currentPath = path || page.route.id || ''

  const filter = Object.entries(files)
    // .filter(([key, val]) => {
    //   console.log(resolve(key, {}))
    //   let url = trim_path(resolve(key, {}))
    //   // console.log(resolve(key, {}))
    //   console.log(url)
    //   return url.startsWith(currentPath)
    // })
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
