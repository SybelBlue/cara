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
    hidden?: boolean;
    selectName?: (name: string) => void;
    selectCollab?: (selfName: string, respIdx: number, collabName: string) => void;
  };

  export type Props<S = DiffText> = Data<S> & DisplayProps;
</script>

<script lang="ts">
  import { highlightedClass } from '$lib/stores';
  import ClassLabel from '$lib/components/ClassLabel.svelte';
  import Diff from './Diff.svelte';
  import { isDiff, undiffWords } from '$lib/diff';

  let {
    name = $bindable(),
    responsibilities = $bindable(),
    locked,
    hidden,
    selectName: selectLabel,
    selectCollab
  }: Props = $props();

  let highlight = $derived($highlightedClass === name);
</script>

<div
  onfocus={() => selectLabel?.(name)}
  class:highlight
  class:opacity-0={hidden}
  class="tw-grow card dark:card-bordered shadow-xl bg-base-100 hover:z-20 transition-opacity"
  role="gridcell"
  tabindex="0"
>
  <section class="card-body">
    <h3 class="card-title m-1 mb-0 italic">
      <ClassLabel disabled {selectLabel} {name} />
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
        {#each responsibilities as r, ridx}
          <tr class="hover break-words">
            <td class="desc">
              {#if locked || isDiff(r.description)}
                <Diff diff={r.description} />
              {:else}
                <textarea bind:value={r.description} class="h-auto">
                  <!-- do not add here, bind:value will overwrite -->
                </textarea>
              {/if}
            </td>
            <td class="text-right">
              {#each r.collaborators as { name: diff, id }, cidx}
                {#if cidx}<span> </span>{/if}
                <ClassLabel
                  selectLabel={(n) =>
                    selectCollab ? selectCollab(name, ridx, n) : selectLabel?.(n)}
                  name={undiffWords(diff)}
                  {diff}
                />
              {:else}
                {#if !locked}
                  <ClassLabel
                    selectLabel={(n) =>
                      selectCollab ? selectCollab(name, ridx, n) : selectLabel?.(n)}
                    name="[+]"
                  />
                {/if}
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
