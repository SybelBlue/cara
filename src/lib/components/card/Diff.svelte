<script lang="ts">
  import type { DiffText } from '$lib/types';
  import { isDiff } from '$lib/diff';

  let { diff }: { diff: DiffText } = $props();
</script>

{#if isDiff(diff)}
  {#each diff as { added, removed, value }}
    <span class:added class:removed>
      {value}
    </span>
  {/each}
{:else}
  <span>{diff}</span>
{/if}

<style lang="postcss">
  .added {
    @apply text-primary decoration-primary underline;
  }
  .removed {
    @apply text-secondary decoration-secondary line-through;
  }
</style>
