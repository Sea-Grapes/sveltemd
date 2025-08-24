import { walk } from 'estree-walker'
import { AST } from 'svelte/compiler'
import { locateIndexes } from './diff'

export function escapeSvast(svast: AST.Fragment, content: string) {
  // let whitelist = ['Text', 'RegularElement', 'SvelteElement']

  let placeholders: Record<number, string> = {}

  const remove = (start: number, end: number) => {
    let res = content.slice(start, end)
    content = content.slice(0, start) + content.slice(end)
    placeholders[start] = res
  }

  // @ts-ignore
  walk(svast, {
    enter(node: any, parent: any, key, index) {
      // console.log(node)
      if (node.type === 'Fragment') return

      switch (node.type) {
        case 'Attribute':
          remove(node.start, node.end)
          break

        default:
          if (parent.type === 'Root') {
          }
      }
    },
  })

  return { content, placeholders }
}

export function restoreSvast(
  placeholders: Record<number, string>,
  original: string,
  transformed: string
): string {
  let indexes = locateIndexes(
    original,
    transformed,
    Object.keys(placeholders).map((e) => Number(e))
  )

  const insert = (index: number, string: string) => {
    transformed =
      transformed.slice(0, index) + string + transformed.slice(index)
  }

  indexes.forEach((index, i) => {
    let content = placeholders[index.old]
    if(!content) return
    insert(index.new, content)
  })

  return transformed
}
