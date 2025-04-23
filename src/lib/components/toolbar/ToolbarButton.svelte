<script module lang="ts">
  import type { Snippet } from 'svelte';

  export type Props = {
    label: string;
    tooltip?: boolean | string;
    toggled?: boolean;
    inner?: Snippet<[boolean]>;
  };
</script>

<script lang="ts">
  let { toggled = $bindable(false), label, tooltip, inner }: Props = $props();
</script>

<div class:tooltip data-tip={tooltip === true ? label : tooltip} class="tooltip-bottom">
  <button
    class="btn btn-ghost btn-circle input-bordered"
    aria-label={label}
    onclick={() => (toggled = !toggled)}
  >
    {#if inner}
      {@render inner(toggled)}
    {:else}
      {label}
    {/if}
  </button>
</div>
