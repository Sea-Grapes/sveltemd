// @ts-ignore
import { page as svpage } from '$app/state'
import { onMount } from 'svelte'

// @ts-ignore
const files = import.meta.glob('/src/routes/**/*.md', { eager: true })
console.log(files)

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

export function page(): PageData {
  let page_data: PageData = $derived.by(() => {
    return {
      url: String(svpage.url.pathname),
    }
  })
  return page_data
}
