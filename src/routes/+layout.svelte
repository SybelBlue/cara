<script lang="ts">
  import '../app.css';
  import type { Snippet } from 'svelte';

  interface Props {
    children?: Snippet<[]>;
  }

  let { children }: Props = $props();
</script>

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
    .hljs-section {
      @apply text-primary;
    }
    .hljs-title {
      @apply hljs-section italic;
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

<div id="app">
  {@render children?.()}
</div>

<style lang="postcss">
  #app {
    @apply absolute overflow-hidden flex flex-col p-0 m-auto min-h-full max-h-[100vh] max-w-[100vw] box-border;
  }
</style>
