<script lang="ts">
  import { allClasses } from '$lib/stores';
  import { flip } from 'svelte/animate';
  import ClassLabel from './ClassLabel.svelte';
  import type { Keyed } from '$lib/types';

  let { collabs = $bindable() }: { collabs: string[] } = $props();

  let search: string = $state('');

  const sortedByBool = <T,>(tagged: T[], b: (_: T) => boolean): T[] => {
    const [ts, fs]: T[][] = [[], []];
    for (const t of tagged) {
      (b(t) ? ts : fs).push(t);
    }
    return ts.concat(fs);
  };

  let options: Keyed<{ value: string | null }>[] = $derived.by(() => {
    const cs = new Set([...$allClasses, ...collabs]);
    const tagged = [...cs].map((value, id) => ({ value, id }));
    tagged.sort((a, b) => a.value.localeCompare(b.value));
    const sorted = sortedByBool(tagged, (t) => collabs.includes(t.value));
    const sep = { value: null, id: -10 };
    if (!search) return [...sorted, sep];

    const isSearchMatch = (v: { value: string }) =>
      v.value.toLowerCase().includes(search.trim().toLowerCase());
    const searched = sortedByBool(sorted, isSearchMatch);
    const newUnknownCollab = !$allClasses.find(
      (c) => c.toLowerCase() === search.toLowerCase()
    );
    (searched as typeof options).splice(
      searched.findIndex((t) => !isSearchMatch(t)),
      0,
      ...(newUnknownCollab ? [{ value: search, id: -1 }, sep] : [sep])
    );
    return searched;
  });
</script>

<div class="form-control">
  <label class="input flex items-center join">
    <input
      class="join-item grow placeholder:italic"
      type="text"
      placeholder="search collabs..."
      bind:value={search}
      onkeyup={(e: KeyboardEvent) => {
        if (e.key !== 'Enter') return;
        const c = options.find((t) => t.value)?.value;
        if (!c) return;
        const i = collabs.findIndex(x => x === c);
        if (i < 0) {
          collabs.push(c);
        } else {
          collabs.splice(i, 1);
        }
        search = '';
      }}
    />
    {#if search}
      <button class="btn btn-sm btn-ghost join-item" onclick={() => (search = '')}>x</button>
    {/if}
  </label>
  {#each options as { value: opt, id }, idx (id)}
    <span animate:flip={{ duration: 400 }}>
      {#if opt}
        {@const forId = 'collab-' + opt}
        <label for={forId} class="label cursor-pointer px-4" class:search-select={!idx}>
          <input
            id={forId}
            class="checkbox checkbox-primary checkbox-xs"
            type="checkbox"
            name="collabs"
            value={opt}
            bind:group={collabs}
          />
          <span class="label-text"><ClassLabel name={opt} /></span>
        </label>
      {:else}
        <hr class="border-primary m-2" />
      {/if}
    </span>
  {/each}
</div>

<style lang="postcss">
  .search-select {
    @apply underline italic decoration-primary;
  }
</style>
