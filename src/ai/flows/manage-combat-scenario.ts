
'use server';

/**
 * @fileOverview Manages the combat scenario in the Dastan AI RPG.
 *
 * - manageCombatScenario - A function that handles the combat scenario.
 * - ManageCombatScenarioInput - The input type for the manageCombatScenario function.
 * - ManageCombatScenarioOutput - The return type for the manageCombatScenario function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { ManageCombatScenarioInput, ManageCombatScenarioOutput } from '@/lib/types';
import { ManageCombatScenarioInputSchema, ManageCombatScenarioOutputSchema } from '@/lib/types';


export async function manageCombatScenario(input: ManageCombatScenarioInput): Promise<ManageCombatScenarioOutput> {
  return manageCombatScenarioFlow(input);
}

const prompt = ai.definePrompt({
  name: 'manageCombatScenarioPrompt',
  input: {schema: ManageCombatScenarioInputSchema},
  output: {schema: ManageCombatScenarioOutputSchema},
  prompt: `You are the turn-based combat manager for a text-based RPG called Dastan.
IMPORTANT: Your entire response, including all fields in the JSON output, MUST be in Persian (Farsi).

**Combat Rules:**
1.  **Turn Order:** The player always acts first. Then, all enemies act.
2.  **Damage Calculation:** Damage is calculated simply as: (Attacker's Attack - Defender's Defense). Minimum damage is 1. Be creative with attack descriptions.
3.  **Enemy AI:** Enemies should act logically.
    *   If there are multiple enemies, they should coordinate.
    *   An enemy might defend if its health is low.
    *   A powerful enemy might use a special ability.
    *   Don't make all enemies attack every single turn. Variety is key.
4.  **Player Skills & Inventory:** The player's skills and inventory can influence combat. For example, a 'Shield Bash' skill might stun an enemy. A 'Fire Bomb' from inventory could damage all enemies. Factor these into your narration and outcomes.
5.  **Combat End:**
    *   Combat ends when all enemies are defeated OR the player's health is 0 or less. Set 'isCombatOver' to true in this case.
    *   If the player wins, populate the 'rewards' field. Rewards MUST be appropriate for the defeated enemies. A wild wolf won't have gold coins, but a bandit might.
6.  **Next Choices:** After the turn, provide the player with the next set of valid combat choices. This should primarily be attacking any remaining enemies.

**Your Task:**
Process the following combat turn.

**Player's Action:**
{{{playerAction}}}

**Player's State:**
{{{playerState}}}

**Player's Skills & Inventory:**
- Skills: {{{skills}}}
- Inventory: {{{inventory}}}

**Enemies:**
{{{enemies}}}

**Combat Log (Recent History):**
{{{combatLog}}}

**Instructions:**
1.  **Narrate Player's Action:** Describe the outcome of the player's action based on the combat rules. Update the target enemy's health.
2.  **Narrate Enemies' Actions:** For each enemy that is still alive, describe its action. Update the player's health if they are attacked.
3.  **Update State:** Populate 'updatedPlayerState' and 'updatedEnemies' with the final health values after the turn.
4.  **Compile Narration:** Combine the player and enemy action descriptions into a single 'turnNarration' string.
5.  **Determine Next Choices:** Populate the 'choices' array for the player's next turn.
6.  **Check for Combat End:** Set 'isCombatOver' if the conditions are met. If the player won, determine appropriate 'rewards'.

Process the turn and return the JSON output.
`,
});

const manageCombatScenarioFlow = ai.defineFlow(
  {
    name: 'manageCombatScenarioFlow',
    inputSchema: ManageCombatScenarioInputSchema,
    outputSchema: ManageCombatScenarioOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
