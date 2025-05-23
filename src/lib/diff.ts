import type { Card, SimpleCard, Key, DiffText } from '$lib/types';
import { withId } from '$lib/decks';
import { diffWords, type Change } from 'diff';
import { any, mergeKeyed } from './common';

type SimpleResponsibility = SimpleCard['responsibilities'][number];

const diffResponsibilities = (
  prev: SimpleResponsibility[],
  curr: SimpleResponsibility[],
  expandUnchanged: boolean
): Card['responsibilities'] => {
  const change = {
    added: (value: string): Change => ({ removed: false, added: true, value }),
    removed: (value: string): Change => ({ removed: true, added: false, value }),
    none: (value: string): Change => ({ removed: false, added: false, value })
  };
  const diffResponsibility = (
    id: Key,
    resp: SimpleResponsibility,
    changeFn: (_: string) => Change
  ) => ({
    id,
    description: [changeFn(resp.description)],
    collaborators: resp.collaborators.map(({ id, name }) => ({ id, name: [changeFn(name)] })),
    sortKey: -1
  });

  let omitted = false;
  const merged = mergeKeyed(prev, curr, (o) => o.id);
  const out = merged.flatMap((z) => {
    switch (z.type) {
      case 'left':
        return [diffResponsibility(z.id, z.left, change.removed)];
      case 'right':
        return [diffResponsibility(z.id, z.right, change.added)];
      case 'both': {
        const description =
          // check avoids a no-change diff from appearing
          z.left.description === z.right.description
            ? z.left.description
            : diffWords(z.left.description, z.right.description);
        const collaborators = mergeKeyed(
          z.left.collaborators,
          z.right.collaborators,
          (o) => o.name
        ).map(({ type, id: name }) => {
          switch (type) {
            case 'left':
              return withId({ name: [change.removed(name)] });
            case 'right':
              return withId({ name: [change.added(name)] });
            case 'both':
              return withId({ name });
          }
        });
        const changed = isDiff(description) || any(collaborators, (c) => isDiff(c.name));
        const diffed = { id: z.id, description, collaborators, sortKey: changed ? -1 : 0 };
        const omit = !expandUnchanged && merged.length > 2 && changed;
        omitted ||= omit;
        return omit ? [] : [diffed];
      }
    }
  });
  if (omitted) {
    out.push(withId({ description: '...', collaborators: [], sortKey: 1 }));
  }
  return out;
};

export const diffDecks = (
  prev: SimpleCard[],
  curr: SimpleCard[],
  expandUnchanged: boolean
): Card[] => {
  return mergeKeyed(prev, curr, (o) => o.id).map((z) => ({
    id: z.id,
    name: z.type == 'left' ? z.left.name : z.right.name,
    responsibilities: diffResponsibilities(
      z.left?.responsibilities ?? [],
      z.right?.responsibilities ?? [],
      expandUnchanged
    )
  }));
};

export const undiffWords = (d: DiffText) =>
  isDiff(d)
    ? d
        .filter((c) => !c.removed)
        .map((c) => c.value)
        .join('')
    : d;

export const isDiff = (d: DiffText) => Array.isArray(d);

export const hasDiff = (c: Card) =>
  isDiff(c.name) ||
  any(
    c.responsibilities,
    (r) => isDiff(r.description) || any(r.collaborators, (c) => isDiff(c.name))
  );

export { type Change, diffWords };
