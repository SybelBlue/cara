<script module lang="ts">
  import type { CardData, DiffText } from '$lib/types';

  export type CardActions = {
    selectBody(name: string): void;
    selectName(name: string): void;
    edittedResp(name: string, ridx: number): void;
    addResp(): void;
    selectCollab(selfName: string, respIdx: number, collabName: string): void;
  };

  export type Props<S extends DiffText = DiffText> = CardData<S> &
    Partial<CardActions> &
    Partial<{
      locked: boolean;
      hidden: boolean;
    }>;
</script>

<script lang="ts">
  import { highlightedClass } from '$lib/stores';
  import ClassLabel from '$lib/components/card/ClassLabel.svelte';
  import Diff from './Diff.svelte';
  import { isDiff, undiffWords } from '$lib/diff';
  import { flip } from 'svelte/animate';
  import { onMount } from 'svelte';

  let {
    name = $bindable(),
    responsibilities = $bindable(),
    locked,
    hidden,
    selectBody,
    selectName,
    edittedResp,
    addResp,
    selectCollab
  }: Props = $props();

  let highlight = $derived($highlightedClass === name);

  const resizeTextarea = (e: HTMLTextAreaElement) => {
    if (!e || !e.style) return;
    e.style.height = e.scrollHeight + 'px';
  };
  let textareas: HTMLTextAreaElement[] = $state([]);

  onMount(() => {
    textareas.forEach(resizeTextarea);
    setTimeout(() => textareas.forEach(resizeTextarea), 150);
  });
</script>

<div
  onfocus={() => selectBody?.(name)}
  class:highlight
  class:opacity-0={hidden}
  class="tw-grow card dark:card-bordered shadow-xl bg-base-100 hover:z-20 transition-opacity"
  role="gridcell"
  tabindex="0"
>
  <section class="card-body">
    <!-- card title -->
    <h3 class="card-title m-1 mb-0 italic">
      <ClassLabel disabled selectLabel={selectName} {name} />
    </h3>
    <hr class="border-primary" />
    <!--  -->

    <!-- card body -->
    <div class="overflow-auto">
      <table class="table table-auto table-sm">
        <thead>
          <tr>
            <th>responsibilities</th>
            <th class="text-right">collabs</th>
          </tr>
        </thead>
        <tbody>
          <!-- listing of responsibilities -->
          {#each responsibilities as r, ridx (r.id)}
            <tr class="hover break-words" animate:flip>
              <td class="desc">
                {#if locked || isDiff(r.description)}
                  <Diff diff={r.description} />
                {:else}
                  <textarea
                    bind:this={textareas[ridx]}
                    bind:value={r.description}
                    class="h-auto"
                    oninput={(e) => resizeTextarea(e.currentTarget)}
                    onblur={() => edittedResp?.(name, ridx)}
                  >
                    <!-- do not add here, bind:value will overwrite -->
                  </textarea>
                {/if}
              </td>
              <td class="text-right">
                <!-- list out collaborators, or... -->
                {#each r.collaborators as { name: diff, id }, cidx (id)}
                  {#if cidx}<span> </span>{/if}
                  <ClassLabel
                    selectLabel={(n) =>
                      selectCollab ? selectCollab(name, ridx, n) : selectName?.(n)}
                    name={undiffWords(diff)}
                    {diff}
                  />
                {:else}
                  <!-- ... provide an add collaborator button -->
                  {#if !locked}
                    <ClassLabel
                      selectLabel={(n) =>
                        selectCollab ? selectCollab(name, ridx, n) : selectName?.(n)}
                      name="[+]"
                    />
                  {/if}
                {/each}
                <!--  -->
              </td>
            </tr>
          {/each}
        </tbody>
        <!--  -->
      </table>
    </div>
    <!--  -->

    <!-- add responsibility button -->
    {#if addResp}
      <button class="btn btn-sm btn-block btn-ghost" onclick={addResp}>
        <ClassLabel name="[+++]" />
      </button>
    {/if}
    <!--  -->
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
    @apply text-ellipsis rounded-lg bg-transparent font-sans;

    font-family: var(--font-handwritten);
    font-size: 14pt;
  }

  textarea {
    @apply desc h-full w-full resize-none content-center;

    &:hover {
      @apply text-accent-content bg-accent resize-y;
    }
  }
</style>
