import diff from 'fast-diff'

// takes a original string, a transformed string, and an array of indexes.
// figures out where the indexes went in the transformed string.
// this is used for "invisible placeholders" to remove content before
// markdown parsing, and restore it in the correct place afterwards.

interface DiffResult {
  old: number
  new: number
}

// temp naive approach O(n^2)
export function locateIndexes(
  original: string,
  transformed: string,
  indexes: number[]
): DiffResult[] {
  const changes = diff(original, transformed)

  // pos in original/transformed strings
  let original_pos = 0
  let transformed_pos = 0
  // const result = new Array(indexes.length).fill(-1)
  const result: DiffResult[] = []

  changes.forEach(([op, text]) => {
    if (op === diff.EQUAL) {
      // only original text can have the original indexes?
      // if its deleted we dont care because its already -1 by default

      indexes.forEach((index, i) => {
        if (index >= original_pos && index < original_pos + text.length) {
          const offset = index - original_pos
          const new_index = transformed_pos + offset
          result.push({
            new: new_index,
            old: index,
          })
        }
      })
    }

    // original pos includes both deleted/original text
    if (op === diff.DELETE || op === diff.EQUAL) {
      original_pos += text.length
    }
    // transformed pos only includes inserted/original text
    if (op === diff.INSERT || op === diff.EQUAL) {
      transformed_pos += text.length
    }
  })

  return result
}
