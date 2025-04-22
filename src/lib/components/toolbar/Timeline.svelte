<script module lang="ts">
  import type { Commit } from '$lib/types';

  export type Props = {
    commits: Commit[];
    highlightCommit: number;
    useCommit?: (c: Commit) => void;
  };
</script>

<script lang="ts">
  let { commits, highlightCommit, useCommit }: Props = $props();
  let rangeStop = $derived(
    highlightCommit ? commits.findIndex((c) => c.id === highlightCommit) : -1
  );
</script>

<ul class="timeline timeline-compact timeline-horizontal snap-x max-h-full overflow-auto">
  {#each commits.toReversed() as item, index}
    {@const highlighted = 0 <= rangeStop && index < commits.length - rangeStop}
    <li>
      <hr />
      <div class="timeline-middle">
        <!-- checkmark icon -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          class="h-5 w-5"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
      <button
        class:highlight={highlighted}
        class="btn timeline-end timeline-box snap-start"
        onclick={() => useCommit?.(item)}
      >
        <div class="font-bold">{item.text}</div>
        <div class="text-sm opacity-70">{item.date}</div>
      </button>
      {#if index !== commits.length - 1}<hr />{/if}
    </li>
  {/each}
</ul>

<style lang="postcss">
  .highlight {
    @apply bg-accent text-accent-content hover:bg-primary hover:text-primary-content;
  }
</style>
