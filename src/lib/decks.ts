import type { Keyed, DeckJson, SimpleCard } from './types';

import libraryJson from '$lib/crc-decks/library.json';
import rpgJson from '$lib/crc-decks/rpg.json';
import hospitalJson from '$lib/crc-decks/hospital.json';
import sevilleJson from '$lib/crc-decks/seville.json';

export const withId: <T extends object>(o: T) => Keyed<T> = (function () {
  let nextId = 0;
  return (o) => {
    if ('id' in o) {
      if (typeof o.id === 'number') {
        nextId = Math.max(nextId, o.id);
      } else {
        delete o.id;
      }
    }

    return { id: nextId++, ...o };
  };
})();

export const deckWithIds = (deck: DeckJson): SimpleCard[] => {
  return deck.cards.map((card) =>
    withId({
      id: card.id,
      name: card.name,
      responsibilities: card.responsibilities.map((r) =>
        withId({ id: r.id, description: r.description, collaborators: r.collaborators.map(withId) })
      )
    })
  );
};

export const exampleDecks: Record<string, SimpleCard[]> = {
  rpg: deckWithIds(rpgJson),
  library: deckWithIds(libraryJson),
  hospital: deckWithIds(hospitalJson),
  seville: deckWithIds(sevilleJson),
  empty: deckWithIds({
    cards: [
      {
        name: 'NewClass',
        responsibilities: [{ description: 'A new responsibility...', collaborators: [] }]
      }
    ]
  })
};
