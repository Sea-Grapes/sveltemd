# layouts issue [#584](https://github.com/pngwn/MDsveX/issues/584)

Currently I implemented nested & filesystem layouts which are quite nice to work with. But these are bad for perf and processing.

The new approach would be to use native sveltekit routing features (groups and layouts) to avoid patching the module script altogether. Instead, we can store frontmatter in a Map/Object containing path and frontmatter. Then we can provide a func to get the data for a page, still in svelte-config land. Then we can provide a 2nd file that exports a state object, which reacts to page.url store changing, and gets data for the current page. Theoretically this should work for SSR as well.

If we do want to find layouts, say for customizing components (Perhaps it would be convenient to export them from layouts), it would probably be better to start at the file and walk up the tree to find layouts, rather than globbing all and filtering. More likely components will be customized by specifying a path in config, but not sure.
