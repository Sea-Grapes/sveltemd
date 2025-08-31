import type {
  Extension,
  Tokenizer,
  State,
  Effects,
  Code,
} from 'micromark-util-types'

export function micromarkSvelteExtension(): Extension {
  return {
    flow: { [123]: { tokenize: handleSvelteBlock } },
    // text: { [123]: { tokenize: handleSvelteBlock } },
  }
}

const handleSvelteBlock: Tokenizer = function (effects, ok, nok) {
  return start

  function start(code: Code): State {
    if (code !== '{'.charCodeAt(0)) return nok(code) as State
    effects.enter('htmlFlow')
    effects.consume(code)
    return afterBrace
  }

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
      effects.exit('htmlFlow')
      return ok
    }
    effects.consume(code)
    return inside
  }
}
