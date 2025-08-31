/**
 * @type {import('micromark-util-types').Extension}
 */
export function micromarkSvelteExtension() {
  return {
    flow: { [123]: { tokenize: handleSvelteBlock } },
    // text: { [123]: tokenizeSvelteInline },
  }
}

/**
 * @type {import('micromark-util-types').Tokenizer}
 */
const handleSvelteBlock = function (effects, ok, nok) {
  return start

  function start(code) {
    effects.enter()
  }
}
