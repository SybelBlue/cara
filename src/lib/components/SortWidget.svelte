<script module lang="ts">
  import type { Deck } from '$lib/types';

  export type SortFn = (a: Deck[number], b: Deck[number]) => number;
  export type Props = {
    currentDeck: Deck;
    setSortFn?: (f?: SortFn) => void;
  }
</script>
<script lang="ts">
  import { undiffWords } from '$lib/diff';

  let {
    currentDeck, setSortFn
  }: Props = $props();

  type Sorter = 'alpha' | 'usage';

  let reversed = $state(false);
  let sorter: undefined | Sorter = $state();
  const usageDict: Record<string, number> = $derived.by(() => {
    const out: Record<string, number> = {};
    for (const c of currentDeck)
      for (const r of c.responsibilities)
        for (const l of r.collaborators)
          out[undiffWords(l.name)] = (out[undiffWords(l.name)] ?? 0) + 1;
    return out;
  });
  const sortFns: Record<Sorter, SortFn> = {
    alpha: (x, y) => (reversed ? -1 : +1) * undiffWords(x.name).localeCompare(undiffWords(y.name)),
    usage: (x, y) =>
      (reversed ? -1 : +1) * usageDict[undiffWords(y.name)] - usageDict[undiffWords(x.name)]
  };
  const ordering = $derived(currentDeck.map(c => c.id));
  const defaultSorter: SortFn | undefined = $derived(
    reversed ? (a, b) => -(ordering.indexOf(a.id) - ordering.indexOf(b.id)) : undefined
  );

  $effect(() => { setSortFn?.(sorter ? sortFns[sorter] : defaultSorter) });
</script>

<div class="join rounded-3xl my-auto">
  <button
    class:reversed
    class="join-item btn btn-sm"
    aria-label="reverse"
    onclick={() => (reversed = !reversed)}
  >
    <svg
      class:reversed
      class="h-5 w-5 fill-base-content transition rotate-0"
      viewBox="0 0 85.208 122.882"
    >
      <path fill-rule="evenodd" clip-rule="evenodd" d="M57.121,122.882l28.087-29.215L67.13,93.665V67.004v-0.506V41.932H47.111V66.5 l0,0v27.165l-18.081,0.002L57.121,122.882L57.121,122.882z M28.09,0l28.086,29.215l-18.078,0.002v26.661v0.505V80.95H18.08V56.382 l0,0V29.217L0,29.215L28.09,0L28.09,0z" />
    </svg>
  </button>

  {#each Object.keys(sortFns) as Sorter[] as label}
    {@const checked = sorter === label}
    <input
      class:checked
      class:reversed
      class="join-item btn btn-sm"
      type="radio"
      name="sortOptions"
      aria-label={label}
      onclick={() => {
        if (checked) {
          sorter = (reversed = !reversed) ? sorter : undefined;
        } else {
          sorter = label;
          reversed = false;
        }
      }}
      {checked}
    />
  {/each}
</div>

<style lang="postcss">
  input.reversed.checked {
    @apply bg-secondary border-secondary text-secondary-content;
  }
  button.reversed {
    @apply bg-secondary border-secondary;
  }
  svg.reversed {
    @apply rotate-180 fill-accent-content;
  }
</style>
