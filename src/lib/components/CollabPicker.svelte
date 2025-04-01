<script module lang="ts">
  import type { Keyed, Card, DiffText } from '$lib/types';
  import { undiffWords } from '$lib/diff';
  import { mergeKeyed } from '$lib/common';
  import { withId } from '$lib/decks';

  export type RespLens<C extends Card<S>, S = DiffText> = {
    card: C;
    respIdx: number;
  };

  export type Props = {
    collabs: string[];
    avoiding: string[];
    setCollabs?: (collabs: string[]) => void;
  };

  export const createPropsFromLens = (
    { card, respIdx }: RespLens<Keyed<Card>>,
    setCollabs?: (
      lens: RespLens<Keyed<Card>>,
      collabs: Card['responsibilities'][number]['collaborators']
    ) => void
  ): Props => ({
    collabs: card.responsibilities[respIdx]?.collaborators.map((c) => undiffWords(c.name)),
    avoiding: [undiffWords(card.name)],
    setCollabs: (collabs: string[]) => {
      const resp = card.responsibilities[respIdx];
      if (!resp) return;
      // merge the collaborators, prefering the old (id'ed) versions when they exist,
      // otherwise creating new ids for the new custom collabs
      const newKeyedCollabs = mergeKeyed(
        resp.collaborators,
        collabs.map((name) => ({ name })),
        (x) => undiffWords(x.name)
      ).flatMap((z) =>
        z.type === 'right' ? [withId(z.right)] : z.type === 'both' ? [z.left] : []
      );
      setCollabs?.({ card, respIdx }, newKeyedCollabs);
    }
  });
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import { flip } from 'svelte/animate';
  import ClassLabel from './ClassLabel.svelte';
  import { allClasses } from '$lib/stores';

  // bindable breaks here, don't know why...
  let { collabs, avoiding = [], setCollabs }: Props = $props();

  let searchbar: HTMLInputElement;
  let search: string = $state('');

  const sortedByBool = <T,>(tagged: T[], b: (_: T) => boolean): T[] => {
    const [ts, fs]: T[][] = [[], []];
    for (const t of tagged) {
      (b(t) ? ts : fs).push(t);
    }
    return ts.concat(fs);
  };

  let options: Keyed<{ value: string | null }>[] = $derived.by(() => {
    const cs = new Set($allClasses).difference(new Set(avoiding)).union(new Set(collabs));
    const tagged = [...cs].map((value, id) => ({ value, id }));
    tagged.sort((a, b) => a.value.localeCompare(b.value));
    const sorted = sortedByBool(tagged, (t) => collabs.includes(t.value));
    const sep = { value: null, id: -10 };
    if (!search) return [...sorted, sep];

    const isSearchMatch = (v: { value: string }) =>
      v.value.toLowerCase().includes(search.trim().toLowerCase());
    const searched = sortedByBool(sorted, isSearchMatch);
    const newUnknownCollab = !$allClasses.find((c) => c.toLowerCase() === search.toLowerCase());
    (searched as typeof options).splice(
      searched.findIndex((t) => !isSearchMatch(t)),
      0,
      ...(newUnknownCollab ? [{ value: search, id: -1 }, sep] : [sep])
    );
    return searched;
  });

  const onsearchkeyup = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (search) {
        search = '';
      } else {
        setCollabs?.(collabs);
      }
      return;
    }
    if (e.key !== 'Enter') return;
    const c = options.find((t) => t.value)?.value;
    if (!c) return;
    // using proper methods breaks it here... why!??
    if (collabs.includes(c)) {
      collabs = collabs.filter((x) => x !== c);
    } else {
      collabs = [...collabs, c];
    }
    search = '';
  };

  onMount(() => searchbar.focus());
</script>

<dialog class="modal modal-open max-h-full max-w-full" onfocus={() => searchbar?.focus()}>
  <div class="modal-box max-h-3/4 static">
    <div class="form-control max-h-full static">
      <label class="input static flex items-center">
        <input
          id="searchbar"
          bind:this={searchbar}
          bind:value={search}
          class="border-b-2 grow placeholder:italic"
          type="text"
          placeholder="[↵] to toggle, [esc] to clear..."
          onkeyup={onsearchkeyup}
          oninput={() => (search = search.replaceAll(/\s/g, ''))}
        />
      </label>
      <ul class="overflow-scroll">
        {#each options as { value: opt, id }, idx (id)}
          {@const firstItem = !idx}
          <li animate:flip={{ duration: 400 }} class="list-none">
            {#if opt}
              {@const forId = 'collab-' + opt}
              <label for={forId} class="label cursor-pointer px-4" class:search-select={firstItem}>
                <input
                  id={forId}
                  class="checkbox checkbox-primary checkbox-xs"
                  type="checkbox"
                  name="collabs"
                  value={opt}
                  bind:group={collabs}
                  onclick={() => searchbar.focus()}
                />
                <span>
                  <span class="label-text"><ClassLabel name={opt} /></span>
                  {#if firstItem}&nbsp;<kbd class="kbd kbd-xs">↵</kbd>{/if}
                </span>
              </label>
            {:else}
              <hr class="border-primary m-2" />
            {/if}
          </li>
        {/each}
      </ul>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button onclick={() => setCollabs?.(collabs)}>close</button>
  </form>
</dialog>

<style lang="postcss">
  label:hover,
  .search-select {
    & .label-text {
      @apply underline italic decoration-primary;
    }
  }
  #searchbar {
    font-family: var(--font-mono);
  }
</style>
