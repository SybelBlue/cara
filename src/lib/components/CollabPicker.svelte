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
    l: RespLens<Keyed<Card>>,
    setCollabs?: (
      lens: RespLens<Keyed<Card>>,
      collabs: Card['responsibilities'][number]['collaborators']
    ) => void
  ): Props => ({
    collabs:
      l.card.responsibilities[l.respIdx]?.collaborators.map((c) => undiffWords(c.name)) ?? [],
    avoiding: [undiffWords(l.card.name)],
    setCollabs: (collabs: string[]) => {
      const resp = l.card.responsibilities[l.respIdx];
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
      setCollabs?.(l, newKeyedCollabs);
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

  let arrowKeyIdx: number = $state(0);
  const filteredOptions = $derived(options.filter((t) => t.value));
  const keyHovered = $derived(filteredOptions[arrowKeyIdx]);

  const setArrowKeyIdx = (n: typeof arrowKeyIdx) =>
    (arrowKeyIdx = (n + filteredOptions.length) % filteredOptions.length);
  $effect(() => {
    options;
    search;
    setArrowKeyIdx(0);
  });

  const onsearchkeydown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        if (search) {
          search = '';
        } else {
          setCollabs?.(collabs);
        }
        return;
      case 'ArrowUp':
        e.preventDefault();
        setArrowKeyIdx(arrowKeyIdx - 1);
        return;
      case 'ArrowDown':
        e.preventDefault();
        setArrowKeyIdx(arrowKeyIdx + 1);
        return;
      case 'Enter':
        const c = keyHovered?.value;
        if (!c) return;
        // using proper methods breaks it here... why!??
        if (collabs.includes(c)) {
          collabs = collabs.filter((x) => x !== c);
        } else {
          collabs = [...collabs, c];
        }
        search = '';
        return;
    }
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
          onkeydown={onsearchkeydown}
          oninput={() => (search = search.replaceAll(/\s/g, ''))}
        />
      </label>
      <ul class="overflow-scroll">
        {#each options as { value: opt, id } (id)}
          {@const searchSelect = keyHovered?.id === id}
          <li animate:flip={{ duration: 400 }} class="list-none" class:search-select={searchSelect}>
            {#if opt}
              {@const forId = 'collab-' + opt}
              <label
                for={forId}
                class="label cursor-pointer px-4"
                class:search-select={searchSelect}
              >
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
                  {#if searchSelect}&nbsp;<kbd class="kbd kbd-xs">↵</kbd>{/if}
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
