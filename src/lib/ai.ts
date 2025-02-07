import { CHAT_API_KEY, COHERE_API_KEY, CLAUDE_API_KEY } from '$env/static/private';
import { type ValidSchema, SCHEMAS } from '$lib/types.d';
import { CohereClientV2 } from 'cohere-ai';
import { OpenAI } from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import type { MessageParam, Model } from '@anthropic-ai/sdk/resources/messages.mjs';
import { buildContentSchemaString } from '$lib/prompts';

// Add near the top of the file
const DEBUG = true;

// Export the implementations directly
export class OpenAIBackend {
  async generateObject<Type>(
    description: string,
    schema_to_select: ValidSchema,
    apiKey: string
  ): Promise<Type> {
    const SCHEMA = SCHEMAS[schema_to_select];
    const openai = new OpenAI({ apiKey: apiKey });

    const completion = await openai.beta.chat.completions.parse({
      model: 'gpt-4o-2024-08-06',
      messages: [
        {
          role: 'system',
          content:
            'You are helping create JSON objects for users. You will be given both a description and schema of the desired object.'
        },
        {
          role: 'user',
          content: buildContentSchemaString(description, schema_to_select)
        }
      ],

      response_format: {
        type: 'json_schema',
        json_schema: {
          name: schema_to_select,
          schema: SCHEMA
        }
      }
    });
    const event = completion.choices[0].message.parsed as Type;
    return event;
  }
}

export class CohereBackend {
  async generateObject<Type>(
    description: string,
    schema_to_select: ValidSchema,
    apiKey: string
  ): Promise<Type> {
    const cohere = new CohereClientV2({ token: apiKey });
    const model = 'command-r-plus';
    const messages = [
      {
        role: 'user',
        content: buildContentSchemaString(description, schema_to_select)
      }
    ];

    // todo: this is apparently not the right type, 'responseFormat' should be used...
    const response = await cohere.chat({
      model,
      messages: messages,
      response_format: {
        type: 'json_object',
        schema: SCHEMAS[schema_to_select]
      }
    });

    if (DEBUG) {
      console.log('Cohere Response:', response);
    }

    try {
      // Parse the generated text as JSON
      const jsonStr = response.message?.content?.[0].text.trim();
      if (!jsonStr) {
        throw new Error('Either message or content in response object is null');
      }
      const parsed = JSON.parse(jsonStr) as Type;
      return parsed;
    } catch (error) {
      throw new Error(`Failed to parse Cohere response as JSON: ${error}`);
    }
  }
}
export class ClaudeBackend {
  async generateObject<Type>(
    description: string,
    schema_to_select: ValidSchema,
    apiKey: string
  ): Promise<Type> {
    const claude = new Anthropic({ apiKey });
    const model: Model = 'claude-3-5-haiku-latest';
    const messages: MessageParam[] = [
      {
        role: 'user',
        content: buildContentSchemaString(description, schema_to_select)
      }
    ];

    const response = await claude.messages.create({
      model,
      max_tokens: 8000,
      temperature: 0,
      tools: [
        {
          name: 'process_deck',
          description:
            'Process a deck of Class-Responsibility-Collaborator (CRC) cards to be used in Agile software development, preserving ids where given and all properties of any unchanged cards',
          input_schema: SCHEMAS[schema_to_select]
        }
      ],
      messages
    });

    if (DEBUG) {
      console.info(`Claude Response (${response.usage.output_tokens} tkns):`, response);
    }

    try {
      // Parse the generated text as JSON
      const msg = response.content.find((c) => c.type == 'tool_use');

      const parsed = msg?.input as Type;
      if (!parsed) {
        throw new Error('Either message or content in [tool_use].input object is null');
      }
      return parsed;
    } catch (error) {
      throw new Error(`Failed to parse Cohere response as JSON: ${error}`);
    }
  }
}

// Create instances of the backends
export const BACKENDS = {
  cohere: {
    apiKey: COHERE_API_KEY,
    backend: new CohereBackend()
  },
  openai: {
    apiKey: CHAT_API_KEY,
    backend: new OpenAIBackend()
  },
  claude: {
    apiKey: CLAUDE_API_KEY,
    backend: new ClaudeBackend()
  }
};
