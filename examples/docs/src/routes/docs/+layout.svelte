<script lang="ts">
  import ISvelte from '$lib/icons/ISvelte.svelte'
  import { metadata, type MetaData } from 'sveltemd/data'

  let { children } = $props()

  let data = metadata({ path: '/docs/' })

  let tree: Record<string, MetaData[]> = {}

  data.forEach((d) => {
    let parts = d.path_raw.split('/').slice(3, -1)
    let group = parts[1].slice(1, -1)

    if (!tree[group]) tree[group] = []
    tree[group].push(d)
  })

  for (const group in tree) {
    tree[group].sort(
      (a, b) => (a.index ?? Infinity) - (b.index ?? Infinity) || a.title?.localeCompare(b.title)
    )
  }

  // console.log(data)
</script>

<!-- very hacky css warning (This is just for quick dx) -->
<aside
  class="fixed z-20 left-0 bottom-0 h-full bg-zinc-100 lg:translate-0 -translate-x-[var(--sidebar-min)] transition"
>
  <div class="max-w-[30ch] ml-auto py-4 px-6">
    <a
      href="/"
      class="text-lg flex gap-2 items-center font-medium sticky border-b pb-4 border-zinc-300"
    >
      <ISvelte />
      Sveltemd</a
    >
    <div class="py-4 px-2 text-[15px] space-y-8">
      {#each Object.entries(tree) as [group, posts]}
        <div class="py-4 border-t border-zinc-300 first:py-0 first:border-none">
          <div>
            <h1 class="font-medium cursor-pointer pb-1">{group}</h1>
          </div>
          {#each posts as post}
            <a class="block py-1" href={post.url}>{post.title}</a>
          {/each}
        </div>
      {/each}
    </div>
  </div>
</aside>

<div class="flex lg:pl-[max(var(--sidebar-min),calc(50vw-(var(--article-max)/2)))] min-h-screen">
  <div class="grow mx-auto px-1-6 py-12 min-w-0 max-w-[var(--article-max)]">
    {@render children?.()}
  </div>
  <aside class="hidden xl:block"></aside>
</div>

<style>
  @reference 'tailwindcss';

  :root {
    --sidebar-min: 16rem;
    --article-max: 55rem;
  }

  aside {
    width: max(var(--sidebar-min), calc(50vw - (var(--article-max) / 2)));
  }
</style>
