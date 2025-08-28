
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

**Combat Rules & Action Points (AP):**
1.  **AP System:** All actions in combat cost Action Points (AP). The player's turn continues until they are out of AP or choose to end their turn.
2.  **Player Turn Reset:** At the start of the player's turn, their AP is reset to their maxAP.
3.  **Standard Action Costs:**
    *   **Attack:** 2 AP.
    *   **Defend:** 1 AP. Increases defense for one round.
    *   **Use Item:** 2 AP.
    *   **Use Skill:** Varies. (You can decide based on the skill's power).
    *   **End Turn:** 0 AP.
4.  **Damage Calculation:** Damage is calculated simply as: (Attacker's Attack - Defender's Defense). Minimum damage is 1. Be creative with attack descriptions.
5.  **Enemy AI & AP:** Enemies also have and use AP.
    *   They act logically: a low-health enemy might defend, a powerful one might use a special ability.
    *   They don't have to use all their AP in one go.
    *   Make their actions varied and strategic.
6.  **Combat End:**
    *   Combat ends when all enemies are defeated OR the player's health is 0 or less. Set 'isCombatOver' to true in this case.
    *   If the player wins, populate the 'rewards' field. Rewards MUST be appropriate for the defeated enemies.
7.  **Choices:** After each player action, provide an updated list of choices they can afford with their remaining AP. If they have no AP left, the only choice should be "[پایان نوبت]".

**Your Task:**
Process the following combat action.

**Player's Action:**
{{{playerAction}}}

**Player's State (before this action):**
{{{playerState}}}

**Player's Skills & Inventory:**
- Skills: {{{skills}}}
- Inventory: {{{inventory}}}

**Enemies (before this action):**
{{{enemies}}}

**Combat Log (Recent History):**
{{{combatLog}}}

**Instructions:**
1.  **Process Player Action:**
    *   Determine the AP cost of the player's action.
    *   Subtract the AP cost from the player's current AP.
    *   Narrate the outcome of the player's action. If it was an attack, update the target's health.
2.  **Check for End of Player Turn:**
    *   If the player's action was "[پایان نوبت]" or if they have 0 AP left, proceed to the enemies' turn.
3.  **Narrate Enemies' Actions:**
    *   For each living enemy, determine their action(s) based on their available AP.
    *   Narrate their actions and update the player's health or status if they are affected.
    *   At the end of the enemy phase, reset the player's AP to their maxAP for their next turn.
4.  **Update State:** Populate 'updatedPlayerState' and 'updatedEnemies' with the final health and AP values after the full turn (player and enemy actions).
5.  **Compile Narration:** Combine the player and enemy action descriptions into a single 'turnNarration' string.
6.  **Determine Next Choices:**
    *   If the player's turn is ongoing (they still have AP), provide choices they can afford.
    *   If the enemies' turn just finished, provide a full list of choices for the player's new turn.
7.  **Check for Combat End:** Set 'isCombatOver' if the conditions are met. If the player won, determine appropriate 'rewards'.

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
    // If player action is to end turn, or if they have no AP, make it explicit for the AI
    if (input.playerState.ap <= 0 && !input.playerAction) {
      input.playerAction = '[پایان نوبت]';
    }

    const {output} = await prompt(input);
    return output!;
  }
);
