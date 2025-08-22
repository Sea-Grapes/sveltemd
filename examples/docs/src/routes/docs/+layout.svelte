<script>
  import ISvelte from '$lib/icons/ISvelte.svelte'
  import './md.css'
  import { metadata } from 'sveltemd/data'

  let { children } = $props()

  let data = metadata()
  console.log(data)
</script>

<!-- very hacky css warning (This is just for quick dx) -->
<aside
  class="fixed left-0 bottom-0 h-full bg-zinc-100 lg:translate-0 -translate-x-[16rem] transition"
>
  <div class="max-w-[30ch] ml-auto py-4 px-5">
    <a href="/" class="text-lg flex gap-2 items-center font-medium">
      <ISvelte />
      Sveltemd</a
    >
    {#each data as page}
      <a href={page.url}>{page.title}</a>
    {/each}
  </div>
</aside>

<div
  class="flex lg:pl-[max(var(--sidebar-min),calc(50vw-(var(--article-max)/2)))]"
>
  <article
    class="prose grow mx-auto px-1-5 py-16-24 max-w-[var(--article-max)]"
  >
    {@render children?.()}
  </article>
  <aside class="hidden xl:block"></aside>
</div>

<style>
  @reference 'tailwindcss';

  :root {
    --sidebar-min: 16rem;
    --article-max: 50rem;
  }

  aside {
    width: max(var(--sidebar-min), calc(50vw - (var(--article-max) / 2)));
  }
</style>
