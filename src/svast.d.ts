import MagicString from 'magic-string'
import { AST } from 'svelte/compiler'

export function processSvast(
  svast: AST.Fragment,
  raw: string,
  s: MagicString
): string[]
