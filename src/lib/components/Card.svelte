<script module lang="ts">
  import type { Keyed, DiffText } from '$lib/types';

  export interface Data<S> {
    name: string;
    responsibilities: Keyed<{
      description: S;
      collaborators: Keyed<{ name: S }>[];
    }>[];
  }

  type DisplayProps = {
    locked?: boolean;
    selectName?: (name: string) => void;
  };

  export type Props<S = DiffText> = Data<S> & DisplayProps;
</script>

<script lang="ts">
  import { highlightedClass } from '$lib/stores';
  import ClassLabel from '$lib/components/ClassLabel.svelte';

  let { name = $bindable(), responsibilities = $bindable(), locked, selectName }: Props = $props();

  let highlight = $derived($highlightedClass === name);
</script>

{#snippet diff(v: DiffText)}
  {#if Array.isArray(v)}
    {#each v as chg}
      {#if chg.added}
        <span class="text-primary decoration-primary underline">{chg.value}</span>
      {/if}
      {#if chg.removed}
        <span class="text-secondary decoration-secondary line-through">{chg.value}</span>
      {/if}
      {#if !chg.added && !chg.removed}
        <span>{chg.value}</span>
      {/if}
    {/each}
  {:else}
    <span>{v}</span>
  {/if}
{/snippet}

{#snippet diffLabel(v: DiffText)}
  {#if Array.isArray(v)}
    <ClassLabel {selectName} name={v.map((c) => (c.removed ? '' : c.value)).join('')}>
      {@render diff(v)}
    </ClassLabel>
  {:else}
    <ClassLabel {selectName} name={v} />
  {/if}
{/snippet}

<div
  onfocus={() => selectName?.(name)}
  class:highlight
  class="tw-grow card dark:card-bordered shadow-xl bg-base-100 hover:z-20"
  role="gridcell"
  tabindex="0"
>
  <section class="card-body">
    <h3 class="card-title m-1 mb-0 italic">
      <ClassLabel disabled {selectName} {name} />
    </h3>
    <hr class="border-primary" />
    <table class="table table-auto table-sm">
      <thead>
        <tr>
          <th>responsibilities</th>
          <th class="text-right">collabs</th>
        </tr>
      </thead>
      <tbody>
        {#each responsibilities as r}
          <tr class="hover break-words">
            <td class="desc">
              {#if locked}
                {@render diff(r.description)}
              {:else}
                <textarea bind:value={r.description}></textarea>
              {/if}
            </td>
            <td class="text-right">
              {#each r.collaborators as { name, id }, i}
                {#if i}<span> </span>{/if}
                {@render diffLabel(name)}
              {/each}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </section>
</div>

<style lang="postcss">
  th {
    @apply m-1 text-base-content text-base italic underline decoration-primary;
  }

  tr {
    @apply border-b border-base-300 align-baseline;

    &:last-child {
      @apply border-b-0;
    }
  }

  .highlight {
    box-shadow: 0 0 25px oklch(var(--a));
  }

  .desc {
    @apply text-ellipsis rounded-lg bg-transparent;

    font-family: var(--font-handwritten);
    font-size: 18pt;
  }

  textarea {
    @apply desc h-full w-full resize-none content-center;

    &:hover {
      @apply text-accent-content bg-accent resize-y;
    }
  }
</style>
