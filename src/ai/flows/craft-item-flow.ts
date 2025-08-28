
'use server';

/**
 * @fileOverview Manages item crafting logic for the Dastan AI RPG.
 *
 * - craftItem - A function that handles the item crafting process.
 * - CraftItemInput - The input type for the craftItem function.
 * - CraftItemOutput - The return type for the craftItem function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const CraftItemInputSchema = z.object({
  ingredients: z.array(z.string()).describe("A list of item names from the player's inventory to be combined."),
  playerSkills: z.array(z.string()).optional().describe("A list of the player's current skills, which might influence the crafting outcome."),
});
export type CraftItemInput = z.infer<typeof CraftItemInputSchema>;

export const CraftItemOutputSchema = z.object({
  success: z.boolean().describe("Whether the crafting attempt was successful."),
  consumedItems: z.array(z.string()).describe("A list of items that were used up in the crafting process."),
  createdItem: z.string().optional().describe("The name of the new item that was created, if any."),
  message: z.string().describe("A message to the player describing the outcome of their crafting attempt (e.g., 'You successfully crafted a torch.' or 'You fumbled and dropped the items, achieving nothing.')."),
});
export type CraftItemOutput = z.infer<typeof CraftItemOutputSchema>;


export async function craftItem(input: CraftItemInput): Promise<CraftItemOutput> {
  return craftItemFlow(input);
}

const prompt = ai.definePrompt({
  name: 'craftItemPrompt',
  input: {schema: CraftItemInputSchema},
  output: {schema: CraftItemOutputSchema},
  prompt: `You are the crafting master for a dynamic text-based RPG called Dastan.
IMPORTANT: Your entire response, including all fields in the JSON output, MUST be in Persian (Farsi).

The player is attempting to combine several items from their inventory. Evaluate the combination logically and creatively.

**Rules:**
1.  **Logical Combinations:** The combination must make sense.
    *   *Good Example:* Combining a 'Sturdy Branch' and a 'Sharp Flint' could create a 'Makeshift Axe'.
    *   *Bad Example:* Combining a 'Loaf of Bread' and a 'Sword' should probably result in failure and a funny message.
2.  **Skill Influence:** Consider the player's skills. A character with a 'Blacksmith' skill might create a 'Sturdy Axe' instead of a 'Makeshift' one from the same ingredients. A character with 'Alchemy' might create a potion where others fail.
3.  **Outcome:**
    *   If the combination is logical, set `success` to true, `createdItem` to the name of the new item, `consumedItems` to the list of ingredients, and write a success message.
    *   If the combination is illogical or fails, set `success` to false. Decide if the ingredients are consumed (e.g., a failed potion) or not (e.g., just trying to tie two rocks together). Populate `consumedItems` accordingly and write a descriptive failure message.
4.  **Be Creative:** Don't be afraid to allow for unexpected but clever combinations!

**Player's Attempt:**

*   **Items to Combine:** {{{ingredients}}}
*   **Player's Skills:** {{{playerSkills}}}

Based on these inputs, determine the outcome of the crafting attempt.
`,
});

const craftItemFlow = ai.defineFlow(
  {
    name: 'craftItemFlow',
    inputSchema: CraftItemInputSchema,
    outputSchema: CraftItemOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
