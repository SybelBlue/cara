export type Key = number;
export type Keyed<T> = T & { id: Key };

export type Message = {
  role: string;
  content: string;
};

export type ChatRequest = {
  sysprompt: string;
  messages: Array<Message>;
};

export type GenerationRequest = {
  description: string;
  schema: ValidSchema;
};

export type JSONSchema = {
  type: string;
  description: string;
  [key: string]: Schema;
  // items?: Schema;
  // properties?: {[key: string]: Schema;};
};

const CARD_SCHEMA = {
  type: 'object',
  description:
    'A single Class-Responsibility-Collaborator (CRC) card to be used in Agile software development',
  properties: {
    name: {
      type: 'string',
      description: 'The name of the resource, e.g. Library'
    },
    responsibilities: {
      type: 'array',
      items: {
        type: 'string',
        description:
          'The responsibilities that the resource has, e.g. Maintains a ledger of library cards'
      }
    },
    collaborators: {
      type: 'array',
      items: {
        type: 'string',
        description: 'The collaborating resources for this resource, e.g. LibraryCard'
      }
    }
  },
  additionalProperties: false
};

const DECK_SCHEMA = {
  type: 'object',
  description:
    'A deck of Class-Responsibility-Collaborator (CRC) cards to be used in Agile software development',
  properties: {
    cards: {
      type: 'array',
      items: CARD_SCHEMA
    }
  },
  additionalProperties: false
};

export type ValidSchema = 'Card' | 'Deck';
export const SCHEMAS = {
  Card: CARD_SCHEMA,
  Deck: DECK_SCHEMA
};

export const TYPEDEFS = {
  Card: `
{
  name: string,
  responsibilities: Array<string>,
  collaborators: Array<string>
}
`.trim(),
  Deck: `
{
  cards: Array<{
    name: string,
    responsibilities: Array<string>,
    collaborators: Array<string>
  }>
}
`.trim()
};
