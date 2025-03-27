<script lang="ts">
  import { highlightedClass, availableClasses } from '$lib/stores';
  import type { Snippet } from 'svelte';

  interface Props {
    name: string;
    disabled?: boolean;
    selectName?: (name: string) => void;
    children?: Snippet;
  }

  let { name, disabled = false, children, selectName }: Props = $props();

  let hasACard = $derived($availableClasses.includes(name));
</script>

<span
  onmouseenter={() => ($highlightedClass = disabled ? undefined : name)}
  onmouseleave={() => ($highlightedClass = undefined)}
  onfocus={() => selectName?.(name)}
  class:enabled={!disabled && hasACard}
  class:no-card={!hasACard}
  class="text-accent"
  role="link"
  tabindex="0"
>
  {#if children}
    {@render children()}
  {:else}
    {name}
  {/if}
</span>

<style lang="postcss">
  span {
    font-family: var(--font-mono);

    &.enabled:hover {
      @apply underline;
      text-shadow: 0 0 15px oklch(var(--a));
    }

    &.no-card {
      @apply text-neutral italic hover:text-neutral-content;
    }
  }
</style>
