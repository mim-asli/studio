
'use server';

/**
 * @fileOverview A simple flow to test if a Gemini API key is valid.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'zod';
import { GenkitError } from 'genkit';

const TestApiKeyInputSchema = z.object({
  apiKey: z.string().describe("The API key to test."),
});

const TestApiKeyOutputSchema = z.object({
  status: z.enum(['valid', 'invalid', 'quota_exceeded']),
  message: z.string(),
});

export async function testApiKey(apiKey: string): Promise<z.infer<typeof TestApiKeyOutputSchema>> {
  return testApiKeyFlow({ apiKey });
}

const testApiKeyFlow = ai.defineFlow(
  {
    name: 'testApiKeyFlow',
    inputSchema: TestApiKeyInputSchema,
    outputSchema: TestApiKeyOutputSchema,
  },
  async ({ apiKey }) => {
    try {
      // Use a lightweight model and a simple prompt for testing
      const llm = googleAI.model('gemini-2.5-flash');
      
      const req = {
        input: {
          prompt: 'test',
        },
      };

      // Manually set the API key for this specific request
      req.config = {
        ...req.config,
        requestOptions: {
            headers: {
                'x-goog-api-key': apiKey,
            }
        }
      }
      
      // @ts-ignore - We are manually constructing a request which is not standard
      await ai.generate({
        model: llm,
        prompt: 'test',
        config: {
            requestOptions: {
                headers: { 'x-goog-api-key': apiKey }
            }
        }
      });
      
      return {
        status: 'valid',
        message: 'Key is valid and has quota.',
      };

    } catch (e) {
      const err = e as GenkitError;
      const cause = err.cause as any;

      if (cause?.status === 429) {
        return {
          status: 'quota_exceeded',
          message: 'The API key is valid, but has exceeded its quota.',
        };
      }
      
      // Any other error is considered invalid
      return {
        status: 'invalid',
        message: `The API key is invalid. Raw error: ${err.message}`,
      };
    }
  }
);
