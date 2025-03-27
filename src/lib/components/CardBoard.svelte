<script module lang="ts">
  import type { Deck } from '$lib/types';

  export interface Props {
    cards: Deck;
    animateIn?: boolean;
    allowEditing?: boolean;
    selectCard?: (c: Deck[number]) => void;
  }
</script>

<script lang="ts">
  import { flip } from 'svelte/animate';
  import { debug, highlightedClass } from '$lib/stores';
  import Card from './Card.svelte';

  let { cards = $bindable(), animateIn = !$debug, allowEditing, selectCard }: Props = $props();

  if (animateIn) setTimeout(() => (animateIn = false), 200);

  let width: number = $state(0);
  let columns = $derived(Math.max(1, Math.round(width / 400 - 0.6)));

  const propagate = (name: string) => {
    const card = cards.find((card) => card.name == name);
    if (card) {
      selectCard?.(card);
    } else {
      console.error('Did not find card of name', name);
    }
  };
</script>

<div id="backdrop">
  <ul class="min-h-full grid p-1 gap-2 grid-cols-{columns}" bind:clientWidth={width}>
    {#each cards as { id, ...cardProps } (id)}
      {@const surface = cardProps.name === $highlightedClass}
      <li class:surface animate:flip={{ duration: 400 }}>
        {#if !animateIn}
          <Card locked={!allowEditing} selectName={propagate} {...cardProps} />
        {/if}
      </li>
    {/each}
  </ul>
</div>

<style lang="postcss">
  #backdrop {
    @apply relative top-0 left-0 bg-base-100 max-h-full overflow-scroll snap-y;
  }

  li {
    @apply relative snap-start;
    z-index: 1;

    &.surface {
      @apply sticky snap-none top-0 bottom-0 isolate pointer-events-none;
      z-index: 2;
    }
  }
</style>
