<script module lang="ts">
  export type EditorActions = {
    proposeCommit(card: SimpleCard, message: string): void;
    renameCard(card: SimpleCard, newName: string): void;
    deleteCard(card: SimpleCard): void;
    close(): void;
  };
  export type Props = Partial<EditorActions> & {
    card: SimpleCard;
    readyForCommit: boolean;
  };
</script>
<script lang="ts">
  import { clickOutside } from '$lib/actions';
  import { aiEnabled, availableClasses } from '$lib/stores';
  import type { SimpleCard, Card } from '$lib/types';
  import { fade } from 'svelte/transition';
  import CardComponent from './card/Card.svelte';
  import CollabPicker, { createPropsFromLens, type RespLens } from './CollabPicker.svelte';
  import { withId } from '$lib/decks';

  let {
    card = $bindable(),
    readyForCommit = $bindable(false),
    proposeCommit,
    renameCard,
    close,
    deleteCard,
  }: Props = $props();

  const lastChange = $derived.by(() => {
    card;
    renaming;
    return Date.now();
  });

  let messageBox: HTMLInputElement | undefined = $state();
  let message: string = $state('');
  const validSymbolName = $derived(
    !/\b\d|\s|\W/.test(message) && !$availableClasses.includes(message)
  );

  let renaming = $state(false);

  const startRename = (clickedName: string) => {
    console.log(clickedName);
    if (!renameCard) return;
    if (clickedName !== card.name) return;
    renaming = true;
    message = card.name;
    setTimeout(() => messageBox?.focus(), 100);
  };

  /** cancel renaming without saving new name */
  const cancelRename = () => {
    renaming = false;
    message = '';
  };

  /** end renaming and save, propagting */
  const completeRename = () => {
    const newName = message;
    cancelRename();
    if (newName) {
      renameCard?.(card, newName);
    } else {
      finishDelete();
    }
  };

  const finishDelete = () => {
    if (confirm(`Delete the '${card.name}' card?`)) deleteCard?.(card);
  };

  let showAddRespButton: boolean = $derived(
    !card.responsibilities.length ||
      card.responsibilities[card.responsibilities.length - 1].description !== '...'
  );
  const addResp = () => {
    card.responsibilities.push(
      withId({
        description: '...',
        collaborators: []
      })
    );
  };

  let editCollabLens: RespLens<Card> | undefined = $state();
  const selectCollab = (_cardName: string, respIdx: number, _collab: string) => {
    editCollabLens = { card, respIdx };
  };
  const setCollabs = (
    { card, respIdx }: RespLens<Card>,
    collabs: Card['responsibilities'][number]['collaborators']
  ) => {
    card.responsibilities[respIdx].collaborators = collabs;
    editCollabLens = undefined;
  };
</script>

<div
  use:clickOutside={() => {
    if (card && Date.now() - lastChange > 200) close?.();
  }}
  class="relative size-full max-h-full z-50 py-4 flex flex-col bg-base-100 shadow-xl"
>
  <!-- header -->
  <div class="flex-none flex max-h-fit shadow-md rounded-b-3xl mb-2">
    <h2 class="text-lg font-mono text-neutral mx-auto my-auto p-2 pointer-events-none">
      {'「 editor 」'}
    </h2>
    <!-- "X" button in top right -->
    <button
      class="btn btn-sm btn-circle btn-outline outline-neutral mx-2 my-auto"
      onclick={() => close?.()}
      aria-label="Select Theme"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
    <!-- -->
  </div>
  <!--  -->

  <!-- The Card area -->
  <div class="flex-grow flex flex-col p-2 overflow-auto">
    <div class="m-auto w-4/5">
      <CardComponent
        selectName={startRename}
        {selectCollab}
        addResp={showAddRespButton ? addResp : undefined}
        {...card}
      />
    </div>
  </div>
  <!-- -->

  <!-- The "propose" area -->
  {#if $aiEnabled || renaming}
    <form
      class="propose-form flex-grow flex justify-center w-5/6 mx-auto join"
      transition:fade={{ duration: 250 }}
      use:clickOutside={() => {
        if (renaming && Date.now() - lastChange > 200) {
          renaming = false;
          message = '';
        }
      }}
    >
      <input
        class:rename={renaming}
        class="message-box input input-bordered w-3/4 border-r-0 join-item"
        type="text"
        bind:this={messageBox}
        bind:value={message}
        onkeydown={(e) => {
          if (e.key === 'Escape') cancelRename();
        }}
      />
      {#if renaming}
        <input
          class:btn-error={!message}
          class="rename submit-button btn btn-outline w-1/4 join-item"
          type="submit"
          value={message ? 'rename' : 'delete'}
          disabled={Boolean(message) && !validSymbolName}
          onclick={completeRename}
        />
      {:else if readyForCommit}
        <input
          class="submit-button btn btn-outline w-1/4 join-item"
          type="submit"
          value="propose"
          onclick={() => proposeCommit?.(card, message)}
        />
      {:else}
        <div class="btn btn-disabled btn-outline loading loading-ring loading-lg mb-auto"></div>
      {/if}
    </form>
  {/if}
  <!-- -->

  {#if editCollabLens}
    <CollabPicker {...createPropsFromLens(editCollabLens, setCollabs)} />
  {/if}
</div>

<style lang="postcss">
  input.rename {
    @apply border-primary transition-all;
    &.submit-button:enabled {
      @apply bg-primary text-primary-content;
    }
    &.message-box {
      @apply outline-none text-base-content;
      font-family: var(--font-mono);
    }
  }
</style>
