import type { Keyed, DeckJson, SimpleDeck } from './types';

import libraryJson from '$lib/crc-decks/library.json';
import rpgJson from '$lib/crc-decks/rpg.json';
import hospitalJson from '$lib/crc-decks/hospital.json';

import mediTrackJson from '$lib/crc-decks/data-col/medi-track.json';
import ecoTrackJson from '$lib/crc-decks/data-col/ecotrack.json';
import libAI0Json from '$lib/crc-decks/data-col/libraryAI0.json';
import libAI1Json from '$lib/crc-decks/data-col/libraryAI1.json';
import libCE0Json from '$lib/crc-decks/data-col/libraryCE0.json';
import libCE1Json from '$lib/crc-decks/data-col/libraryCE1.json';
import techDebtKillGod0Json from '$lib/crc-decks/data-col/technical-debt-kill-god0.json';
import techDebtKillGod1Json from '$lib/crc-decks/data-col/technical-debt-kill-god1.json';
import techDebtMakeGod0Json from '$lib/crc-decks/data-col/technical-debt-make-god0.json';
import techDebtMakeGod1Json from '$lib/crc-decks/data-col/technical-debt-make-god1.json';
import casiNoAI0Json from '$lib/crc-decks/data-col/casiNoAI0.json';
import casiNoAI1Json from '$lib/crc-decks/data-col/casiNoAI1.json';
import casiNoWeb0Json from '$lib/crc-decks/data-col/casiNoWeb0.json';
import casiNoWeb1Json from '$lib/crc-decks/data-col/casiNoWeb1.json';
import casiNoCash0Json from '$lib/crc-decks/data-col/casiNoCash0.json';
import casiNoCash1Json from '$lib/crc-decks/data-col/casiNoCash1.json';
import teamSyncAuth0Json from '$lib/crc-decks/data-col/teamSyncAuth0.json';
import teamSyncAuth1Json from '$lib/crc-decks/data-col/teamSyncAuth1.json';

import a1cohereJson from '$lib/crc-decks/data-col/ai/A1-cohere.json';
import a2cohereJson from '$lib/crc-decks/data-col/ai/A2-cohere.json';
import b1cohereJson from '$lib/crc-decks/data-col/ai/B1-cohere.json';
import b2cohereJson from '$lib/crc-decks/data-col/ai/B2-cohere.json';
import c1cohereJson from '$lib/crc-decks/data-col/ai/C1-cohere.json';
import c2cohereJson from '$lib/crc-decks/data-col/ai/C2-cohere.json';
import c3cohereJson from '$lib/crc-decks/data-col/ai/C3-cohere.json';
import a1openaiJson from '$lib/crc-decks/data-col/ai/A1-openai.json';
import a2openaiJson from '$lib/crc-decks/data-col/ai/A2-openai.json';
import b1openaiJson from '$lib/crc-decks/data-col/ai/B1-openai.json';
import b2openaiJson from '$lib/crc-decks/data-col/ai/B2-openai.json';
import c1openaiJson from '$lib/crc-decks/data-col/ai/C1-openai.json';
import c2openaiJson from '$lib/crc-decks/data-col/ai/C2-openai.json';
import c3openaiJson from '$lib/crc-decks/data-col/ai/C3-openai.json';
import a1claudeJson from '$lib/crc-decks/data-col/ai/A1-claude.json';
import a2claudeJson from '$lib/crc-decks/data-col/ai/A2-claude.json';
import b1claudeJson from '$lib/crc-decks/data-col/ai/B1-claude.json';
import b2claudeJson from '$lib/crc-decks/data-col/ai/B2-claude.json';
import c1claudeJson from '$lib/crc-decks/data-col/ai/C1-claude.json';
import c2claudeJson from '$lib/crc-decks/data-col/ai/C2-claude.json';
import c3claudeJson from '$lib/crc-decks/data-col/ai/C3-claude.json';

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

export const deckWithIds = (deck: DeckJson): SimpleDeck => {
  const d: SimpleDeck = deck.cards.map((card) =>
    withId({
      id: card.id,
      name: card.name,
      responsibilities: card.responsibilities.map((r) =>
        withId({ id: r.id, description: r.description, collaborators: r.collaborators.map(withId) })
      )
    })
  );
  d.prompt = deck.prompt;
  return d;
};

const asCommit = (json: DeckJson, base: SimpleDeck): SimpleDeck => {
  const out: SimpleDeck = json.cards.map((c) => {
    const o = base.find((x) => x.name == c.name);
    if (!o) return deckWithIds({ cards: [c] })[0];
    return {
      id: o.id,
      name: c.name,
      responsibilities: c.responsibilities.map((r, idx) => {
        const oResp =
          o.responsibilities.find((x) => x.description == r.description) ?? o.responsibilities[idx];
        return {
          id: oResp?.id ?? withId({}).id,
          description: r.description,
          collaborators: r.collaborators.map((c, jdx) => ({
            id: (
              oResp?.collaborators.find((x) => x.name == c.name) ??
              oResp?.collaborators[jdx] ??
              withId({})
            ).id,
            name: c.name
          }))
        };
      })
    };
  });
  out.prompt = json.prompt ?? base.prompt;
  return out;
};

export const exampleDecks: Record<string, SimpleDeck> = {
  rpg: deckWithIds(rpgJson),
  library: deckWithIds(libraryJson),
  hospital: deckWithIds(hospitalJson)
};

export const dataCollectionDecks: Record<string, SimpleDeck> = {
  mediTrack: deckWithIds(mediTrackJson),
  ecoTrack: deckWithIds(ecoTrackJson),
  libraryAI0: deckWithIds(libAI0Json),
  libraryCE0: deckWithIds(libCE0Json),
  killGod0: deckWithIds(techDebtKillGod0Json),
  makeGod0: deckWithIds(techDebtMakeGod0Json),
  casiNoAI0: deckWithIds(casiNoAI0Json),
  casiNoWeb0: deckWithIds(casiNoWeb0Json),
  casiNoCash0: deckWithIds(casiNoCash0Json),
  teamSyncAuth0: deckWithIds(teamSyncAuth0Json)
};

dataCollectionDecks.libraryAI1 = asCommit(libAI1Json, dataCollectionDecks.libraryAI0);
dataCollectionDecks.libraryCE1 = asCommit(libCE1Json, dataCollectionDecks.libraryCE0);
dataCollectionDecks.killGod1 = asCommit(techDebtKillGod1Json, dataCollectionDecks.killGod0);
dataCollectionDecks.makeGod1 = asCommit(techDebtMakeGod1Json, dataCollectionDecks.makeGod0);
dataCollectionDecks.casiNoAI1 = asCommit(casiNoAI1Json, dataCollectionDecks.casiNoAI0);
dataCollectionDecks.casiNoWeb1 = asCommit(casiNoWeb1Json, dataCollectionDecks.casiNoWeb0);
dataCollectionDecks.casiNoCash1 = asCommit(casiNoCash1Json, dataCollectionDecks.casiNoCash0);
dataCollectionDecks.teamSyncAuth1 = asCommit(teamSyncAuth1Json, dataCollectionDecks.teamSyncAuth0);

dataCollectionDecks['a1-0'] = dataCollectionDecks.libraryAI0;
dataCollectionDecks['a1-1'] = dataCollectionDecks.libraryAI1;
dataCollectionDecks['a2-0'] = dataCollectionDecks.libraryCE0;
dataCollectionDecks['a2-1'] = dataCollectionDecks.libraryCE1;
dataCollectionDecks['b1-0'] = dataCollectionDecks.killGod0;
dataCollectionDecks['b1-1'] = dataCollectionDecks.killGod1;
dataCollectionDecks['b2-0'] = dataCollectionDecks.makeGod0;
dataCollectionDecks['b2-1'] = dataCollectionDecks.makeGod1;
dataCollectionDecks['c1-0'] = dataCollectionDecks.casiNoCash0;
dataCollectionDecks['c1-1'] = dataCollectionDecks.casiNoCash1;
dataCollectionDecks['c2-0'] = dataCollectionDecks.casiNoAI0;
dataCollectionDecks['c2-1'] = dataCollectionDecks.casiNoAI1;
dataCollectionDecks['c3-0'] = dataCollectionDecks.casiNoWeb0;
dataCollectionDecks['c3-1'] = dataCollectionDecks.casiNoWeb1;
dataCollectionDecks['d1-0'] = dataCollectionDecks.teamSyncAuth0;
dataCollectionDecks['d1-1'] = dataCollectionDecks.teamSyncAuth1;

dataCollectionDecks['a1-a0'] = dataCollectionDecks['a1-0'];
dataCollectionDecks['a1-a1'] = a1cohereJson.cards as SimpleDeck;
dataCollectionDecks['a2-a0'] = dataCollectionDecks['a2-0'];
dataCollectionDecks['a2-a1'] = a2cohereJson.cards as SimpleDeck;
dataCollectionDecks['b1-a0'] = dataCollectionDecks['b1-0'];
dataCollectionDecks['b1-a1'] = b1cohereJson.cards as SimpleDeck;
dataCollectionDecks['b2-a0'] = dataCollectionDecks['b2-0'];
dataCollectionDecks['b2-a1'] = b2cohereJson.cards as SimpleDeck;
dataCollectionDecks['c1-a0'] = dataCollectionDecks['c1-0'];
dataCollectionDecks['c1-a1'] = c1cohereJson.cards as SimpleDeck;
dataCollectionDecks['c2-a0'] = dataCollectionDecks['c2-0'];
dataCollectionDecks['c2-a1'] = c2cohereJson.cards as SimpleDeck;
dataCollectionDecks['c3-a0'] = dataCollectionDecks['c3-0'];
dataCollectionDecks['c3-a1'] = c3cohereJson.cards as SimpleDeck;
dataCollectionDecks['a1-b0'] = dataCollectionDecks['a1-0'];
dataCollectionDecks['a1-b1'] = a1openaiJson.cards as SimpleDeck;
dataCollectionDecks['a2-b0'] = dataCollectionDecks['a2-0'];
dataCollectionDecks['a2-b1'] = a2openaiJson.cards as SimpleDeck;
dataCollectionDecks['b1-b0'] = dataCollectionDecks['b1-0'];
dataCollectionDecks['b1-b1'] = b1openaiJson.cards as SimpleDeck;
dataCollectionDecks['b2-b0'] = dataCollectionDecks['b2-0'];
dataCollectionDecks['b2-b1'] = b2openaiJson.cards as SimpleDeck;
dataCollectionDecks['c1-b0'] = dataCollectionDecks['c1-0'];
dataCollectionDecks['c1-b1'] = c1openaiJson.cards as SimpleDeck;
dataCollectionDecks['c2-b0'] = dataCollectionDecks['c2-0'];
dataCollectionDecks['c2-b1'] = c2openaiJson.cards as SimpleDeck;
dataCollectionDecks['c3-b0'] = dataCollectionDecks['c3-0'];
dataCollectionDecks['c3-b1'] = c3openaiJson.cards as SimpleDeck;
dataCollectionDecks['a1-c0'] = dataCollectionDecks['a1-0'];
dataCollectionDecks['a1-c1'] = a1claudeJson.cards as SimpleDeck;
dataCollectionDecks['a2-c0'] = dataCollectionDecks['a2-0'];
dataCollectionDecks['a2-c1'] = a2claudeJson.cards as SimpleDeck;
dataCollectionDecks['b1-c0'] = dataCollectionDecks['b1-0'];
dataCollectionDecks['b1-c1'] = b1claudeJson.cards as SimpleDeck;
dataCollectionDecks['b2-c0'] = dataCollectionDecks['b2-0'];
dataCollectionDecks['b2-c1'] = b2claudeJson.cards as SimpleDeck;
dataCollectionDecks['c1-c0'] = dataCollectionDecks['c1-0'];
dataCollectionDecks['c1-c1'] = c1claudeJson.cards as SimpleDeck;
dataCollectionDecks['c2-c0'] = dataCollectionDecks['c2-0'];
dataCollectionDecks['c2-c1'] = c2claudeJson.cards as SimpleDeck;
dataCollectionDecks['c3-c0'] = dataCollectionDecks['c3-0'];
dataCollectionDecks['c3-c1'] = c3claudeJson.cards as SimpleDeck;

for (const [a, b] of [['a1-a', 'lemur']]) {
  dataCollectionDecks[b + '0'] = dataCollectionDecks[a + '0'];
  dataCollectionDecks[b + '1'] = dataCollectionDecks[a + '1'];
}

export type DeckCode = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'C3' | 'D1';

export const premadeDecks: Record<string, SimpleDeck> = {
  ...exampleDecks,
  ...dataCollectionDecks
};

export function deepCopy<T extends SimpleDeck>(deck: T): T {
  const out = JSON.parse(JSON.stringify(deck)) as T;
  out.prompt = deck.prompt;
  return out;
}
