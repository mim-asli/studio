
'use server';

/**
 * @fileOverview Manages item crafting logic for the Dastan AI RPG.
 *
 * - craftItem - A function that handles the item crafting process.
 * - CraftItemInput - The input type for the craftItem function.
 * - CraftItemOutput - The return type for the craftItem function.
 */

import {ai} from '@/ai/genkit';
import { CraftItemInputSchema, CraftItemOutputSchema, type CraftItemInput, type CraftItemOutput } from '@/lib/types';


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
    *   If the combination is logical, set 'success' to true, 'createdItem' to the name of the new item, 'consumedItems' to the list of ingredients, and write a success message.
    *   If the combination is illogical or fails, set 'success' to false. Decide if the ingredients are consumed (e.g., a failed potion) or not (e.g., just trying to tie two rocks together). Populate 'consumedItems' accordingly and write a descriptive failure message.
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
