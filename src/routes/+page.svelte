<script lang="ts">
  import { page } from '$app/state';

  import type { Commit, SimpleCard, Card, Test } from '$lib/types';
  import { exampleDecks, withId } from '$lib/decks';
  import { debug } from '$lib/stores';

  import DeckDialog from '$lib/components/DeckDialog.svelte';
  import App from '$lib/components/App.svelte';
  import Toolbar from '$lib/components/toolbar/Toolbar.svelte';

  import testsJson from '$lib/crc-decks/study-tests.json';

  const deckInfo = page.url.searchParams.get('deckInfo') ?? btoa('[]');
  let deckName = $state(page.url.searchParams.get('deckName'));
  const deckInit: SimpleCard[] =
    // svelte-ignore state_referenced_locally
    deckName && deckName in exampleDecks ? exampleDecks[deckName] : JSON.parse(atob(deckInfo));

  console.log('Initializing deck', deckInit);
  let deck: SimpleCard[] = $state(deckInit);

  $debug = false;

  /// fake data ///
  const randomizedEdits = (deck: SimpleCard[]) => {
    if (deck.length < 2) return [];
    const out = JSON.parse(JSON.stringify(deck)) as SimpleCard[];
    const randomIdx = (list: any[]) => Math.floor(Math.random() * list.length);
    const randomElem = <T,>(list: T[]): T => list[randomIdx(list)];
    const changed = [];
    for (let i = 0, n = Math.random() * 4; i < n; i++) {
      const idx = randomIdx(out);
      const card = out[idx];
      const actions = [
        () => card.responsibilities.splice(randomIdx(card.responsibilities), 1),
        () => {
          let r = randomElem(card.responsibilities);
          if (!r) return;
          r.description = r.description.replace(/\b\w+$/, '- todo!');
        },
        () => {
          let r = randomElem(card.responsibilities);
          if (!r) return;
          r.collaborators.splice(randomIdx(r.collaborators), 1);
        },
        () => {
          randomElem(card.responsibilities)?.collaborators.push(
            withId({ name: randomElem(out).name })
          );
        }
      ];
      actions[randomIdx(actions)]();
      changed.push(card);
    }
    return out;
  };

  // svelte-ignore state_referenced_locally
  const fakeCommits = (() => {
    // return [];
    if (!deck || deck.length == 0) return [];
    let lastDeck = deck;
    return [
      {
        id: 7,
        state: (lastDeck = randomizedEdits(lastDeck)),
        text: 'add C (rand)',
        date: '11/7/2024'
      },
      {
        id: 6,
        state: (lastDeck = randomizedEdits(lastDeck)),
        text: 'add B (rand)',
        date: '11/6/2024'
      },
      {
        id: 5,
        state: (lastDeck = randomizedEdits(lastDeck)),
        text: 'add A (rand)',
        date: '11/5/2024'
      },
      { id: 4, state: [], text: 'removed Dialogue System', date: '11/4/2024' },
      { id: 3, state: [], text: 'updated character', date: '11/3/2024' },
      { id: 2, state: [], text: 'updated manna', date: '11/2/2024' },
      { id: 1, state: [], text: 'initial commit', date: '11/1/2024' }
    ].toReversed();
  })();
  /// fake data ///
  let commits: Commit[] = $state(fakeCommits);

  let tests: Test[] = $state(testsJson);
</script>

<svelte:head>
  {#if deckName}
    <title>cara : {deckName.toLowerCase()}</title>
  {:else}
    <title>cara</title>
  {/if}
  <meta name="description" content="crc card design game" />

  <!-- patch to delay page load until theme is ready in deployment -->
  {#if !$debug}
    <script async crossorigin="anonymous">
      var selectedTheme = localStorage.getItem('theme');
      if (selectedTheme) {
        document.documentElement.setAttribute('data-theme', selectedTheme);
      }
    </script>
  {/if}
</svelte:head>

{#if deck.length == 0}
  <Toolbar currentDeck={[]} commits={[]} />
  <main class="flex w-screen min-h-full grow max-h-full overflow-hidden">
    <DeckDialog
      loadDeck={(keyedDeck, name) => {
        deck = keyedDeck;
        deckName = name || null;
      }}
    />
  </main>
{:else}
  <App bind:deck bind:tests bind:commits />
{/if}
