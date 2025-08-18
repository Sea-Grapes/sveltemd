# layouts issue [#584](https://github.com/pngwn/MDsveX/issues/584)

Currently I implemented nested & filesystem layouts which are quite nice to work with. But these are bad for perf and processing.

The new approach would be to use native sveltekit routing features (groups and layouts) to avoid patching the module script altogether. Instead, we can store frontmatter in a Map/Object containing path and frontmatter. Then we can provide a func to get the data for a page, still in svelte-config land. Then we can provide a 2nd file that exports a state object, which reacts to page.url store changing, and gets data for the current page. Theoretically this should work for SSR as well.

v2: tried the above, but realized filesystem layouts actually are better.
- since they only apply to markdown, they can be put at the root of folders. Say you're creating a documentation site with multiple subroutes, such as /intro, /install, /tutorial, each with markdown pages inside. If you want these to all have the same style, you can put a layout at the root and all will recieve it. With normal layouts you cannot do this, since layouts apply to everything (well you could use an if block to detect if there's frontmatter, but this is poor dx)