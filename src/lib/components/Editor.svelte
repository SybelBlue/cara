<script lang="ts">
  import { clickOutside } from '$lib/actions';
  import { aiEnabled, availableClasses } from '$lib/stores';
  import type { DiffText, Keyed, SimpleCard, Card as CardT } from '$lib/types';
  import { fade } from 'svelte/transition';
  import Card from './Card.svelte';
  import CollabPicker, { createPropsFromLens, type RespLens } from './CollabPicker.svelte';
  import { withId } from '$lib/decks';

  interface Props {
    card: Keyed<SimpleCard>;
    readyForCommit: boolean;
    propose?: (card: SimpleCard, message: string) => void;
    rename?: (card: SimpleCard, newName: string) => void;
    delete?: (card: Keyed<SimpleCard>) => void;
    close?: () => void;
  }

  let {
    readyForCommit = $bindable(false),
    card,
    propose,
    rename,
    close,
    delete: onDelete
  }: Props = $props();

  let lastChange = $derived.by(() => {
    card && renameMode;
    return Date.now();
  });

  let messageBox: HTMLInputElement | undefined = $state();
  let message: string = $state('');
  let validSymbolName = $derived(!message.includes(' ') && !$availableClasses.includes(message));

  let renameMode = $state(false);

  const startRename = (clickedName: string) => {
    console.log(clickedName);
    if (!rename) return;
    if (clickedName !== card.name) return;
    renameMode = true;
    message = card.name;
    setTimeout(() => messageBox?.focus(), 100);
  };

  const finishRename = () => {
    const newName = message;
    renameMode = false;
    message = '';
    if (newName) {
      rename?.(card, newName);
    } else {
      finishDelete();
    }
  };

  const finishDelete = () => {
    if (confirm(`Delete the '${card.name}' card?`)) onDelete?.(card);
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

  let editCollabLens: RespLens<CardT> | undefined = $state();
  const selectCollab = (_cardName: string, respIdx: number, _collab: string) => {
    editCollabLens = { card, respIdx };
  };
  const setCollabs = (
    { card, respIdx }: RespLens<CardT>,
    collabs: Keyed<{ name: DiffText }>[]
  ) => {
    card.responsibilities[respIdx].collaborators = collabs;
    editCollabLens = undefined;
  };
</script>

<div
  use:clickOutside={() => {
    if (card && Date.now() - lastChange > 200) close?.();
  }}
  class="relative min-h-full w-full z-50 bg-base-100 grid grid-cols-1 shadow-xl"
>
  <!-- header -->
  <div>
    <div class="flex max-h-fit">
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
  </div>
  <!--  -->

  <!-- The Card area -->
  <div class="flex-col mx-auto w-4/5">
    <Card
      selectName={startRename}
      {selectCollab}
      addResp={showAddRespButton ? addResp : undefined}
      {...card}
    />
  </div>
  <!-- -->

  <!-- The "propose" area -->
  {#if $aiEnabled || renameMode}
    <form
      class="propose-form flex justify-center w-5/6 mx-auto join"
      transition:fade
      use:clickOutside={() => {
        if (renameMode && Date.now() - lastChange > 200) {
          renameMode = false;
          message = '';
        }
      }}
    >
      <input
        class:rename={renameMode}
        class="message-box input input-bordered w-3/4 border-r-0 join-item"
        type="text"
        bind:this={messageBox}
        bind:value={message}
      />
      {#if readyForCommit}
        <input
          class:rename={renameMode}
          class:btn-error={renameMode && !message}
          class="submit-button btn btn-outline w-1/4 join-item"
          type="submit"
          value={renameMode ? (message ? 'rename' : 'delete') : 'propose'}
          disabled={renameMode && !validSymbolName && Boolean(message)}
          id="submitBtn"
          onclick={(e) => {
            if (!card) {
              console.error('Tried to commit undefined card!');
              return;
            }
            if (renameMode) {
              finishRename();
            } else {
              propose?.(card, message);
            }
          }}
        />
      {:else}
        <div class="btn btn-disabled btn-outline loading loading-ring loading-lg mb-auto"></div>
      {/if}
    </form>
  {/if}
  <!-- -->

  {#if !renameMode}
    <div class="flex justify-center w-2/3 max-w-fill mx-auto gap-2">
      <button class="btn btn-outline btn-primary" onclick={finishDelete}> delete </button>
    </div>
  {/if}

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
