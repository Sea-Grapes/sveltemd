<script>
  import './md.css'
  import { metadata } from 'sveltemd/data'

  let { children } = $props()

  let data = metadata()

  // console.log(data)
</script>

<aside
  class="fixed left-0 bottom-0 h-full bg-zinc-100 min-w-[30ch] lg:translate-0 -translate-x-[30ch] transition"
>
  {#each data as page}
  {/each}
</aside>
<article class="prose mx-auto px-1-5 py-16-24 max-w-[50rem]">
  {@render children?.()}
</article>
