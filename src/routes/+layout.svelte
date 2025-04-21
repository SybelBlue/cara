<script lang="ts">
  import '../app.css';
  import type { Snippet } from 'svelte';

  interface Props {
    children?: Snippet<[]>;
  }

  let { children }: Props = $props();
</script>

<div id="app">
  {@render children?.()}
</div>

<style lang="postcss">
  #app {
    @apply absolute overflow-hidden flex flex-col p-0 m-auto min-h-full max-h-[100vh] max-w-[100vw] box-border;
  }
</style>
