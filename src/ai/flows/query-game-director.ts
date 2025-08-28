'use server';

/**
 * @fileOverview This flow allows players to ask questions to the 'game director' for insights about the game world.
 *
 * - queryGameDirector - A function that handles the query process.
 * - QueryGameDirectorInput - The input type for the queryGameDirector function.
 * - QueryGameDirectorOutput - The return type for the queryGameDirector function.
 */

import {ai} from '@/ai/genkit';
import { QueryGameDirectorInputSchema, QueryGameDirectorOutputSchema, type QueryGameDirectorInput, type QueryGameDirectorOutput } from '@/lib/types';


export async function queryGameDirector(input: QueryGameDirectorInput): Promise<QueryGameDirectorOutput> {
  return queryGameDirectorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'queryGameDirectorPrompt',
  input: {schema: QueryGameDirectorInputSchema},
  output: {schema: QueryGameDirectorOutputSchema},
  prompt: `You are the game director of an AI-driven RPG called "Dastan". A player has paused the game to ask you a question about the game world. Your persona is helpful, knowledgeable, and a bit mysterious, like a good Dungeon Master.

  The player's message history with you is provided, use it to understand the context of the current question.
  {{#if conversationHistory}}
  Conversation History:
  {{#each conversationHistory}}
  - {{role}}: {{content}}
  {{/each}}
  {{/if}}

  Here is the current game state:
  {{gameState}}

  Here is the player's latest question:
  {{playerQuery}}

  Provide an insightful and helpful answer from the perspective of the game director. Focus on providing hints and lore about the world.
  Respond in character as the game director, but do not reveal critical plot points that would ruin the player experience.
  Your response must be in Persian (Farsi).
  
  Additionally, if the player asks about the potential outcome of an action they did not take ("what if" questions), provide a creative and interesting response. Speculate on what might have happened. This is an opportunity to show the complexity of the world and the consequences of choices.
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
