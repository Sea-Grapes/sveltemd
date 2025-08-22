<script>
  import './md.css'
  import { metadata } from 'sveltemd/data'

  let { children } = $props()

  let data = metadata()
</script>

<aside
  class="fixed left-0 bottom-0 h-full bg-zinc-100 lg:translate-0 -translate-x-100 transition"
>
  {#each data as page}{/each}
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
