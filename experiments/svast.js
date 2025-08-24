import { walk } from 'zimmerframe'

export function processSvast(svast, string) {
  walk(
    svast,
    {},
    {
      IfBlock(node, { state }) {
        console.log(node)
      },
    }
  )
}
