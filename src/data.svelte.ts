// @ts-ignore
import { page as svpage } from '$app/state'
import { onMount } from 'svelte'

// @ts-ignore
const files = import.meta.glob('/src/routes/**/*.md', { eager: true })
console.log(files)

const map = Object.fromEntries(
  Object.entries(files).map(([path, module]: [string, any]) => {
    const clean_path = path.split('/').slice(3, -1)
    return [clean_path, module.metadata]
  })
)

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

// any because user can put anything into frontmatter
// export function page(): any {
//   let page_data: any = $state({
//     url: svpage.url.pathname
//   })

//   $effect(() => {
//     page_data.url = svpage.url.pathname
//   })

//   return page_data
// }

export function page(): any {
  let page_data: any = $state({
    url: svpage.url.pathname
  })

  $effect(() => {
    const key = svpage.url.pathname
    const frontmatter = map[key] || {
      foo: 'bar'
    }

    Object.assign(page_data, { url: key, ...frontmatter })
  })

  return page_data
}