<script lang="ts">
  import type { SimpleCard } from '$lib/types';
  import { deckWithIds } from '$lib/decks';
  import { exampleDecks } from '$lib/decks';
  import { aiEnabled } from '$lib/stores';
  import { submissionToDeck } from '$lib/serde';
  import { fade } from 'svelte/transition';

  type Props = {
    loadDeck(deck: SimpleCard[], name?: string): void;
  };

  let loading: boolean = $state(false);
  let description: string = $state('');
  let deckName: undefined | keyof typeof exampleDecks = $state();
  const schema = 'Deck';

  let { loadDeck }: Props = $props();

  let activePromise: Promise<SimpleCard[]> | undefined = $state();
</script>

{#snippet divider()}
  <div class="divider italic">or</div>
{/snippet}

<div class="w-1/2 h-full grid grid-cols-1 mx-auto gap-4 p-4">
  <div class="card">
    <div class="card-body">
      <div class="card-title">load a premade deck</div>
      <div class="mx-auto join join-horizontal">
        <select
          name="deckSelector"
          class="select select-bordered join-item ml-auto"
          bind:value={deckName}
        >
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
            if (deckName) loadDeck(exampleDecks[deckName], deckName);
          }}
        />
      </div>
    </div>
  </div>
  {@render divider()}
  <div class="card">
    <div class="card-body flex flex-col">
      <div class="card-title">load deck from clipboard</div>
      <textarea
        class="grow w-4/5 mx-auto my-4 font-mono text-sm size-full max-h-[40vh]"
        value=""
        placeholder="paste your solution here..."
        onfocus={(e) => (e.currentTarget.value = '')}
        oninput={(e) => {
          if (!e.currentTarget.value) return;
          activePromise = submissionToDeck(e.currentTarget.value);
        }}
      ></textarea>
      {#if activePromise}
        <hr />
        <div transition:fade>
          {#await activePromise}
            <span class="loading loading-dots loading-xs"></span>
          {:then cards}
            <button class="btn btn-block btn-primary" onclick={() => loadDeck(cards, 'custom')}>
              load {cards.length} cards
            </button>
          {:catch error}
            <details class="collapse font-sans">
              <summary
                class="collapse-title text-center text-md decoration-accent italic underline"
              >
                loading failed!
              </summary>
              <div class="collapse-content">
                <p class="font-mono text-xs">
                  {error.toString()}
                </p>
              </div>
            </details>
          {/await}
        </div>
      {/if}
    </div>
  </div>
  {#if $aiEnabled}
    {@render divider()}
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
  {/if}
</div>

<style lang="postcss">
  .card {
    @apply dark:card-bordered shadow-xl bg-base-100;
  }
  .card-title {
    @apply italic text-lg decoration-primary underline;
  }
</style>
