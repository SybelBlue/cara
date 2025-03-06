<script module lang="ts">
  import type { Deck, SimpleDeck } from '$lib/types';

  export interface Props {
    cards: Deck;
    animateIn?: boolean;
    selectCard?: (c: Deck[number]) => void;
    addCard?: (c: SimpleDeck[number]) => void;
  }
</script>

<script lang="ts">
  import { flip } from 'svelte/animate';
  import { withId } from '$lib/decks';
  import { debug, highlightedClass } from '$lib/stores';
  import Card from './Card.svelte';

  let { cards = $bindable(), animateIn = !$debug, selectCard, addCard }: Props = $props();

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

  let newClassCounter = 0;
  const addNewCard = () => {
    const card = withId({
      name: 'NewClass' + newClassCounter++,
      responsibilities: [],
    });
    addCard?.(card);
    selectCard?.(card);
  };
</script>

<div id="backdrop">
  <ul class="min-h-full grid p-1 gap-2 grid-cols-{columns}" bind:clientWidth={width}>
    {#each cards as { id, ...cardProps } (id)}
      {@const surface = cardProps.name === $highlightedClass}
      <li class:surface animate:flip={{ duration: 400 }}>
        {#if !animateIn}
          <Card locked selectName={propagate} {...cardProps} />
        {/if}
      </li>
    {/each}
    <li>
      <div
        onfocus={addNewCard}
        class="h-full btn btn-ghost tw-grow card dark:card-bordered shadow-xl"
        role="gridcell"
        tabindex=0
        >
        <div class="card-body">
          <div class="btn btn-circle btn-primary btn-outline my-auto"> + </div>
        </div>
      </div>
    </li>
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
