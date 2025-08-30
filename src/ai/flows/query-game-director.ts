
'use server';

/**
 * @fileOverview This flow allows players to ask questions to the 'game director' for insights about the game world.
 *
 * - queryGameDirector - A function that handles the query process.
 * - QueryGameDirectorInput - The input type for the queryGameDirector function.
 * - QueryGameDirectorOutput - The return type for the queryGameDirector function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import type { QueryGameDirectorInput, QueryGameDirectorOutput, DirectorMessage } from '@/lib/types';
import { queryGameDirectorPrompt } from '../prompts/query-game-director-prompt';


// Schemas for queryGameDirector flow
const QueryGameDirectorInputSchema = z.object({
  playerQuery: z.string().describe('The question the player wants to ask the game director.'),
  gameState: z.string().describe('The current game state in JSON format.'),
  conversationHistory: z.custom<DirectorMessage[]>().optional().describe('The history of the conversation so far.'),
  apiKey: z.string().optional(),
});

const QueryGameDirectorOutputSchema = z.object({
  directorResponse: z.string().describe('The game director’s insightful answer to the player’s question.'),
});


export async function queryGameDirector(input: QueryGameDirectorInput & { apiKey?: string }): Promise<QueryGameDirectorOutput> {
  return queryGameDirectorFlow(input);
}

const queryGameDirectorFlow = ai.defineFlow(
  {
    name: 'queryGameDirectorFlow',
    inputSchema: QueryGameDirectorInputSchema,
    outputSchema: QueryGameDirectorOutputSchema,
  },
  async ({apiKey, ...input}) => {
    const model = apiKey ? ai.model('googleai/gemini-pro', { requestMiddleware: (req, next) => {
        if (!req.headers) req.headers = new Headers();
        req.headers.set('x-goog-api-key', apiKey);
        return next(req);
    }}) : ai.model('googleai/gemini-pro');

    const {output} = await ai.run(queryGameDirectorPrompt, {input, model});
    return output!;
  }
);
