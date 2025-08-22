<script>
  import './md.css'
  let { children, title } = $props()
</script>

<h1>{title}</h1>

<article>
  {@render children?.()}
</article>
