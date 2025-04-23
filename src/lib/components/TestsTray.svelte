<script module lang="ts">
  import type { Test } from '$lib/types';

  export type TestTrayActions = {
    close(): void;
  };

  export type Props = Partial<TestTrayActions> & {
    tests: Test[];
  };
</script>

<script lang="ts">
  import Highlight from 'svelte-highlight';
  import { gherkin } from 'svelte-highlight/languages';

  let { tests = $bindable(), close }: Props = $props();
</script>

<div class="relative h-full max-h-full w-full bg-base-100 grid grid-cols-1 shadow-xl">
  <!-- header -->
  <div>
    <div class="flex max-h-fit shadow-md rounded-b-3xl mb-2">
      <!-- "X" button in top left -->
      <button
        class="btn btn-sm btn-circle btn-outline outline-neutral mx-2 my-auto"
        onclick={() => close?.()}
        aria-label="Select Theme"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
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
      <h2 class="text-lg font-mono text-neutral mx-auto my-auto p-2 pointer-events-none">
        {'「 tests 」'}
      </h2>
    </div>
  </div>
  <!--  -->
  <div class="relative top-0 left-0 bg-base-100 max-h-full overflow-scroll snap-y">
    <ul class="min-w-full overflow-visible grid gap-2 px-1 grid-cols-1">
      {#each tests as { code }}
        <li class="card dark:card-bordered shadow-md snap-start">
          <section class="card-body h-fit text-sm">
            <Highlight language={gherkin} {code} />
          </section>
        </li>
      {/each}
    </ul>
  </div>
</div>
