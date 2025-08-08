import { resolve } from '$app/paths'
import { page } from '$app/state'
// import matter from 'gray-matter'

const files = import.meta.glob('/src/routes/**/*.md', { eager: true })

export function globData({} = {}) {
  const currentPath = page.route.id || ''

  const filter = Object.fromEntries(
    Object.entries(files).filter(([key, val]) => key.startsWith('/src/routes' + currentPath))
  )
  // Object.values(modules).forEach((e) => {
  // 	console.log(e())
  // })

  return filter
}
