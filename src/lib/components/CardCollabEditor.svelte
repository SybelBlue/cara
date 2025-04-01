<script module lang="ts">
  import type { Keyed, Card, DiffText, Deck } from '$lib/types';

  export interface RespLens<C extends Card<S>, S = DiffText> {
    card: C;
    respIdx: number;
  }
  export interface Props {
    respLens: RespLens<Deck[number]>;
    setCollabs?: (card: Keyed<Card>, respIdx: number, collabs: Card['responsibilities'][number]['collaborators']) => void;
  }
</script>

<script lang="ts">
  import CollabPicker from './CollabPicker.svelte';
  import { undiffWords } from '$lib/diff';
  import { mergeKeyed } from '$lib/common';
  import { withId } from '$lib/decks';

  let { respLens, setCollabs: propagate }: Props = $props();

  const { card, respIdx } = $derived(respLens);
  const collabs = $derived(
    card?.responsibilities[respIdx]?.collaborators.map((c) => c.name).map(undiffWords)
  );
  const avoiding = $derived([undiffWords(card?.name ?? '')]);

  const setCollabs = (collabs: string[]) => {
    const resp = card.responsibilities[respIdx];
    if (!resp) return;
    // merge the collaborators, prefering the old (id'ed) versions when they exist,
    // otherwise creatingn new ids for the new custom collabs
    const newKeyedCollabs = mergeKeyed(
      resp.collaborators,
      collabs.map((name) => ({ name })),
      (x) => undiffWords(x.name)
    ).flatMap((z) => (z.type === 'right' ? [withId(z.right)] : z.type === 'both' ? [z.left] : []));
    propagate?.(card, respIdx, newKeyedCollabs);
  };
</script>

<CollabPicker {collabs} {avoiding} {setCollabs} />
