import { resolve } from '$app/paths'
import { page } from '$app/state'

export function frontmatter({} = {}) {
  const files = import.meta.glob('/src/routes/**/*.md', { eager: true })

  const currentPath = page.route.id || ''

  const filter = Object.entries(files)
    .filter(([key, val]) => key.startsWith('/src/routes' + currentPath))
    .map(([url, val]: [string, any]) => ({
      url: url.split('/').slice(3, -1).join('/'),
      ...val.metadata,
    }))

  // const filter = Object.fromEntries(
  //   Object.entries(files)
  //     .filter(([key, val]) => key.startsWith('/src/routes' + currentPath))
  //     .map(([path, module]) => {
  //       let mod = module as any

  //       return {
  //         ...mod.metadata,
  //       }
  //     })
  // .map(([path, module]) => {
  //   let res: any = {}
  //   const mod = module as any

  //   res.content = mod.default
  //   if (mod.metadata) res.metadata = mod.metadata

  //   return [path, res]
  // })
  // )
  // Object.values(modules).forEach((e) => {
  // 	console.log(e())
  // })

  return filter
}
