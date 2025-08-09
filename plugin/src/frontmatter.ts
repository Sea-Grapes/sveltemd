import { page } from '$app/state'

export function frontmatter({} = {}) {
  const files = import.meta.glob('/src/routes/**/*.md', { eager: true })

  const currentPath = page.route.id || ''

  const filter = Object.fromEntries(
    Object.entries(files)
      .filter(([key, val]) => key.startsWith('/src/routes' + currentPath))
      .map(([path, module]) => {
        const content = (module as any).default

        // console.log(module)

        return [
          path,
          {
            content,
          },
        ]
      })
  )
  // Object.values(modules).forEach((e) => {
  // 	console.log(e())
  // })

  return filter
}
