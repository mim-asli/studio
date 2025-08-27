'use server';

/**
 * @fileOverview This flow allows players to ask questions to the 'game director' for insights about the game world.
 *
 * - queryGameDirector - A function that handles the query process.
 * - QueryGameDirectorInput - The input type for the queryGameDirector function.
 * - QueryGameDirectorOutput - The return type for the queryGameDirector function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QueryGameDirectorInputSchema = z.object({
  playerQuery: z.string().describe('The question the player wants to ask the game director.'),
  gameState: z.string().describe('The current game state in JSON format.'),
});
export type QueryGameDirectorInput = z.infer<typeof QueryGameDirectorInputSchema>;

const QueryGameDirectorOutputSchema = z.object({
  directorResponse: z.string().describe('The game director’s insightful answer to the player’s question.'),
});
export type QueryGameDirectorOutput = z.infer<typeof QueryGameDirectorOutputSchema>;

export async function queryGameDirector(input: QueryGameDirectorInput): Promise<QueryGameDirectorOutput> {
  return queryGameDirectorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'queryGameDirectorPrompt',
  input: {schema: QueryGameDirectorInputSchema},
  output: {schema: QueryGameDirectorOutputSchema},
  prompt: `You are the game director of an AI-driven RPG called "Dastan". A player has asked you a question about the game world.

  Here is the current game state:
  {{gameState}}

  Here is the player's question:
  {{playerQuery}}

  Provide an insightful and helpful answer from the perspective of the game director. Focus on providing hints and lore about the world.
  Respond in character as the game director, but do not reveal critical plot points that would ruin the player experience.
`,
});

const queryGameDirectorFlow = ai.defineFlow(
  {
    name: 'queryGameDirectorFlow',
    inputSchema: QueryGameDirectorInputSchema,
    outputSchema: QueryGameDirectorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
