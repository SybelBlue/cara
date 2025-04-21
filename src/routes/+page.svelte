<script lang="ts">
  import { page } from '$app/state';

  import type { Commit, SimpleCard, Card, Keyed, Test } from '$lib/types';
  import { debug, availableClasses, allClasses } from '$lib/stores';
  import { deckWithIds, exampleDecks, withId } from '$lib/decks';
  import { undiffWords } from '$lib/diff';

  import CardEditor from '$lib/components/CardEditor.svelte';
  import CardBoard from '$lib/components/CardBoard.svelte';
  import Toolbar from '$lib/components/Toolbar.svelte';
  import DeckDialog from '$lib/components/DeckDialog.svelte';
  import TestsTray from '$lib/components/TestsTray.svelte';
  import { onMount } from 'svelte';

  let editorCard: Keyed<SimpleCard> | undefined = $state();
  let readyForCommit: boolean = $state(false);
  let showTests: boolean = $state(false);

  const deckInfo = page.url.searchParams.get('deckInfo') ?? btoa('[]');
  const deckName = page.url.searchParams.get('deckName');
  const deckInit: SimpleCard[] =
    deckName && deckName in exampleDecks ? exampleDecks[deckName] : JSON.parse(atob(deckInfo));

  console.log('Initializing deck', deckInit);
  let cards: SimpleCard[] = $state(deckInit);
  let displayDeck: Card[] = $state(deckInit);

  $effect(() => {
    // note: prevents all other changes to $availableClasses!
    $availableClasses = displayDeck.map((c) => c.name);
  });
  $effect(() => {
    // note: prevents all other changes to $allClasses!
    $allClasses = [
      ...new Set([
        ...displayDeck.map((c) => c.name),
        ...displayDeck.flatMap((c) =>
          c.responsibilities.flatMap((r) => r.collaborators.map((c) => c.name).map(undiffWords))
        )
      ])
    ];
  });

  $debug = true;

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
  const fakeCommits = $derived.by(() => {
    // return [];
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

  let tests: Test[] = $state([
    {
      code: `Feature: Guess the word

  # The first example has two steps
  Scenario: Maker starts a game
    When the Maker starts a game
    Then the Maker waits for a Breaker to join`
    },
    {
      code: `Feature: Guess the word

  # The second example has three steps
  Scenario: Breaker joins a game
    Given the Maker has started a game with the word "silky"
    When the Breaker joins the Maker's game
    Then the Breaker must guess a word with 5 characters`
    }
  ]);
  onMount(() => {
    tests.splice(0, 0, ...tests);
    tests.splice(0, 0, ...tests);
  });

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
    editorCard = undefined;
  };
  const onRename = (card: SimpleCard, name: string) => {
    cards = JSON.parse(JSON.stringify(cards).replaceAll(card.name, name));
    editorCard = cards.find((c) => c.name === name);
  };
  const onSelectCard = (card: Card) => {
    console.log('Card selected:', card.name);
    readyForCommit = true;
    editorCard = cards.find((c) => c.id === card.id);
  };
  const onAddCard = (card: SimpleCard) => {
    cards.push(card);
    displayDeck.push(card);
    editorCard = card;
  };
  const onDeleteCard = (card: SimpleCard) => {
    cards = cards.filter((c) => c.id !== card.id);
    displayDeck = displayDeck.filter((c) => c.id !== card.id);
    editorCard = undefined;
  };

  const setDisplayDeck = (deck: Card[]) => {
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

<Toolbar bind:showTests currentDeck={cards} {setDisplayDeck} {commits} />

<main class="flex w-screen min-h-full grow max-h-full overflow-hidden">
  {#if displayDeck.length == 0}
    <DeckDialog loadDeck={(keyedDeck) => (cards = displayDeck = keyedDeck)} />
  {:else}
    <div
      class:open-tray={editorCard}
      class="transition-all min-h-full max-h-full"
    >
      {#if editorCard}
        <CardEditor
          bind:card={editorCard}
          propose={onProposeEdit}
          rename={onRename}
          delete={onDeleteCard}
          close={() => (editorCard = undefined)}
          {readyForCommit}
        />
      {/if}
    </div>
    <div class="static grow flex-1">
      <CardBoard cards={displayDeck} selectCard={onSelectCard} addCard={onAddCard} />
    </div>
    <div class:open-tray={showTests} class="transition-all min-h-full max-h-full">
      {#if showTests}
        <TestsTray bind:tests close={() => (showTests = false)} />
      {/if}
    </div>
  {/if}
</main>

<style lang="postcss">
  .open-tray {
    @apply flex-1 grow;
  }
</style>
