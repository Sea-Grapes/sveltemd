import { walk } from 'estree-walker'
import MagicString from 'magic-string'
import { AST } from 'svelte/compiler'

type SvastNode = {
  data?: string
  raw?: string
} & (
  | AST.AttributeLike
  | AST.Directive
  | AST.Block
  | AST.ElementLike
  | AST.Tag
  | AST.TemplateNode
)

export function processSvast(
  svast: AST.Root,
  raw: string,
  s: MagicString
): string[] {
  let placeholders: string[] = []

  // @ts-ignore
  walk(svast, {
    enter(node: SvastNode, parent: SvastNode, key: any, index: number) {
      switch (node.type) {
        case 'Text':
        case 'RegularElement':
          break
        default:
          if (parent.type === 'Root') {
            let content = raw.slice(node.start, node.end)
            s.update(node.start, node.end, `+#SVMD${placeholders.length};`)
            placeholders.push(content)
          }
      }
    },
  })

  return placeholders
}
