<script lang="ts">
  import { clickOutside } from '$lib/actions';
  import type { SimpleCard } from '$lib/types';
  import Card from './Card.svelte';

  interface Props {
    card: SimpleCard;
    readyForCommit: boolean;
    freeEditing?: boolean;
    propose?: (card: SimpleCard, message: string) => void;
    close?: () => void;
  }

  let { readyForCommit = $bindable(false), freeEditing, card, propose, close }: Props = $props();

  let lastChange = $derived.by(() => {
    card;
    return Date.now();
  });

  let message: string = $state('');
</script>

<div
  use:clickOutside={() => {
    if (card && Date.now() - lastChange > 200) close?.();
  }}
  class="relative min-h-full w-full z-50 bg-base-100 grid grid-cols-1 shadow-xl"
>
  <!-- "X" button in top right -->
  <button
    class="btn btn-circle btn-outline ml-auto mr-2 mt-2"
    onclick={() => close?.()}
    aria-label="Select Theme"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-6 w-6"
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

  <!-- The Card area -->
  <div class="mx-auto w-4/5">
    <Card {...card} />
  </div>
  <!-- -->

  <!-- The "propose" area -->
  <div class="flex justify-center w-5/6 mx-auto">
    <input
      class="input input-bordered mr-2 w-3/4"
      type="text"
      name="commitMessage"
      id="commitMessageInput"
      bind:value={message}
    />
    {#if readyForCommit}
      <input
        class="btn btn-outline min-w-fit w-1/4"
        type="submit"
        value={freeEditing ? "commit" : "propose"}
        id="submitBtn"
        onclick={() => {
          if (card) {
            propose?.(card, message);
          } else {
            console.error('Tried to commit undefined card!');
          }
        }}
      />
    {:else}
      <div class="loading loading-ring loading-lg mb-auto"></div>
    {/if}
  </div>
  <!-- -->
</div>
