import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { z } from 'zod';
import type { SimpleCard } from './types';

// type VersionEnum = 'serialized-0.1' | 'internal-0.1';

// interface Serializer {
//   version: VersionEnum;
//   schema: z.ZodType;
// }

const submissionV1Serializer = {
  version: 'serialized-0.1',
  schema: z.object({}).catchall(
    z.array(
      z.object({
        description: z.string(),
        collaborators: z.array(z.string())
      })
    )
  )
};
// type Submission = z.infer<typeof submissionV1Serializer.schema>;

const simpleCardsSerializer = {
  version: 'internal-0.1',
  schema: z.array(
    z.object({
      id: z.number(),
      name: z.string().regex(/[A-Z]\w*/),
      responsibilities: z.array(
        z.object({
          id: z.number(),
          description: z.string().nonempty(),
          collaborators: z.array(z.object({ id: z.number(), name: z.string().nonempty() }))
        })
      )
    })
  )
};

// type Internal = z.infer<typeof simpleCardsSerializer.schema>;

export const deckToSubmission = (deck: SimpleCard[]): string =>
  stringifyYaml({
    version: submissionV1Serializer.version,
    data: Object.fromEntries(
      deck.map((card) => [
        card.name,
        card.responsibilities.map((r) => ({
          description: r.description,
          collaborators: r.collaborators.map(({ name }) => name)
        }))
      ])
    )
  });
