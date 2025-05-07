<script module lang="ts">
  import type { DiffText, Keyed, SimpleCard, Card as FullCard } from '$lib/types';

  export type CardBoardActions = {
    selectCard(c: FullCard): void;
    addCard(c: SimpleCard): void;
  };

  export type Props = Partial<CardBoardActions> & {
    cards: FullCard[];
    locked?: boolean;
  };
</script>

<script lang="ts">
  import { flip } from 'svelte/animate';
  import CollabPicker, { createPropsFromLens, type RespLens } from './CollabPicker.svelte';
  import CardComponent from './card/Card.svelte';
  import { withId } from '$lib/decks';
  import { highlightedClass } from '$lib/stores';
  import { clamp } from '$lib/common';
  import { fade } from 'svelte/transition';

  let { cards = $bindable(), locked, selectCard, addCard }: Props = $props();

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
      responsibilities: [ withId({ description: '...', collaborators: [] })]
    });
    addCard?.(card);
  };

  let editCollabLens: RespLens<FullCard> | undefined = $state();
  const selectCollab = (cardName: string, respIdx: number, collab: string) => {
    if (locked) return propagate(collab);
    const card = cards.find((c) => c.name === cardName);
    if (card) {
      editCollabLens = { card, respIdx };
    }
  };
  const setCollabs = (
    { card, respIdx }: RespLens<FullCard>,
    collabs: Keyed<{ name: DiffText }>[]
  ) => {
    card.responsibilities[respIdx].collaborators = collabs;
    editCollabLens = undefined;
  };
</script>

<svelte:window onmousemove={(e) => updatePreview(e, colWidth)} />

<!-- highlighted card preview: usually invisible, never in layout -->
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
      <CardComponent locked {...previewCard} />
    </li>
  </ul>
{/if}
<!--  -->

<div id="backdrop" bind:clientWidth={width} bind:clientHeight={height}>
  <!-- card grid -->
  <ul class="min-h-full pb-2 card-grid grid-cols-{columns}">
    <!-- card listing -->
    {#each cards as { id, ...cardProps } (id)}
      <li animate:flip={{ duration: 600 }}>
        <CardComponent
          {locked}
          hidden={cardProps.name === $highlightedClass}
          selectName={propagate}
          selectBody={propagate}
          {selectCollab}
          {...cardProps}
        />
      </li>
    {/each}
    <!--  -->

    <!-- add-new-card button -->
    <li>
      <div
        onfocus={addNewCard}
        class="h-full btn btn-ghost tw-grow card max-h-[25vh] hover:text-accent dark:card-bordered shadow-xl"
        role="gridcell"
        aria-label="add new card button"
        tabindex="0"
      >
        <div class="card-body">
          <div class="max-h-8 h-full my-auto">
            <span class="font-mono">[+ add card +]</span>
          </div>
        </div>
      </div>
    </li>
    <!--  -->
  </ul>
  <!--  -->

  <!-- collab picker modal: usually invisible, never in layout -->
  {#if editCollabLens}
    <CollabPicker {...createPropsFromLens(editCollabLens, setCollabs)} />
  {/if}
  <!--  -->
</div>

<style lang="postcss">
  #backdrop {
    @apply relative top-0 left-0 bg-base-100 h-full max-h-full overflow-scroll snap-y;
  }

  .card-grid {
    @apply min-w-full overflow-visible grid gap-2 px-1;
  }

  li {
    @apply relative snap-start z-[1];
  }
</style>
