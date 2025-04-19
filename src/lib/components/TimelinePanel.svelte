<script module lang="ts">
  import type { Card, Commit, SimpleCard } from '$lib/types';
  export type Props = {
    currentDeck: SimpleCard[];
    commits: Commit[];
    show?: boolean;
    expand?: boolean;
    setDisplayDeck?: (_: Card[]) => void;
  };
</script>

<script lang="ts">
  import { slide } from 'svelte/transition';

  import Timeline from './Timeline.svelte';

  import { diffDecks } from '$lib/diff';

  let { show, currentDeck, commits, expand = false, setDisplayDeck }: Props = $props();

  let compareDeck: SimpleCard[] | undefined = $state(undefined);
  let highlightedCommitId: number = $state(commits[commits.length - 1].id);

  const setCompareCommit = (c: Commit) => {
    compareDeck = c.state;
    highlightedCommitId = c.id;
  };

  let diffedCards = $derived(
    diffDecks(currentDeck, compareDeck ?? commits[commits.length - 1].state, expand)
  );

  $effect(() => {
    setDisplayDeck?.(show ? diffedCards : currentDeck);
  });
</script>

{#if show}
  <hr class="border-t-2 border-primary mx-4" />
  <div class="bg-base-100 p-4 w-fit rounded-lg" transition:slide={{ duration: 300, axis: 'y' }}>
    <Timeline useCommit={setCompareCommit} highlightCommit={highlightedCommitId} {commits} />
  </div>
{/if}
