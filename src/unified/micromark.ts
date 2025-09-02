import type {
  Extension,
  Tokenizer,
  State,
  Effects,
  Code,
} from 'micromark-util-types'

declare module 'micromark-util-types' {
  interface TokenTypeMap {
    svelteBlock: 'svelteBlock'
  }
}

// https://github.com/syntax-tree/mdast-util-mdx/blob/main/lib/index.js
import { type Extension as FromMdExtension } from 'mdast-util-from-markdown'

export function svmdExtension(): Extension {
  return {
    // flow: { [123]: { tokenize: handleSvelteBlock } },
    text: { [123]: { tokenize: handleSvelteBlock } },
  }
}

const handleSvelteBlock: Tokenizer = function (effects, ok, nok) {
  console.log('inside handler')
  let depth = 0

  return start

  function start(code: Code): State {
    if (code !== '{'.charCodeAt(0)) return nok(code) as State
    effects.enter('svelteBlock')
    effects.consume(code)
    depth = 1
    return afterBrace
  }

  // Todo: add other symbols and word match
  function afterBrace(code: Code): State {
    if (
      code === '#'.charCodeAt(0) ||
      code === ':'.charCodeAt(0) ||
      code === '/'.charCodeAt(0)
    ) {
      effects.consume(code)
      return inside
    }
    return nok(code) as State
  }

  function inside(code: Code): State {
    if (code === null) return nok(code) as State
    if (code === '}'.charCodeAt(0)) {
      effects.consume(code)
      effects.exit('svelteBlock')
      return ok
    }
    effects.consume(code)
    return inside
  }
}

export function svmdFromMarkdown(): Extension {
  return {}
}

export const svmdFromMarkdownTest2: FromMdExtension = {
  enter: {
    svelteBlock(token) {
      this.enter(
        {
          type: 'html',
          value: this.sliceSerialize(token),
        },
        token
      )
    },
  },
  exit: {
    svelteBlock(token) {
      this.exit(token)
    },
  },
}

/*
export const svmdFromMarkdownTest: FromMdExtension = {
  enter: {
    htmlFlow(token) {
      // @ts-ignore
      this.enter({ type: 'svelte', value: this.sliceSerialize(token) })
    },
  },
  exit: {
    htmlFlow() {
      // @ts-ignore
      this.exit({ type: 'svelte' })
    },
  },
}
*/
