<script lang="ts">
  import { clickOutside } from '$lib/actions';
  import type { Card } from '$lib/types';
  import ThemeChanger from './ThemeChange.svelte';
  import TimelinePanel from './TimelinePanel.svelte';
  import type { Props as TimelinePanelProps } from './TimelinePanel.svelte';
  import SortWidget, { type SortFn } from './SortWidget.svelte';
  import { hasDiff } from '$lib/diff';

  type Props = Omit<TimelinePanelProps, 'show'> & {
    showTests: boolean;
  };

  let {
    showTests = $bindable(false),
    currentDeck,
    setDisplayDeck: setCardBoardDeck,
    commits
  }: Props = $props();

  let displayDeck: Card[] = $state(currentDeck);
  let showTimeline = $state(false);
  let sorter: undefined | SortFn = $state();

  const setDisplayDeck: Props['setDisplayDeck'] = (d) => (displayDeck = d);

  $effect(() => {
    if (!setCardBoardDeck) return;
    const base = sorter ? displayDeck.toSorted(sorter) : displayDeck;

    const [out, unchanged]: Card[][] = [[], []];
    for (const c of base) (hasDiff(c) ? out : unchanged).push(c);

    setCardBoardDeck([...out, ...unchanged]);
  });
</script>

<header
  class="bg-base-100 w-full shadow-md rounded-b-3xl mb-2 z-50"
  use:clickOutside={() => (showTimeline = false)}
>
  <div class="w-full px-4 py-3 flex items-center justify-between">
    <nav class="flex-1 flex gap-4">
      {#if currentDeck.length}
        <ThemeChanger />
        <SortWidget {currentDeck} setSortFn={(fn) => (sorter = fn)} />
      {/if}
    </nav>
    <h1 class="text-lg font-mono italic text-accent decoration-primary hover:underline">
      {'{ '}<span class="transition-all hover:text-primary hover:px-2">cara</span>{' }'}
    </h1>
    <nav class="flex-1 flex flex-row-reverse gap-4">
      {#if currentDeck.length > 0}
        <!-- cucumber tests button -->
        <button
          class="btn btn-ghost btn-circle input-bordered"
          onclick={() => (showTests = !showTests)}
        >
          <svg
            class:open={showTests}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="18 15 85 90"
            style="enable-background:new 0 0 117.45 122.88"
            xml:space="preserve"
          >
            <path
              d="M53.4,91.75c-1.96,0-3.54-1.59-3.54-3.54s1.59-3.54,3.54-3.54h19.85c1.96,0,3.54,1.59,3.54,3.54s-1.59,3.54-3.54,3.54H53.4 L53.4,91.75z M23.23,88.24c-0.8-1.2-0.48-2.82,0.72-3.63c1.2-0.8,2.82-0.48,3.63,0.72L29,87.45l5.65-6.88 c0.92-1.11,2.56-1.27,3.68-0.36c1.11,0.92,1.27,2.56,0.36,3.68l-7.82,9.51c-0.17,0.22-0.38,0.42-0.62,0.58 c-1.2,0.8-2.82,0.48-3.63-0.72L23.23,88.24L23.23,88.24z M23.23,63.34c-0.8-1.2-0.48-2.82,0.72-3.63c1.2-0.8,2.82-0.48,3.63,0.72 L29,62.55l5.65-6.88c0.92-1.11,2.56-1.27,3.68-0.36c1.11,0.92,1.27,2.56,0.36,3.68l-7.82,9.51c-0.17,0.22-0.38,0.42-0.62,0.58 c-1.2,0.8-2.82,0.48-3.63-0.72L23.23,63.34L23.23,63.34z M23.23,38.43c-0.8-1.2-0.48-2.82,0.72-3.63c1.2-0.8,2.82-0.48,3.63,0.72 L29,37.64l5.65-6.88c0.92-1.11,2.56-1.27,3.68-0.36c1.11,0.92,1.27,2.56,0.36,3.68l-7.82,9.51c-0.17,0.22-0.38,0.42-0.62,0.58 c-1.2,0.8-2.82,0.48-3.63-0.72L23.23,38.43L23.23,38.43z M53.4,39.03c-1.96,0-3.54-1.59-3.54-3.54s1.59-3.54,3.54-3.54h36.29 c1.96,0,3.54,1.59,3.54,3.54s-1.59,3.54-3.54,3.54H53.4L53.4,39.03z M8.22,0h101.02c2.27,0,4.33,0.92,5.81,2.4 c1.48,1.48,2.4,3.54,2.4,5.81v106.44c0,2.27-0.92,4.33-2.4,5.81c-1.48,1.48-3.54,2.4-5.81,2.4H8.22c-2.27,0-4.33-0.92-5.81-2.4 C0.92,119,0,116.93,0,114.66V8.22C0,5.95,0.92,3.88,2.4,2.4C3.88,0.92,5.95,0,8.22,0L8.22,0z M109.24,7.08H8.22 c-0.32,0-0.61,0.13-0.82,0.34c-0.21,0.21-0.34,0.5-0.34,0.82v106.44c0,0.32,0.13,0.61,0.34,0.82c0.21,0.21,0.5,0.34,0.82,0.34 h101.02c0.32,0,0.61-0.13,0.82-0.34c0.21-0.21,0.34-0.5,0.34-0.82V8.24c0-0.32-0.13-0.61-0.34-0.82 C109.84,7.21,109.55,7.08,109.24,7.08L109.24,7.08z M53.4,65.39c-1.96,0-3.54-1.59-3.54-3.54s1.59-3.54,3.54-3.54h36.29 c1.96,0,3.54,1.59,3.54,3.54s-1.59,3.54-3.54,3.54H53.4L53.4,65.39z"
            />
          </svg>
          <span class="sr-only">Show Design Tests</span>
        </button>
        <!--  -->

        <!-- commit timeline button -->
        {#if commits.length > 0}
          <button
            class="btn btn-ghost btn-circle input-bordered"
            onclickcapture={() => (showTimeline = !showTimeline)}
            aria-label={(showTimeline ? 'hide' : 'show') + ' timeline'}
          >
            <svg
              class:open={showTimeline}
              xmlns="http://www.w3.org/2000/svg"
              shape-rendering="geometricPrecision"
              text-rendering="geometricPrecision"
              image-rendering="optimizeQuality"
              fill-rule="evenodd"
              clip-rule="evenodd"
              viewBox="0 0 512 512.44"
            >
              <path
                fill-rule="nonzero"
                d="M216.81 155.94c0-10.96 8.88-19.84 19.84-19.84 10.95 0 19.83 8.88 19.83 19.84v120.75l82.65 36.33c10.01 4.41 14.56 16.1 10.15 26.11-4.41 10.02-16.1 14.56-26.11 10.15l-93.5-41.1c-7.51-2.82-12.86-10.07-12.86-18.57V155.94zM9.28 153.53c-.54-1.88-.83-3.87-.83-5.92l.16-73.41c0-11.84 9.59-21.43 21.43-21.43 11.83 0 21.43 9.59 21.43 21.43l-.06 27.86a255.053 255.053 0 0144.08-45.53c16.78-13.47 35.57-25.04 56.18-34.24 64.6-28.81 134.7-28.73 195.83-5.31 60.67 23.24 112.56 69.47 141.51 133.25.56 1.01 1.03 2.07 1.41 3.17 28.09 64.15 27.83 133.6 4.6 194.21-22.33 58.29-65.87 108.46-125.8 137.98-.38.22-.76.42-1.16.62-12.44 6.14-25.46 11.26-38.74 15.3-4.96 1.46-10.12.99-14.68-1.46-15.1-8.13-12.86-30.46 3.53-35.45 8.78-2.7 17.32-5.87 25.67-9.6.41-.21.84-.4 1.27-.58 2-.91 3.99-1.85 5.96-2.82.53-.26 1.07-.5 1.62-.71 50.62-25.1 87.42-67.61 106.34-116.98 19.93-52.04 20.04-111.64-4.41-166.46l-.01-.02c-24.46-54.82-68.84-94.54-120.82-114.45-52.04-19.94-111.63-20.04-166.45 4.41a217.791 217.791 0 00-47.75 29.11 216.133 216.133 0 00-37.71 39.04l17.1-.97c11.83-.65 21.96 8.42 22.61 20.26.65 11.83-8.42 21.96-20.26 22.61l-69.71 3.94c-11.02.6-20.56-7.21-22.34-17.85zm237.66 358.9c17.55.55 26.69-20.55 14.26-32.98-3.57-3.45-7.9-5.35-12.86-5.56-11.92-.39-23.48-1.72-35.19-4.01-7.52-1.44-14.84 1.44-19.39 7.59-8.15 11.46-1.97 27.43 11.85 30.22a256.37 256.37 0 0041.33 4.74zm-119.12-34.22c11.75 6.79 26.54-.08 28.81-13.5 1.23-7.97-2.34-15.6-9.26-19.74-10.27-5.99-19.83-12.71-28.99-20.28-13.76-11.34-34.16.32-31.36 17.95.81 4.7 3.05 8.59 6.69 11.68a255.166 255.166 0 0034.11 23.89zm-88.67-86.32c8.88 14.11 30.17 11.17 34.88-4.84 1.51-5.36.76-10.83-2.17-15.57-6.29-10.03-11.7-20.52-16.31-31.43-6.2-14.74-26.7-15.97-34.56-2.04-2.94 5.15-3.3 11.48-1 16.94 5.36 12.77 11.8 25.21 19.16 36.94zM.66 274.2c.62 8.63 6.81 15.71 15.27 17.51 12.64 2.53 23.99-7.36 23.19-20.23-.85-11.87-.73-23.54.32-35.4.59-7.04-2.49-13.66-8.31-17.67-12.22-8.25-28.69-.5-30.08 14.17a257.06 257.06 0 00-.39 41.62z"
              />
            </svg>
            <span class="sr-only">Show Commit Timeline</span>
          </button>
        {/if}
        <!--  -->
      {/if}
    </nav>
  </div>
  {#if currentDeck.length > 0 && commits.length > 0}
    <TimelinePanel show={showTimeline} {currentDeck} {setDisplayDeck} {commits} expand />
  {/if}
</header>

<style lang="postcss">
  svg {
    @apply h-[60%] w-[60%] fill-base-content;
    &.open {
      @apply fill-accent;
    }
  }
</style>
