import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { z } from 'zod';
import type { SimpleCard } from './types';
import { deckWithIds } from './decks';

// type VersionEnum = 'serialized-0.1' | 'internal-0.1';

// interface Serializer {
//   version: VersionEnum;
//   schema: z.ZodType;
// }

const serialziedDataScheme = z.object({
  version: z.string(),
  data: z.any()
});

const submissionV1Serializer = {
  version: 'serialized-0.1',
  schema: z.object({
    cards: z.object({}).catchall(
      z.array(
        z.object({
          description: z.string(),
          collaborators: z.array(z.string())
        })
      )
    ),
    name: z.optional(z.string())
  })
};
type Submission = z.infer<typeof submissionV1Serializer.schema>;

// const simpleCardsSerializer = {
//   version: 'internal-0.1',
//   schema: z.array(
//     z.object({
//       id: z.number(),
//       name: z.string().regex(/[A-Z]\w*/),
//       responsibilities: z.array(
//         z.object({
//           id: z.number(),
//           description: z.string().nonempty(),
//           collaborators: z.array(z.object({ id: z.number(), name: z.string().nonempty() }))
//         })
//       )
//     })
//   )
// };

const currentSerializer = submissionV1Serializer;

export const deckToSubmission = (deck: SimpleCard[]): string => {
  const submission: Submission = {
    cards: Object.fromEntries(
      deck.map((card) => [
        card.name,
        card.responsibilities.map((r) => ({
          description: r.description,
          collaborators: r.collaborators.map(({ name }) => name)
        }))
      ])
    )
  };
  return stringifyYaml({
    version: currentSerializer.version,
    data: submission
  });
};

export const submissionToDeck = async (yamlText: string): Promise<SimpleCard[]> => {
  const obj = parseYaml(yamlText);
  const p0 = await serialziedDataScheme.safeParseAsync(obj);
  if (!p0.success) return Promise.reject('yaml parsing failed');
  const { version, data } = p0.data;
  if (version !== currentSerializer.version)
    return Promise.reject(
      `version mismatch: expected ${currentSerializer.version} but got ${version}`
    );
  const p1 = await currentSerializer.schema.safeParseAsync(data);
  if (!p1.success) return Promise.reject(`serializer with ver ${currentSerializer.version} failed`);
  const submission: Submission = p1.data;
  return deckWithIds({
    cards: Object.entries(submission.cards).map(([name, rs]) => ({
      name,
      responsibilities: rs.map((r) => ({
        description: r.description,
        collaborators: r.collaborators.map((name) => ({ name }))
      }))
    }))
  });
};
