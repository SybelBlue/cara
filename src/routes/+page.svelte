<script lang="ts">
  import { page } from '$app/stores';

  import type { Deck, Commit, SimpleDeck, SimpleCard } from '$lib/types';
  import { debug, availableClasses } from '$lib/stores';
  import { deckWithIds, deepCopy, premadeDecks } from '$lib/decks';

  import Editor from '$lib/components/Editor.svelte';
  import CardBoard from '$lib/components/CardBoard.svelte';
  import Toolbar from '$lib/components/Toolbar.svelte';
  import DeckDialog from '$lib/components/DeckDialog.svelte';
  import { buildUpsertCardPrompt } from '$lib/prompts';

  let selectedCard: SimpleCard | undefined = $state();
  let readyForCommit: boolean = $state(false);

  const deckInfo = $page.url.searchParams.get('deckInfo') ?? btoa('[]');
  const deckName = $page.url.searchParams.get('deckName');
  const deckInit: SimpleDeck =
    deckName && deckName in premadeDecks ? premadeDecks[deckName] : JSON.parse(atob(deckInfo));

  console.info(`Initializing deck ${deckName ?? '<unamed>'}: `, deckInit);
  let cards: SimpleDeck = $state(deckInit);
  let displayDeck: Deck = $state(deckInit);

  const freeEditing = Boolean($page.url.searchParams.get('free'));

  $effect(() => {
    // note: prevents all other changes to $availableClasses!
    $availableClasses = displayDeck.map((c) => c.name);
  });

  $debug = true;

  let commits: Commit[] = $state(
    deckName?.endsWith('1') ? [ { id: 1, state: premadeDecks[deckName.slice(0, deckName.length - 1) + '0'], date: 'yesterday', text: 'prompt' }] : []);

  const onProposeEdit = async (card: SimpleCard, message: string) => {
    if (freeEditing) {
      const state = deepCopy(cards).map(c => c.name === card.name ? { id: c.id, ...card } : c);
      commits.push({ id: commits.length && commits[commits.length - 1].id + 1, text: message, date: new Date().toLocaleDateString(), state });
      cards = displayDeck = state;
      selectedCard = undefined;
      return;
    }
    console.log('Propose card', message, card);
    readyForCommit = false;
    const response = await fetch('/api/object', {
      method: 'POST',
      body: JSON.stringify({
        // TODO: currently we're passing in the deck/card with ids. That may reduce quality
        description: buildUpsertCardPrompt(card, { cards }, message),
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

  const getStateJson = () => JSON.stringify({ cards: [...cards], prompt: cards.prompt || null, commits });
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

<Toolbar showTimeline currentDeck={cards} {setDisplayDeck} {getStateJson} {commits} prompt={cards?.prompt} />

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
          {freeEditing}
        />
      {/if}
    </div>
    <div class="static split">
      <CardBoard cards={displayDeck} selectCard={onSelectCard} />
    </div>
  {/if}
</main>

<style lang="postcss">
  .split {
    @apply flex-1;
  }
</style>
