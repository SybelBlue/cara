<script lang="ts">
  import { highlightedClass, availableClasses } from '$lib/stores';
  import type { DiffText } from '$lib/types';
  import Diff from './Diff.svelte';

  interface Props {
    name: string;
    diff?: DiffText;
    disabled?: boolean;
    selectLabel?: (name: string) => void;
  }

  let { name, diff, disabled = false, selectLabel }: Props = $props();

  let hasACard = $derived($availableClasses.includes(name));
</script>

<span
  onmouseenter={() => ($highlightedClass = disabled ? undefined : name)}
  onmouseleave={() => ($highlightedClass = undefined)}
  onfocus={() => selectLabel?.(name)}
  class:enabled={!disabled && hasACard}
  class:no-card={!hasACard}
  class="text-accent select-all"
  role="link"
  tabindex="0"
>
  <Diff diff={diff || name} />
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
