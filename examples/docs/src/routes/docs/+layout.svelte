<script>
  import './md.css'
  import { metadata } from 'sveltemd/data'

  let { children } = $props()

  let data = metadata()

  // console.log(data)
</script>

<aside
  class="fixed left-0 bottom-0 h-full bg-zinc-100 w-65 xl:w-100 lg:translate-0 -translate-x-100 transition"
>
  {#each data as page}{/each}
</aside>

<div class="flex *:grow pl-65 xl:pl-100">
  <article class="prose mx-auto px-1-5 py-16-24 max-w-[50rem]">
    {@render children?.()}
  </article>
  <aside class="hidden xl:block"></aside>
</div>
