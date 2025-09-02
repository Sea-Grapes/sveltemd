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

// This is a somewhat ported version of the svelte bracket match util
// Also see micromark-extension-mdx-jsx
// https://github.com/sveltejs/svelte/blob/main/packages/svelte/src/compiler/phases/1-parse/utils/bracket.js
// https://github.com/micromark/micromark-extension-mdx-jsx/blob/main/dev/lib/factory-tag.js

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

    if (code === '{'.charCodeAt(0)) {
      depth++
      effects.consume(code)
      return inside
    }

    if (code === '}'.charCodeAt(0)) {
      depth--
      effects.consume(code)
      if (depth == 0) {
        effects.exit('svelteBlock')
        return ok
      }
    }

    if (
      code === `"`.charCodeAt(0) ||
      code === `'`.charCodeAt(0) ||
      code === '`'.charCodeAt(0)
    ) {
      effects.consume(code)
      return inString(code)
    }

    if (code === '/'.charCodeAt(0)) {
      return afterSlash
    }

    effects.consume(code)
    return inside
  }

  function afterSlash(code: Code): State {
    if (code === '/'.charCodeAt(0)) {
      effects.consume(code)
      return inLineComment
    }

    if (code === '*'.charCodeAt(0)) {
      effects.consume(code)
      return inBlockContent
    }

    return inRegex(code)
  }

  function inLineComment(code: Code): State {
    if (code === null) return nok(code) as State
    effects.consume(code)
    // Todo: eval correctness
    if (code === '\n'.charCodeAt(0)) return inside
    return inLineComment
  }

  function inBlockContent(code: Code): State {
    if (code === null) return nok(code) as State
    effects.consume(code)
    if (code === '*'.charCodeAt(0)) return afterBlockCommentStar
    return inBlockContent
  }

  function afterBlockCommentStar(code: Code): State {
    // only break out of comment if exactly "*/"
    if (code === '/'.charCodeAt(0)) {
      effects.consume(code)
      return inside
    }
    return inBlockContent(code)
  }

  // Todo: evaluate correctness
  function inRegex(code: Code): State {
    if (code === null) return nok(code) as State
    effects.consume(code)

    if (code === '/'.charCodeAt(0)) return inside

    // singular slash character, just js strings escape it
    if (code === '\\'.charCodeAt(0)) {
      return escapeCode(inRegex)
    }

    return inRegex
  }

  function inString(quote: Code): State {
    // a second function required so we can store the quote character^ above,
    // and thus match the correct one
    return function currentString(code: Code): State {
      if (code === null) return nok(code) as State
      effects.consume(code)

      if (code === quote) return inside

      if (code === '\\'.charCodeAt(0)) {
        return escapeCode(currentString)
      }

      if (quote === '`'.charCodeAt(0) && code === '$'.charCodeAt(0)) {
        return inStringTemplate
      }

      return currentString
    }
  }

  function inStringTemplate(code: Code): State {
    if (code === '{'.charCodeAt(0)) {
      effects.consume(code)
      depth++
      return inside
    }

    // Todo: evaluate correctness (possible undef?)
    // continue with same string type
    return inString('`'.charCodeAt(0))(code) as State
  }

  // consumes escape character \ plus its next character
  function escapeCode(next: (code: Code) => State): State {
    return function escaped(code: Code): State {
      if (code === null) return nok(code) as State
      effects.consume(code)
      return next
    }
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
