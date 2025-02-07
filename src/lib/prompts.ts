import type { DeckJson, SimpleCard, ValidSchema } from '$lib/types.d';
import { SCHEMAS, TYPEDEFS } from '$lib/types.d';

function buildContentSchemaString(description: string, schema: ValidSchema): string {
    const SCHEMA = SCHEMAS[schema];
    const TYPEDEF = TYPEDEFS[schema];
    const content = `Given the following description and type definition, please generate an object.
\`\`\`description
${description}
\`\`\`

\`\`\`typedef
${TYPEDEF}
\`\`\`
Please respond with JSON in the following schema: ${JSON.stringify(SCHEMA)}`;

    return content;
};

const buildUpsertCardPrompt = (card: SimpleCard, deck: DeckJson, message: string): string => {
    const prompt = `Consider this deck:
\`\`\`json
${JSON.stringify({cards: deck.cards})}
\`\`\`

Given that we are now upserting the following card, describing the change as "${message}", update both the collaborators on this card and the whole deck to remain consistent. This may involve removing or adding responsibilities, their respective lists of collaborators, or even adding or removing whole cards. Make sure to reproduce all unchanged cards.
\`\`\`json
${JSON.stringify(card)}
\`\`\``;

    return prompt;
}

const buildSolveTaskPrompt = (task: string, deck: DeckJson): string => {
    const prompt = `You are a highly competent software engineer.

Consider this deck represented in JSON:
\`\`\`json
${JSON.stringify({cards: deck.cards})}
\`\`\`

Given the following instructions and type definition, produce the JSON of the resulting deck.
\`\`\`instructions
${task}
\`\`\`

\`\`\`typedef
${TYPEDEFS['Deck']}
\`\`\`
`
    return prompt;
}

export {
    buildContentSchemaString,
    buildUpsertCardPrompt,
    buildSolveTaskPrompt
};
