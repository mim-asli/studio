
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


export async function generateNextTurn(input: GenerateNextTurnInput): Promise<GenerateNextTurnOutput> {
  const { output } = await generateNextTurnPrompt(input);
  return output!;
}
