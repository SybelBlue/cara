<!-- from https://github.com/saadeghi/daisyui/blob/9641f709c88a29e0c1f74402439c89f504fad423/src/docs/src/components/ThemeChange.svelte -->
<script>
  import { onMount } from 'svelte';
  import { themeChange } from 'theme-change';
  import ToolbarButton from './ToolbarButton.svelte';
  onMount(() => themeChange(false));
  let themes = [
    'autumn',
    'dracula',
    'emerald',
    'halloween',
    'light',
    'dark',
    'cupcake',
    'bumblebee',
    'corporate',
    'synthwave',
    'retro',
    'cyberpunk',
    'valentine',
    'garden',
    'forest',
    'aqua',
    'lofi',
    'pastel',
    'fantasy',
    'wireframe',
    'black',
    'luxury',
    'cmyk',
    'business',
    'acid',
    'lemonade',
    'night',
    'coffee',
    'winter',
    'dim',
    'nord',
    'sunset'
  ];
</script>

<div
  title="Change Theme"
  class="dropdown dropdown-start z-30 [@supports(color:oklch(0%_0_0))]:block"
>
  <ToolbarButton label="change theme">
    {#snippet inner()}
      <svg
        width="15"
        height="15"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        class="h-5 w-5 stroke-current"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
        >
        </path>
      </svg>
    {/snippet}
  </ToolbarButton>
  <div
    class="dropdown-content bg-base-200 text-base-content rounded-box top-px h-[28.6rem] max-h-[calc(100vh-10rem)] w-56 overflow-y-auto border border-white/5 shadow-2xl outline outline-1 outline-black/5 mt-16"
  >
    <div class="grid grid-cols-1 gap-3 p-3">
      {#each themes as theme}
        <button
          class="outline-base-content text-start outline-offset-4"
          data-set-theme={theme}
          data-act-class="[&_svg]:visible"
        >
          <span
            data-theme={theme}
            class="bg-base-100 rounded-btn text-base-content block w-full cursor-pointer font-sans"
          >
            <span class="grid grid-cols-5 grid-rows-3">
              <span class="col-span-5 row-span-3 row-start-1 flex items-center gap-2 px-4 py-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="invisible h-3 w-3 shrink-0"
                >
                  <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z">
                  </path>
                </svg>
                <span class="flex-grow text-sm">
                  {theme}
                </span>
                <span class="flex h-full shrink-0 flex-wrap gap-1">
                  <span class="bg-primary rounded-badge w-2"></span>
                  <span class="bg-secondary rounded-badge w-2"></span>
                  <span class="bg-accent rounded-badge w-2"></span>
                  <span class="bg-neutral rounded-badge w-2"></span>
                </span>
              </span>
            </span>
          </span>
        </button>
      {/each}
    </div>
  </div>
</div>
