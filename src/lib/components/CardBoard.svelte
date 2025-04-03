<script module lang="ts">
  import type { Deck, DiffText, Keyed, SimpleDeck } from '$lib/types';

  export interface Props {
    cards: Deck;
    animateIn?: boolean;
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
  import { debug, highlightedClass } from '$lib/stores';

  let {
    cards = $bindable(),
    animateIn = !$debug,
    allowEditing,
    selectCard,
    addCard
  }: Props = $props();

  if (animateIn) setTimeout(() => (animateIn = false), 200);

  let width: number = $state(0),
    boardMouseY: number = $state(0);
  let mouseInFirstCol: boolean = $state(false);
  let lastMouseEvent: MouseEvent | undefined = $state();

  const columns = $derived(Math.max(1, Math.round(width / 400 - 0.6)));
  const colWidth = $derived(columns && width / columns);

  const updatePreview = (e: MouseEvent, columnWidth: number) => {
    mouseInFirstCol = e.pageX < columnWidth;
    boardMouseY = e.pageY;
    $inspect({ boardMouseY, mouseInFirstCol });
  };

  $effect(() => lastMouseEvent && updatePreview(lastMouseEvent, colWidth));

  const previewCard = $derived(cards.find((c) => c.name === $highlightedClass));

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

<svelte:window onmousemove={(e) => (lastMouseEvent = e)}/>

{#if previewCard}
  <div
    id="preview"
    class="absolute pointer-events-none z-10 card-grid grid-cols-{columns}"
    style="top: {boardMouseY}px"
  >
    {#if mouseInFirstCol && columns > 1}
      <li class="invisble"></li>
    {/if}
    <li class="surface">
      <Card locked {...previewCard} />
    </li>
  </div>
{/if}

<div id="backdrop">
  <ul class="min-h-full card-grid grid-cols-{columns}" bind:clientWidth={width}>
    {#each cards as { id, ...cardProps } (id)}
      <li animate:flip={{ duration: 400 }}>
        {#if !animateIn}
          <Card locked={!allowEditing} selectName={propagate} {selectCollab} {...cardProps} />
        {/if}
      </li>
    {/each}
    <li>
      <div
        onfocus={addNewCard}
        class="h-full btn btn-ghost tw-grow card dark:card-bordered shadow-xl"
        role="gridcell"
        tabindex="0"
      >
        <div class="card-body">
          <div class="btn btn-circle btn-primary btn-outline my-auto">+</div>
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
