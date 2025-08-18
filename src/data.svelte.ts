// @ts-ignore
import { page } from '$app/state'
import { onMount } from 'svelte'

// @ts-ignore
const files = import.meta.glob('/**/*.md', { eager: true })
console.log(files)

const map = Object.fromEntries(
  Object.entries(files).map(([path, module]: [string, any]) => {
    const clean_path = '/' + path.split('/').slice(3, -1).join('/')
    return [clean_path, module.metadata]
  })
)

interface PagesOptions {
  path: string
}

export function pages({ path = '/src/routes' }: PagesOptions): Object[] {
  const currentPath = page.route.id || ''

  const filter = Object.entries(files)
    .filter(([key, val]) => key.startsWith('/src/routes' + currentPath))
    .map(([url, val]: [string, any]) => ({
      url: url.split('/').slice(3, -1).join('/'),
      ...val.metadata,
    }))

  return filter
}

// any because user can put anything into frontmatter
// export function page(): any {
//   let page_data: any = $state({
//     url: page.url.pathname
//   })

//   $effect(() => {
//     page_data.url = page.url.pathname
//   })

//   return page_data
// }

export function meta(): any {
  const id = page.route.id || ''
  const data = map[id] || {}

  let page_data: any = $state(data)

  $effect(() => {
    const id = page.route.id || ''
    const data = map[id] || {}
    if (data) Object.assign(page_data, { ...data })
  })

  return page_data
}
