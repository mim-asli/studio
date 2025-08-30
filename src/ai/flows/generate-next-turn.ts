
'use server';

/**
 * @fileOverview Generates the next turn of the Dastan AI RPG story.
 *
 * - generateNextTurn - A function that generates the next turn of the story.
 * - GenerateNextTurnInput - The input type for the generateNextTurn function's gameState property.
 * - GenerateNextTurnOutput - The return type for the generateNextTurn function.
 */

import type { GenerateNextTurnInput, GenerateNextTurnOutput } from '@/lib/types';
import { generateNextTurnPrompt } from '../prompts/generate-next-turn-prompt';
import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { PlayerStateSchema, WorldStateSchema, ActiveEffectSchema, EnemySchema } from '@/lib/types';

// Re-defining schemas here to use in the flow definition.
// This doesn't affect the prompt itself but is needed for ai.defineFlow.
const GenerateNextTurnInputSchema = z.object({
  gameState: z.string(),
  playerAction: z.string(),
  difficulty: z.string().optional(),
  gmPersonality: z.string().optional(),
  apiKey: z.string().optional(),
});

const GenerateNextTurnOutputSchema = z.object({
  story: z.string(),
  playerState: PlayerStateSchema,
  inventory: z.array(z.string()),
  skills: z.array(z.string()),
  quests: z.array(z.string()),
  choices: z.array(z.string()),
  worldState: WorldStateSchema,
  newCharacter: z.string().optional(),
  newQuest: z.string().optional(),
  currentLocation: z.string(),
  newLocation: z.string().optional(),
  discoveredLocations: z.array(z.string()),
  globalEvent: z.string().optional(),
  sceneEntities: z.array(z.string()),
  companions: z.array(z.string()).optional(),
  isCombat: z.boolean().optional(),
  enemies: z.array(EnemySchema).optional(),
  activeEffects: z.array(ActiveEffectSchema).optional(),
  imagePrompt: z.string().optional(),
});


export async function generateNextTurn(input: GenerateNextTurnInput & { apiKey?: string }): Promise<GenerateNextTurnOutput> {
  // Call the flow instead of the prompt directly
  return generateNextTurnFlow(input);
}

// Define a flow with retry logic
const generateNextTurnFlow = ai.defineFlow(
  {
    name: 'generateNextTurnFlow',
    inputSchema: GenerateNextTurnInputSchema,
    outputSchema: GenerateNextTurnOutputSchema,
  },
  async ({apiKey, ...input}) => {
    const model = apiKey ? ai.model('googleai/gemini-pro', { requestMiddleware: (req, next) => {
        if (!req.headers) req.headers = new Headers();
        req.headers.set('x-goog-api-key', apiKey);
        return next(req);
    }}) : ai.model('googleai/gemini-pro');

    const { output } = await ai.run(generateNextTurnPrompt, {input, model});
    return output!;
  }
);
