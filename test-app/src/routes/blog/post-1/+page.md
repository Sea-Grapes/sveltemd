---
title: test post 1
---

<script module>
  export const test = {
    test: 'test'
  }
</script>

<script>
  let test = $state('test')
  console.log(test)
</script>

# post

this is a test post example

{#if test}

  <p>{test}</p>
{/if}

<style>
  h1 {
    font-size: 2rem;
  }
</style>

# test
