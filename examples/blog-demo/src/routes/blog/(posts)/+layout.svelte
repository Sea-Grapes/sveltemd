<script>
  import { data } from 'sveltemd/data'

  let { children } = $props()
</script>

<h1>{data.page.url}</h1>

{@render children?.()}