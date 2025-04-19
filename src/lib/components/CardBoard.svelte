<script module lang="ts">
  import type { Deck, DiffText, Keyed, SimpleDeck } from '$lib/types';

  export interface Props {
    cards: Deck;
    allowEditing?: boolean;
    selectCard?: (c: Deck[number]) => void;
    addCard?: (c: SimpleDeck[number]) => void;
  }
</script>

<script lang="ts">
  import { flip } from 'svelte/animate';
  import CollabPicker, { createPropsFromLens, type RespLens } from './CollabPicker.svelte';
  import Card from './Card.svelte';
  import { withId } from '$lib/decks';
  import { highlightedClass } from '$lib/stores';
  import { clamp } from '$lib/common';
  import { fade } from 'svelte/transition';
  import ClassLabel from './ClassLabel.svelte';

  let {
    cards = $bindable(),
    allowEditing,
    selectCard,
    addCard
  }: Props = $props();

  let width: number = $state(0);

  const columns = $derived(Math.max(1, Math.round(width / 400 - 0.6)));
  const colWidth = $derived(columns && width / columns);

  const previewCard = $derived(cards.find((c) => c.name === $highlightedClass));
  let height: number = $state(0),
    previewY: number = $state(0),
    previewCardHeight: number = $state(0),
    previewColumn: number = $state(0);

  const updatePreview = (e: MouseEvent, columnWidth: number) => {
    const mouseCol = Math.floor(e.pageX / columnWidth);
    previewColumn = clamp(0, mouseCol === columns - 1 ? columns - 2 : mouseCol + 1, columns - 1);
    previewY = clamp(0, e.pageY - 100, height - previewCardHeight + 100);
  };

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
      responsibilities: []
    });
    addCard?.(card);
    selectCard?.(card);
  };

  let editCollabLens: RespLens<Deck[number]> | undefined = $state();
  const selectCollab = (cardName: string, respIdx: number, collab: string) => {
    if (allowEditing) {
      const card = cards.find((c) => c.name === cardName);
      if (card) {
        editCollabLens = { card, respIdx };
        return;
      }
    }
    return propagate(collab);
  };
  const setCollabs = (
    { card, respIdx }: RespLens<Deck[number]>,
    collabs: Keyed<{ name: DiffText }>[]
  ) => {
    card.responsibilities[respIdx].collaborators = collabs;
    editCollabLens = undefined;
  };
</script>

<svelte:window onmousemove={(e) => updatePreview(e, colWidth)} />

<!-- highlighted card preview -->
{#if previewCard}
  <ul
    class="absolute pointer-events-none z-10 card-grid grid-cols-{columns}"
    style="top: {previewY}px"
    transition:fade={{ duration: 150 }}
  >
    {#each [...new Array(previewColumn)] as _}
      <li class="invisble"></li>
    {/each}
    <li bind:clientHeight={previewCardHeight}>
      <Card locked {...previewCard} />
    </li>
  </ul>
{/if}

<!-- card display -->
<div id="backdrop" bind:clientWidth={width} bind:clientHeight={height}>
  <ul class="min-h-full card-grid grid-cols-{columns}">
    <!-- card listing -->
    {#each cards as { id, ...cardProps } (id)}
      <li animate:flip={{ duration: 600 }}>
        <Card
          hidden={cardProps.name === $highlightedClass}
          locked={!allowEditing}
          selectName={propagate}
          selectBody={propagate}
          {selectCollab}
          {...cardProps}
        />
      </li>
    {/each}

    <!-- add-new-card button -->
    <li>
      <div
        onfocus={addNewCard}
        class="h-full btn btn-ghost tw-grow card dark:card-bordered shadow-xl"
        role="gridcell"
        aria-label="add new card button"
        tabindex="0"
      >
        <div class="card-body">
          <div class="max-h-8 h-full my-auto">
            <ClassLabel name="[+ add card +]" />
          </div>
        </div>
      </div>
    </li>
  </ul>
  {#if editCollabLens}
    <CollabPicker {...createPropsFromLens(editCollabLens, setCollabs)} />
  {/if}
</div>

<style lang="postcss">
  #backdrop {
    @apply relative top-0 left-0 bg-base-100 max-h-full overflow-scroll snap-y;
  }

  .card-grid {
    @apply min-w-full overflow-visible grid gap-2 px-1;
  }

  .shift {
    @apply bg-primary;
  }

  li {
    @apply relative snap-start z-[1];
  }
</style>
