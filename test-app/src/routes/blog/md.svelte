<script>
  import { titleCase } from 'title-case'

  let { children, title } = $props()
</script>


<header>
  <h1>{titleCase(title) || 'Unknown'}</h1>
</header>

{@render children?.()}