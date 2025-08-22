<script>
  let count = $state(0)
</script>

<h1 class="text-3xl font-bold tracking-tight">Welcome to the demo site</h1>

this is a **test**

<button class='bg-slate-100 hover:bg-slate-200 rounded-md p-1 px-2 cursor-pointer' onclick={() => { count++ }}>
This _button_ has been clicked {count} times
</button>
