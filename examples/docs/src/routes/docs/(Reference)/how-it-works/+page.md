---
title: How Sveltemd works
---

# The Preprocessor

Sveltemd works by leveraging the parse function exported by `svelte/compiler`. It follows these steps:

1. run a "preprocess" phase that escapes any characters that break svelte syntax. This mainly involves escaping `<` and `{` characters, which svelte identifies as html and logic blocks. This is a bit more complex than simple character escaping, but more detail will be provided below.
2. call the [`parse`](https://svelte.dev/docs/svelte/svelte-compiler#parse) function from svelte - this generates a Svelte Abstract Syntax Tree (Svast), basically a json representation of your svelte code.
3. Go to every text node in the svelte AST, and parse it as markdown.
4. Congrats, your svelte has markdown now! 😊
