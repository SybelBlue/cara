<script lang="ts">
  import Highlight from 'svelte-highlight';
  import { gherkin } from 'svelte-highlight/languages';

  import type { Test } from '$lib/types';
  import { clickOutside } from '$lib/actions';
  import { onMount } from 'svelte';

  interface Props {
    tests: Test[];
    close?: () => void;
  }

  let { tests = $bindable(), close }: Props = $props();

  const lastChange = $derived.by(() => Date.now());
  onMount(() => {
    lastChange;
  });
</script>

<div
  use:clickOutside={() => {
    if (Date.now() - lastChange > 200) close?.();
  }}
  class="relative h-full max-h-full w-full bg-base-100 grid grid-cols-1 shadow-xl"
>
  <!-- header -->
  <div>
    <div class="flex max-h-fit shadow-md rounded-b-3xl mb-2">
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

<!-- styling for highlight js -->
<svelte:head>
  <style lang="postcss">
    pre code.hljs {
      display: block;
      overflow-x: auto;
      padding: 1em;
    }
    code.hljs {
      padding: 3px 5px;
    }
    .hljs {
      @apply bg-base-100 text-base-content;
    }
    .hljs-comment,
    .hljs-quote {
      @apply text-neutral;
    }
    .hljs-variable,
    .hljs-template-variable,
    .hljs-tag,
    .hljs-name,
    .hljs-selector-id,
    .hljs-selector-class,
    .hljs-regexp,
    .hljs-deletion {
      @apply text-secondary;
    }
    .hljs-number,
    .hljs-built_in,
    .hljs-literal,
    .hljs-type,
    .hljs-params,
    .hljs-meta,
    .hljs-link {
      @apply text-accent;
    }
    .hljs-attribute {
      @apply text-neutral;
    }
    .hljs-string,
    .hljs-symbol,
    .hljs-bullet,
    .hljs-addition {
      @apply text-primary;
    }
    .hljs-title,
    .hljs-section {
      @apply text-primary;
    }
    .hljs-keyword,
    .hljs-selector-tag {
      @apply text-accent;
    }
    .hljs-emphasis {
      font-style: italic;
    }
    .hljs-strong {
      font-weight: bold;
    }
    @media screen and (-ms-high-contrast: active) {
      .hljs-addition,
      .hljs-attribute,
      .hljs-built_in,
      .hljs-bullet,
      .hljs-comment,
      .hljs-link,
      .hljs-literal,
      .hljs-meta,
      .hljs-number,
      .hljs-params,
      .hljs-string,
      .hljs-symbol,
      .hljs-type,
      .hljs-quote {
        color: highlight;
      }
      .hljs-keyword,
      .hljs-selector-tag {
        font-weight: bold;
      }
    }
  </style>
</svelte:head>
<!--  -->
