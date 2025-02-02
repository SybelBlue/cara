import { SCHEMAS, TYPEDEFS, type ValidSchema } from '$lib/types.d';

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

export { buildContentSchemaString };
