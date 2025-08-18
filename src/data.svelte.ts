// @ts-ignore
import { page as svpage } from '$app/state'
import { onMount } from 'svelte'

// @ts-ignore
const files = import.meta.glob('/src/routes/**/*.md', { eager: true })

export function pages(): Object[] {
  console.log(files)

  const currentPath = svpage.route.id || ''

  const filter = Object.entries(files)
    .filter(([key, val]) => key.startsWith('/src/routes' + currentPath))
    .map(([url, val]: [string, any]) => ({
      url: url.split('/').slice(3, -1).join('/'),
      ...val.metadata,
    }))

  return filter
}

interface PageData {
  url: string
}

// export const page: Object = $state({})
// export const page: PageData = $derived.by(() => {
//   return {
//     url: String(svpage.url),
//   }
// })


class Data {
  page: PageData

  constructor() {
    this.page = $derived.by(() => {
      return {
        url: String(svpage.url.pathname)
      }
    })
  }
}

export const data: Data = new Data()