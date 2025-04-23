<script module lang="ts">
  export type Props = {
    deck: SimpleCard[];
    commits: Commit[];
    tests: Test[];
  };
</script>

<script lang="ts">
  import type { Commit, SimpleCard, Card, Test } from '$lib/types';
  import { availableClasses, allClasses, debug } from '$lib/stores';
  import { deckWithIds } from '$lib/decks';
  import { undiffWords } from '$lib/diff';

  import CardEditor, { type EditorActions } from './CardEditor.svelte';
  import CardBoard, { type CardBoardActions } from './CardBoard.svelte';
  import TestsTray, { type TestTrayActions } from './TestsTray.svelte';
  import Toolbar from './toolbar/Toolbar.svelte';
  import { beforeNavigate } from '$app/navigation';

  let { deck = $bindable(), commits = $bindable(), tests = $bindable() }: Props = $props();

  /** when defined, opens the editor to inspect itself */
  let editorCard: SimpleCard | undefined = $state();
  /** toggles editor readiness when an blocking llm proposal is made */
  let readyForCommit: boolean = $state(false);

  /** the flag for the tests tray */
  let showTests: boolean = $state(false);

  /** the shallow copy of `deck` that may reorder the cards */
  let displayDeck: Card[] = $state(deck);

  const setDisplayDeck = (cards: Card[]) => (displayDeck = cards);

  $effect(() => {
    // forces updates to deck to propagate to display
    setDisplayDeck(deck);
  });
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

  const cardBoardActions: CardBoardActions = {
    selectCard: (card: Card) => {
      readyForCommit = true;
      editorCard = deck.find((c) => c.id === card.id);
    },
    addCard: (card: SimpleCard) => {
      deck.push(card);
      displayDeck.push(card);
      editorCard = card;
    }
  };

  const editorActions: EditorActions = {
    proposeCommit: async (card: SimpleCard, message: string) => {
      console.log('Propose card', message, card);
      readyForCommit = false;
      const response = await fetch('/api/object', {
        method: 'POST',
        body: JSON.stringify({
          // TODO: currently we're passing in the deck/card with ids. That may reduce quality
          description: `Consider this deck:\n\`\`\`json\n{ "cards" : ${JSON.stringify(deck)} }\n\`\`\`\n\nGiven that we are now upserting the following card, describing the change as "${message}", update both the collaborators on this card and the whole deck to remain consistent. This may involve removing or adding responsibilities, their respective lists of collaborators, or even adding or removing whole cards. Make sure to reproduce all unchanged cards.\n\`\`\`json\n${JSON.stringify(card)}\n\`\`\``,
          schema: 'Deck'
        })
      });
      const { response: newDeck } = await response.json();
      console.debug(newDeck);
      deck = displayDeck = deckWithIds(newDeck);
      editorCard = undefined;
    },
    renameCard: (card: SimpleCard, name: string) => {
      deck = JSON.parse(JSON.stringify(deck).replaceAll(card.name, name));
      editorCard = deck.find((c) => c.name === name);
    },
    deleteCard: (card: SimpleCard) => {
      deck = deck.filter((c) => c.id !== card.id);
      displayDeck = displayDeck.filter((c) => c.id !== card.id);
      editorCard = undefined;
    },
    close: () => (editorCard = undefined)
  };

  const testTrayActions: TestTrayActions = {
    close: () => (showTests = false)
  };

  beforeNavigate((nav) => {
    if (!$debug) nav.cancel();
  })
</script>

<Toolbar bind:showTests currentDeck={deck} {setDisplayDeck} {commits} />

<main class="flex w-screen min-h-full grow max-h-full overflow-hidden">
  <div class:open={editorCard} class="tray">
    {#if editorCard}
      <CardEditor bind:card={editorCard} {readyForCommit} {...editorActions} />
    {/if}
  </div>
  <div class="static open tray">
    <CardBoard locked cards={displayDeck} {...cardBoardActions} />
  </div>
  <div class:open={showTests} class="tray">
    {#if showTests}
      <TestsTray bind:tests {...testTrayActions} />
    {/if}
  </div>
</main>

<style lang="postcss">
  .tray {
    @apply transition-all min-h-full max-h-full;
    &.open {
      @apply flex-1 grow;
    }
  }
</style>
