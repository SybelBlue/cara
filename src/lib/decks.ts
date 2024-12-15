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
import godKill0Json from '$lib/crc-decks/data-col/technical-debt-kill-god0.json';
import godKill1Json from '$lib/crc-decks/data-col/technical-debt-kill-god1.json';
import godMake0Json from '$lib/crc-decks/data-col/technical-debt-make-god0.json';
import godMake1Json from '$lib/crc-decks/data-col/technical-debt-make-god1.json';
import noAI0Json from '$lib/crc-decks/data-col/casiNoAI0.json';
import noAI1Json from '$lib/crc-decks/data-col/casiNoAI1.json';
import noWeb0Json from '$lib/crc-decks/data-col/casiNoWeb0.json';
import noWeb1Json from '$lib/crc-decks/data-col/casiNoWeb1.json';
import noCash0Json from '$lib/crc-decks/data-col/casiNoCash0.json';
import noCash1Json from '$lib/crc-decks/data-col/casiNoCash1.json';
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

// assumed that this does not rely on nextId or deckWithIds!
const asAICommit = (json: DeckJson, base: SimpleDeck): SimpleDeck => {
  const out = json.cards as SimpleDeck;
  // todo: new cards sometimes don't have ids!?
  out.prompt = json.prompt ?? base.prompt;
  return out;
};

export const exampleDecks: Record<string, SimpleDeck> = {
  rpg: deckWithIds(rpgJson),
  library: deckWithIds(libraryJson),
  hospital: deckWithIds(hospitalJson)
};

type DeckCode = 'a' | 'b' | 'c';
export type ProblemCode = `${DeckCode}${'1' | '2'}` | 'c3';
type AgentCode = 'h' | 'w' | 'x' | 'y' | 'z';
type SolutionCode = { problem: ProblemCode; agent: AgentCode };

///////////////  DO NOT EDIT, BREAKS MAGIC ORDERING ////////////////////////////////
deckWithIds(mediTrackJson);
deckWithIds(ecoTrackJson);
// console.warn(nextId); // should print 426
const problemStartDecks: Record<ProblemCode, SimpleDeck> = {
  a1: deckWithIds(libAI0Json),
  a2: deckWithIds(libCE0Json),
  b1: deckWithIds(godKill0Json),
  b2: deckWithIds(godMake0Json),
  /** DO NOT REORDER!!  */
  c2: deckWithIds(noWeb0Json),
  c3: deckWithIds(noCash0Json),
  c1: deckWithIds(noAI0Json)
  /** RESIST TEMPTATION, BREAKS EVERYTHING!!  */
};
const tsa0 = deckWithIds(teamSyncAuth0Json);
// console.warn(nextId); // should print 1037
const humanSolutionDecks: Record<ProblemCode, SimpleDeck> = {
  a1: asCommit(libAI1Json, problemStartDecks['a1']),
  a2: asCommit(libCE1Json, problemStartDecks['a2']),
  b1: asCommit(godKill1Json, problemStartDecks['b1']),
  b2: asCommit(godMake1Json, problemStartDecks['b2']),
  c1: asCommit(noAI1Json, problemStartDecks['c1']),
  c2: asCommit(noWeb1Json, problemStartDecks['c2']),
  c3: (() => {
    const out = asCommit(noCash1Json, problemStartDecks['c3']);
    asCommit(teamSyncAuth1Json, tsa0);
    return out;
  })()
};
// console.warn(nextId); // should print 1092
///////////////  DO NOT EDIT, BREAKS MAGIC ORDERING ////////////////////////////////

const agentSolutionDecks: Record<AgentCode, Record<ProblemCode, SimpleDeck>> = {
  h: humanSolutionDecks,
  z: {
    a1: asAICommit(a1cohereJson, problemStartDecks['a1']),
    a2: asAICommit(a2cohereJson, problemStartDecks['a2']),
    b1: asAICommit(b1cohereJson, problemStartDecks['b1']),
    b2: asAICommit(b2cohereJson, problemStartDecks['b2']),
    c1: asAICommit(c1cohereJson, problemStartDecks['c1']),
    c2: asAICommit(c2cohereJson, problemStartDecks['c2']),
    c3: asAICommit(c3cohereJson, problemStartDecks['c3'])
  },
  y: {
    a1: asAICommit(a1openaiJson, problemStartDecks['a1']),
    a2: asAICommit(a2openaiJson, problemStartDecks['a2']),
    b1: asAICommit(b1openaiJson, problemStartDecks['b1']),
    b2: asAICommit(b2openaiJson, problemStartDecks['b2']),
    c1: asAICommit(c1openaiJson, problemStartDecks['c1']),
    c2: asAICommit(c2openaiJson, problemStartDecks['c2']),
    c3: asAICommit(c3openaiJson, problemStartDecks['c3'])
  },
  x: {
    a1: asAICommit(a1sonnetJson, problemStartDecks['a1']),
    a2: asAICommit(a2sonnetJson, problemStartDecks['a2']),
    b1: asAICommit(b1sonnetJson, problemStartDecks['b1']),
    b2: asAICommit(b2sonnetJson, problemStartDecks['b2']),
    c1: asAICommit(c1sonnetJson, problemStartDecks['c1']),
    c2: asAICommit(c2sonnetJson, problemStartDecks['c2']),
    c3: asAICommit(c3sonnetJson, problemStartDecks['c3'])
  },
  w: {
    a1: asAICommit(a1haikuJson, problemStartDecks['a1']),
    a2: asAICommit(a2haikuJson, problemStartDecks['a2']),
    b1: asAICommit(b1haikuJson, problemStartDecks['b1']),
    b2: asAICommit(b2haikuJson, problemStartDecks['b2']),
    c1: asAICommit(c1haikuJson, problemStartDecks['c1']),
    c2: asAICommit(c2haikuJson, problemStartDecks['c2']),
    c3: asAICommit(c3haikuJson, problemStartDecks['c3'])
  }
};

const animalMap: Record<string, SolutionCode> = {
  bear: { problem: 'b1', agent: 'w' },
  camel: { problem: 'b1', agent: 'x' },
  cheetah: { problem: 'b2', agent: 'h' },
  deer: { problem: 'b1', agent: 'z' },
  eagle: { problem: 'b1', agent: 'y' },
  ferret: { problem: 'c1', agent: 'y' },
  fox: { problem: 'c1', agent: 'w' },
  gecko: { problem: 'a2', agent: 'x' },
  goat: { problem: 'c3', agent: 'w' },
  hare: { problem: 'a2', agent: 'w' },
  hawk: { problem: 'a1', agent: 'y' },
  iguana: { problem: 'c3', agent: 'y' },
  jaguar: { problem: 'b2', agent: 'z' },
  koala: { problem: 'a1', agent: 'x' },
  lemur: { problem: 'c3', agent: 'x' },
  mole: { problem: 'b2', agent: 'x' },
  newt: { problem: 'b2', agent: 'y' },
  octopus: { problem: 'b1', agent: 'h' },
  otter: { problem: 'a2', agent: 'z' },
  panda: { problem: 'c2', agent: 'z' },
  quail: { problem: 'c1', agent: 'z' },
  rabbit: { problem: 'a1', agent: 'w' },
  rhino: { problem: 'c3', agent: 'h' },
  seal: { problem: 'b2', agent: 'w' },
  snake: { problem: 'c2', agent: 'x' },
  squid: { problem: 'a1', agent: 'h' },
  tiger: { problem: 'c3', agent: 'z' },
  turtle: { problem: 'c1', agent: 'h' },
  vole: { problem: 'a1', agent: 'z' },
  vulture: { problem: 'a2', agent: 'h' },
  weasel: { problem: 'a2', agent: 'y' },
  xerus: { problem: 'c2', agent: 'y' },
  yak: { problem: 'c1', agent: 'x' },
  walrus: { problem: 'c2', agent: 'h' },
  zebra: { problem: 'c2', agent: 'w' }
};

const dataCollectionDecks: Record<string, SimpleDeck> = {};
for (const [animal, stub] of Object.entries(animalMap)) {
  dataCollectionDecks[animal + '-0'] = dataCollectionDecks[`${stub.problem}-${stub.agent}-0`] =
    problemStartDecks[stub.problem];
  dataCollectionDecks[animal + '-1'] = dataCollectionDecks[`${stub.problem}-${stub.agent}-1`] =
    agentSolutionDecks[stub.agent][stub.problem];
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
