import { walk } from 'estree-walker'

export function processSvast(svast, raw, s) {
  let placeholders = []

  // let whitelist = ['Text', 'RegularElement', 'SvelteElement']

  const escape = (start, end) => {
    if(!end) {
      let node = start
      start = node.start
      end = node.end
    }
    let content = raw.slice(start, end)
    s.update(start, end, `+#SVMD${placeholders.length};`)
    placeholders.push(content)
  }

  // @ts-ignore
  walk(svast, {
    enter(node, parent, key, index) {
      console.log(node)
      if (node.type === 'Fragment') return

      switch (node.type) {
        case 'ExpressionTag':
          escape(node.expression)
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
