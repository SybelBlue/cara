<script lang="ts">
  import { page } from '$app/stores';

  import type { Deck, Commit, SimpleDeck, SimpleCard } from '$lib/types';
  import { debug, availableClasses } from '$lib/stores';
  import { deckWithIds, exampleDecks, withId } from '$lib/decks';

  import Editor from '$lib/components/Editor.svelte';
  import CardBoard from '$lib/components/CardBoard.svelte';
  import Toolbar from '$lib/components/Toolbar.svelte';
  import DeckDialog from '$lib/components/DeckDialog.svelte';

  let selectedCard: SimpleCard | undefined = $state();
  let readyForCommit: boolean = $state(false);

  const deckInfo = $page.url.searchParams.get('deckInfo') ?? btoa('[]');
  const deckName = $page.url.searchParams.get('deckName');
  const deckInit: SimpleDeck =
    deckName && deckName in exampleDecks ? exampleDecks[deckName] : JSON.parse(atob(deckInfo));

  console.log('Initializing deck', deckInit);
  let cards: SimpleDeck = $state(deckInit);
  let displayDeck: Deck = $state(deckInit);

  $effect(() => {
    // note: prevents all other changes to $availableClasses!
    $availableClasses = displayDeck.map((c) => c.name);
  });

  $debug = true;

  /// fake data ///
  const randomizedEdits = (deck: SimpleDeck) => {
    const out = JSON.parse(JSON.stringify(deck)) as SimpleDeck;
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
          r.description = r.description.replace(/\b\w+$/, '- todo!');
        },
        () => {
          let r = randomElem(card.responsibilities);
          r.collaborators.splice(randomIdx(r.collaborators), 1);
        },
        () => {
          randomElem(card.responsibilities).collaborators.push(
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
  const fakeCommits = $derived.by(() => {
    if (!cards || cards.length == 0) return [];
    let lastDeck = cards;
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
  });
  /// fake data ///
  const commits: Commit[] = $derived(fakeCommits);

  const onProposeEdit = async (card: SimpleCard, message: string) => {
    console.log('Propose card', message, card);
    readyForCommit = false;
    const response = await fetch('/api/object', {
      method: 'POST',
      body: JSON.stringify({
        // TODO: currently we're passing in the deck/card with ids. That may reduce quality
        description: `Consider this deck:\n\`\`\`json\n{ "cards" : ${JSON.stringify(cards)} }\n\`\`\`\n\nGiven that we are now upserting the following card, describing the change as "${message}", update both the collaborators on this card and the whole deck to remain consistent. This may involve removing or adding responsibilities, their respective lists of collaborators, or even adding or removing whole cards. Make sure to reproduce all unchanged cards.\n\`\`\`json\n${JSON.stringify(card)}\n\`\`\``,
        schema: 'Deck'
      })
    });
    const { response: deck } = await response.json();
    console.log(deck);
    cards = displayDeck = deckWithIds(deck);
    selectedCard = undefined;
  };
  const onSelectCard = (card: Deck[number]) => {
    console.log('Card selected:', card.name);
    readyForCommit = true;
    selectedCard = cards.find((c) => c.id === card.id);
  };

  const setDisplayDeck = (deck: Deck) => {
    displayDeck = deck;
  };
</script>

<svelte:head>
  <title>CARA</title>
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

<Toolbar currentDeck={cards} {setDisplayDeck} {commits} />

<main class="flex w-screen max-h-full overflow-hidden">
  {#if displayDeck.length == 0}
    <DeckDialog loadDeck={(keyedDeck) => (cards = displayDeck = keyedDeck)} />
  {:else}
    <div class:split={selectedCard} class="transition-all min-h-full max-h-full">
      {#if selectedCard}
        <Editor
          card={selectedCard}
          propose={onProposeEdit}
          close={() => (selectedCard = undefined)}
          {readyForCommit}
        />
      {/if}
    </div>
    <div class="static split">
      <CardBoard allowEditing cards={displayDeck} selectCard={onSelectCard} />
    </div>
  {/if}
</main>

<style lang="postcss">
  .split {
    @apply flex-1;
  }
</style>
