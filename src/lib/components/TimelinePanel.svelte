<script module lang="ts">
  export type Props = {
    currentDeck: SimpleDeck;
    commits: Commit[];
    show?: boolean;
    expand?: boolean;
    setDisplayDeck?: (_: Deck) => void;
  };
</script>

<script lang="ts">
  import { slide } from 'svelte/transition';
  import type { Commit, SimpleDeck, Deck } from '$lib/types';

  import Timeline from './Timeline.svelte';

  import { diffDecks } from '$lib/diff';

  let { show, currentDeck, commits, expand = false, setDisplayDeck }: Props = $props();

  let compareDeck: SimpleDeck | undefined = $state(undefined);
  let highlightedCommitId: number = $state(commits[commits.length - 1].id);

  const setCompareCommit = (c: Commit) => {
    compareDeck = c.state;
    highlightedCommitId = c.id;
  };

  let diffedCards = $derived(
    diffDecks(compareDeck ?? commits[commits.length - 1].state ?? [], currentDeck, expand)
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
