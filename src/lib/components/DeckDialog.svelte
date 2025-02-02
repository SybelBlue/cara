<script lang="ts">
  import type { SimpleDeck } from '$lib/types';
  import { deckWithIds } from '$lib/decks';
  import { exampleDecks } from '$lib/decks';

  type Props = {
    loadDeck: (deck: SimpleDeck) => void;
  };

  let loading: boolean = $state(false);
  let description: string = $state('');
  let deckName: undefined | keyof typeof exampleDecks = $state();
  const schema = 'Deck';

  let { loadDeck }: Props = $props();
</script>

<div class="w-1/2 h-full grid grid-cols-1 mx-auto gap-4">
  <div class="card">
    <div class="card-body">
      <div class="card-title"> load a premade deck </div>
      <div class="mx-auto join join-horizontal">
        <select name="deckSelector" class="select select-bordered join-item ml-auto" bind:value={deckName}>
          <option disabled>Select a deck</option>
          {#each Object.keys(exampleDecks) as name}
            <option>{name}</option>
          {/each}
        </select>
        <input
          type="submit"
          value="load"
          class="btn input-bordered join-item"
          aria-label="load this deck"
          disabled={!deckName}
          onclick={() => {
            if (deckName) loadDeck(exampleDecks[deckName]);
          }}
        />
      </div>
    </div>
  </div>
  <div class="divider italic">or</div>
  <div class="card">
    <div class="card-body">
      <div class="card-title">generate deck from description</div>
      <div class="w-2/3 mx-auto">
        <textarea
          bind:value={description}
          name="userDescription"
          id="descriptionInput"
          class="w-full input input-bordered my-2 h-auto"
        ></textarea>
        <div class="flex justify-center ml-auto w-1/3">
          {#if loading}
            <div class="loading loading-ring loading-lg"></div>
          {:else}
            <input
              type="submit"
              value="generate"
              class="btn w-full"
              onclick={async () => {
                loading = true;
                const response = await fetch('/api/object', {
                  method: 'POST',
                  body: JSON.stringify({ description, schema })
                });
                const { response: deck } = await response.json();
                console.log(deck);
                loadDeck(deckWithIds(deck));
              }}
            />
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>

<style lang="postcss">
  .card {
    @apply dark:card-bordered shadow-xl bg-base-100;
  }
  .card-title {
    @apply italic text-lg decoration-primary underline;
  }
</style>