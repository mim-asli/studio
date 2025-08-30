
'use server';

/**
 * @fileOverview Manages item crafting logic for the Dastan AI RPG.
 *
 * - craftItem - A function that handles the item crafting process.
 * - CraftItemInput - The input type for the craftItem function.
 * - CraftItemOutput - The return type for the craftItem function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import type { CraftItemInput, CraftItemOutput } from '@/lib/types';
import { craftItemPrompt } from '../prompts/craft-item-prompt';

// Schemas for craftItem flow
const CraftItemInputSchema = z.object({
  ingredients: z.array(z.string()).describe("A list of item names from the player's inventory to be combined."),
  playerSkills: z.array(z.string()).optional().describe("A list of the player's current skills, which might influence the crafting outcome."),
  apiKey: z.string().optional().describe("The API key for the AI model."),
});

const CraftItemOutputSchema = z.object({
  success: z.boolean().describe("Whether the crafting attempt was successful."),
  consumedItems: z.array(z.string()).describe("A list of items that were used up in the crafting process."),
  createdItem: z.string().optional().describe("The name of the new item that was created, if any."),
  message: z.string().describe("A message to the player describing the outcome of their crafting attempt (e.g., 'You successfully crafted a torch.' or 'You fumbled and dropped the items, achieving nothing.')."),
});


export async function craftItem(input: CraftItemInput & { apiKey?: string }): Promise<CraftItemOutput> {
  return craftItemFlow(input);
}

const craftItemFlow = ai.defineFlow(
  {
    name: 'craftItemFlow',
    inputSchema: CraftItemInputSchema,
    outputSchema: CraftItemOutputSchema,
  },
  async ({apiKey, ...input}) => {
    const model = apiKey ? ai.model('googleai/gemini-pro', { requestMiddleware: (req, next) => {
        if (!req.headers) req.headers = new Headers();
        req.headers.set('x-goog-api-key', apiKey);
        return next(req);
    }}) : ai.model('googleai/gemini-pro');

    const {output} = await ai.run(craftItemPrompt, {input, model});
    return output!;
  }
);
