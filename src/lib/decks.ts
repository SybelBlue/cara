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
import a1sonnetJson from '$lib/crc-decks/data-col/ai/A1-sonnet.json';
import a2sonnetJson from '$lib/crc-decks/data-col/ai/A2-sonnet.json';
import b1sonnetJson from '$lib/crc-decks/data-col/ai/B1-sonnet.json';
import b2sonnetJson from '$lib/crc-decks/data-col/ai/B2-sonnet.json';
import c1sonnetJson from '$lib/crc-decks/data-col/ai/C1-sonnet.json';
import c2sonnetJson from '$lib/crc-decks/data-col/ai/C2-sonnet.json';
import c3sonnetJson from '$lib/crc-decks/data-col/ai/C3-sonnet.json';
import a1haikuJson from '$lib/crc-decks/data-col/ai/A1-haiku.json';
import a2haikuJson from '$lib/crc-decks/data-col/ai/A2-haiku.json';
import b1haikuJson from '$lib/crc-decks/data-col/ai/B1-haiku.json';
import b2haikuJson from '$lib/crc-decks/data-col/ai/B2-haiku.json';
import c1haikuJson from '$lib/crc-decks/data-col/ai/C1-haiku.json';
import c2haikuJson from '$lib/crc-decks/data-col/ai/C2-haiku.json';
import c3haikuJson from '$lib/crc-decks/data-col/ai/C3-haiku.json';

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

dataCollectionDecks['a1-h0'] = dataCollectionDecks.libraryAI0;
dataCollectionDecks['a1-h1'] = dataCollectionDecks.libraryAI1;
dataCollectionDecks['a2-h0'] = dataCollectionDecks.libraryCE0;
dataCollectionDecks['a2-h1'] = dataCollectionDecks.libraryCE1;
dataCollectionDecks['b1-h0'] = dataCollectionDecks.killGod0;
dataCollectionDecks['b1-h1'] = dataCollectionDecks.killGod1;
dataCollectionDecks['b2-h0'] = dataCollectionDecks.makeGod0;
dataCollectionDecks['b2-h1'] = dataCollectionDecks.makeGod1;
dataCollectionDecks['c1-h0'] = dataCollectionDecks.casiNoCash0;
dataCollectionDecks['c1-h1'] = dataCollectionDecks.casiNoCash1;
dataCollectionDecks['c2-h0'] = dataCollectionDecks.casiNoAI0;
dataCollectionDecks['c2-h1'] = dataCollectionDecks.casiNoAI1;
dataCollectionDecks['c3-h0'] = dataCollectionDecks.casiNoWeb0;
dataCollectionDecks['c3-h1'] = dataCollectionDecks.casiNoWeb1;
dataCollectionDecks['d1-h0'] = dataCollectionDecks.teamSyncAuth0;
dataCollectionDecks['d1-h1'] = dataCollectionDecks.teamSyncAuth1;

const asAICommit = (json: DeckJson, base: SimpleDeck): SimpleDeck => {
  const out = json.cards as SimpleDeck;
  // todo: new cards sometimes don't have ids!?
  out.prompt = json.prompt ?? base.prompt;
  return out;
};

dataCollectionDecks['a1-z0'] = dataCollectionDecks['a1-h0'];
dataCollectionDecks['a1-z1'] = asAICommit(a1cohereJson, dataCollectionDecks['a1-h0']);
dataCollectionDecks['a2-z0'] = dataCollectionDecks['a2-h0'];
dataCollectionDecks['a2-z1'] = asAICommit(a2cohereJson, dataCollectionDecks['a2-h0']);
dataCollectionDecks['b1-z0'] = dataCollectionDecks['b1-h0'];
dataCollectionDecks['b1-z1'] = asAICommit(b1cohereJson, dataCollectionDecks['b1-h0']);
dataCollectionDecks['b2-z0'] = dataCollectionDecks['b2-h0'];
dataCollectionDecks['b2-z1'] = asAICommit(b2cohereJson, dataCollectionDecks['b2-h0']);
dataCollectionDecks['c1-z0'] = dataCollectionDecks['c1-h0'];
dataCollectionDecks['c1-z1'] = asAICommit(c1cohereJson, dataCollectionDecks['c1-h0']);
dataCollectionDecks['c2-z0'] = dataCollectionDecks['c2-h0'];
dataCollectionDecks['c2-z1'] = asAICommit(c2cohereJson, dataCollectionDecks['c2-h0']);
dataCollectionDecks['c3-z0'] = dataCollectionDecks['c3-h0'];
dataCollectionDecks['c3-z1'] = asAICommit(c3cohereJson, dataCollectionDecks['c3-h0']);
dataCollectionDecks['a1-y0'] = dataCollectionDecks['a1-h0'];
dataCollectionDecks['a1-y1'] = asAICommit(a1openaiJson, dataCollectionDecks['a1-h0']);
dataCollectionDecks['a2-y0'] = dataCollectionDecks['a2-h0'];
dataCollectionDecks['a2-y1'] = asAICommit(a2openaiJson, dataCollectionDecks['a2-h0']);
dataCollectionDecks['b1-y0'] = dataCollectionDecks['b1-h0'];
dataCollectionDecks['b1-y1'] = asAICommit(b1openaiJson, dataCollectionDecks['b1-h0']);
dataCollectionDecks['b2-y0'] = dataCollectionDecks['b2-h0'];
dataCollectionDecks['b2-y1'] = asAICommit(b2openaiJson, dataCollectionDecks['b2-h0']);
dataCollectionDecks['c1-y0'] = dataCollectionDecks['c1-h0'];
dataCollectionDecks['c1-y1'] = asAICommit(c1openaiJson, dataCollectionDecks['c1-h0']);
dataCollectionDecks['c2-y0'] = dataCollectionDecks['c2-h0'];
dataCollectionDecks['c2-y1'] = asAICommit(c2openaiJson, dataCollectionDecks['c2-h0']);
dataCollectionDecks['c3-y0'] = dataCollectionDecks['c3-h0'];
dataCollectionDecks['c3-y1'] = asAICommit(c3openaiJson, dataCollectionDecks['c3-h0']);
dataCollectionDecks['a1-x0'] = dataCollectionDecks['a1-h0'];
dataCollectionDecks['a1-x1'] = asAICommit(a1sonnetJson, dataCollectionDecks['a1-h0']);
dataCollectionDecks['a2-x0'] = dataCollectionDecks['a2-h0'];
dataCollectionDecks['a2-x1'] = asAICommit(a2sonnetJson, dataCollectionDecks['a2-h0']);
dataCollectionDecks['b1-x0'] = dataCollectionDecks['b1-h0'];
dataCollectionDecks['b1-x1'] = asAICommit(b1sonnetJson, dataCollectionDecks['b1-h0']);
dataCollectionDecks['b2-x0'] = dataCollectionDecks['b2-h0'];
dataCollectionDecks['b2-x1'] = asAICommit(b2sonnetJson, dataCollectionDecks['b2-h0']);
dataCollectionDecks['c1-x0'] = dataCollectionDecks['c1-h0'];
dataCollectionDecks['c1-x1'] = asAICommit(c1sonnetJson, dataCollectionDecks['c1-h0']);
dataCollectionDecks['c2-x0'] = dataCollectionDecks['c2-h0'];
dataCollectionDecks['c2-x1'] = asAICommit(c2sonnetJson, dataCollectionDecks['c2-h0']);
dataCollectionDecks['c3-x0'] = dataCollectionDecks['c3-h0'];
dataCollectionDecks['c3-x1'] = asAICommit(c3sonnetJson, dataCollectionDecks['c3-h0']);
dataCollectionDecks['a1-w0'] = dataCollectionDecks['a1-h0'];
dataCollectionDecks['a1-w1'] = asAICommit(a1haikuJson, dataCollectionDecks['a1-h0']);
dataCollectionDecks['a2-w0'] = dataCollectionDecks['a2-h0'];
dataCollectionDecks['a2-w1'] = asAICommit(a2haikuJson, dataCollectionDecks['a2-h0']);
dataCollectionDecks['b1-w0'] = dataCollectionDecks['b1-h0'];
dataCollectionDecks['b1-w1'] = asAICommit(b1haikuJson, dataCollectionDecks['b1-h0']);
dataCollectionDecks['b2-w0'] = dataCollectionDecks['b2-h0'];
dataCollectionDecks['b2-w1'] = asAICommit(b2haikuJson, dataCollectionDecks['b2-h0']);
dataCollectionDecks['c1-w0'] = dataCollectionDecks['c1-h0'];
dataCollectionDecks['c1-w1'] = asAICommit(c1haikuJson, dataCollectionDecks['c1-h0']);
dataCollectionDecks['c2-w0'] = dataCollectionDecks['c2-h0'];
dataCollectionDecks['c2-w1'] = asAICommit(c2haikuJson, dataCollectionDecks['c2-h0']);
dataCollectionDecks['c3-w0'] = dataCollectionDecks['c3-h0'];
dataCollectionDecks['c3-w1'] = asAICommit(c3haikuJson, dataCollectionDecks['c3-h0']);

type DeckCode = 'a' | 'b' | 'c';
export type ProblemCode = `${DeckCode}${1 | 2}` | 'c3';
type AgentCode = 'h' | 'w' | 'x' | 'y' | 'z';
type SolutionStub = `${ProblemCode}-${AgentCode}`;

const animalMap: Record<string, SolutionStub> = {
  bear: 'b1-w',
  camel: 'b1-x',
  cheetah: 'b2-h',
  deer: 'b1-z',
  eagle: 'b1-y',
  ferret: 'c1-y',
  fox: 'c1-w',
  gecko: 'a2-x',
  goat: 'c3-w',
  hare: 'a2-w',
  hawk: 'a1-y',
  iguana: 'c3-y',
  jaguar: 'b2-z',
  koala: 'a1-x',
  lemur: 'c3-x',
  mole: 'b2-x',
  newt: 'b2-y',
  octopus: 'b1-h',
  otter: 'a2-z',
  panda: 'c2-z',
  quail: 'c1-z',
  rabbit: 'a1-w',
  rhino: 'c3-h',
  seal: 'b2-w',
  snake: 'c2-x',
  squid: 'a1-h',
  tiger: 'c3-z',
  turtle: 'c1-h',
  vole: 'a1-z',
  vulture: 'a2-h',
  weasel: 'a2-y',
  xerus: 'c2-y',
  yak: 'c1-x',
  walrus: 'c2-h',
  zebra: 'c2-w'
};

for (const [animal, stub] of Object.entries(animalMap)) {
  dataCollectionDecks[animal + '-0'] = dataCollectionDecks[stub + '0'];
  dataCollectionDecks[animal + '-1'] = dataCollectionDecks[stub + '1'];
}

export const premadeDecks: Record<string, SimpleDeck> = {
  ...exampleDecks,
  ...dataCollectionDecks
};

export function deepCopy<T extends SimpleDeck>(deck: T): T {
  const out = JSON.parse(JSON.stringify(deck)) as T;
  out.prompt = deck.prompt;
  return out;
}
