import { resolve } from '$app/paths'
import { page } from '$app/state'
// import matter from 'gray-matter'

const files = import.meta.glob('/src/routes/**/*.md', { eager: true })
console.log(files)

// const process = Object.fromEntries(
//   Object.entries(files).map(([path, module]) => {
//     const content = (module as any).default

//     console.log(module)

//     return [
//       path,
//       {
//         content
//       }
//     ]
//   })
// )

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
