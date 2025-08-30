
'use server';

/**
 * @fileOverview A flow to test the validity of a Gemini API key.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {type GenkitErrorCode, type GenkitError} from 'genkit';

const TestApiKeyOutputSchema = z.object({
  status: z.enum(['valid', 'invalid', 'quota_exceeded', 'unchecked']),
  error: z.string().optional(),
});

export async function testApiKey(apiKey: string): Promise<z.infer<typeof TestApiKeyOutputSchema>> {
    return testApiKeyFlow(apiKey);
}

const testApiKeyFlow = ai.defineFlow(
  {
    name: 'testApiKeyFlow',
    inputSchema: z.string(),
    outputSchema: TestApiKeyOutputSchema,
  },
  async (apiKey) => {
    try {
      // Use a custom model definition to override the API key just for this flow
      const testModel = ai.model('googleai/gemini-pro', {
        requestMiddleware: async (req, next) => {
          if (!req.headers) {
              req.headers = new Headers();
          }
          req.headers.set('x-goog-api-key', apiKey);
          return await next(req);
        }
      });
      
      await ai.generate({
        model: testModel,
        prompt: 'Say "hello"', // A very simple prompt
        config: {
          // Use a very low temperature to make the response predictable and fast
          temperature: 0.1, 
        }
      });
      return { status: 'valid' };
    } catch (e) {
      const err = e as GenkitError;
      const cause = err.cause as any;
      if (err.code === ('unavailable' as GenkitErrorCode) || 
          err.code === ('resourceExhausted' as GenkitErrorCode) ||
          (cause?.status === 429)) {
        return { status: 'quota_exceeded', error: err.message };
      }
      return { status: 'invalid', error: err.message };
    }
  }
);
