<script>
  import './md.css'

  let { children } = $props()
</script>

<article class="prose mx-auto px-1-5 py-16-24 max-w-[50rem]">
  {@render children?.()}
</article>