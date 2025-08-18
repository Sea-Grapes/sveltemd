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

// export function page(): any {
//   let page_data: any = $state({})

//   $effect(() => {
//     const key = svpage.url.pathname
//     const frontmatter = map[key] || {}

//     page_data = {
//       ...frontmatter,
//       url: key
//     }
//   })

//   return page_data
// }

class Data {
  page: any

  constructor() {
    this.page = $state.raw({})
    this.page.url = svpage.url.pathname
  }
}

export function page(): any {
  let data = new Data()

  $effect(() => {
    const url = svpage.url.pathname
    const fm = map[url] || {}

    data.page = {
      url,
      ...fm
    }
  })

  return data
}