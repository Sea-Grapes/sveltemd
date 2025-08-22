<script>
  import './md.css'
  let { children, title } = $props()
</script>

<h1 class="font-bold text-3xl tracking-tight">{title}</h1>

<article class="custom min-w-full">
  {@render children?.()}
</article>
