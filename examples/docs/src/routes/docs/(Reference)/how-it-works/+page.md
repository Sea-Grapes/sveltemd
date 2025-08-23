---
title: How Sveltemd works
---

# The Preprocessor

Sveltemd works by leveraging the parse function exported by `svelte/compiler`. It follows these steps:

1. run a "preprocess" phase that escapes any characters that break svelte syntax. This mainly involves escaping `<` and `{` characters, which svelte identifies as html and logic blocks.
2. call the [`parse`](https://svelte.dev/docs/svelte/svelte-compiler#parse) function from svelte - this generates a Svelte Abstract Syntax Tree (Svast), basically a json representation of your svelte code.
3. Go to every text node in the svelte AST, and parse it as markdown.
4. Congrats, your svelte has markdown now! 😊

## Details

The preprocess phase works by using some tricks. Unfortunately, the svelte `parse` function by itself is not enough to distinguish between svelte and markdown; this is because it will interpret everything using svelte's specific syntax, and will break on "illegal" content. Therefore, we can find anything that should be hidden from svelte and temporarily replace it with a placeholder until the markdown step.

The builtin preprocess uses `hast-util-from-html` and `mdast-util-from-markdown` as a lightweight-ish way to identify things that should be escaped.

1. First, `hast-util-from-html` parses your raw content into an html AST. Any `<` symbols leftover in text are thus not valid html

