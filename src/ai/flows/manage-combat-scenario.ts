
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

const ManageCombatScenarioInputSchema = z.object({
  sceneDescription: z.string().describe('The current scene description.'),
  playerState: z.record(z.any()).describe('The current player state.'),
  enemies: z.array(z.record(z.any())).describe('The list of enemies.'),
  combatLog: z.array(z.string()).optional().describe('The combat log.'),
  playerActions: z.array(z.string()).describe('The list of available player actions.'),
});
export type ManageCombatScenarioInput = z.infer<typeof ManageCombatScenarioInputSchema>;

const ManageCombatScenarioOutputSchema = z.object({
  story: z.string().describe('The narrative of the combat scenario.'),
  enemyActions: z.array(z.record(z.any())).describe('The actions of the enemies.'),
  updatedEnemies: z.array(z.record(z.any())).describe('The updated state of the enemies.'),
  combatLog: z.array(z.string()).describe('The updated combat log.'),
  sceneEntities: z.array(z.record(z.any())).describe('The entities present in the scene (player, enemies, objects).'),
  isCombatOver: z.boolean().describe('Whether the combat is over.'),
  rewards: z.record(z.any()).optional().describe('The rewards for winning the combat. This can include items, experience points, or valuables like Gold Coins or Gems.'),
});
export type ManageCombatScenarioOutput = z.infer<typeof ManageCombatScenarioOutputSchema>;

export async function manageCombatScenario(input: ManageCombatScenarioInput): Promise<ManageCombatScenarioOutput> {
  return manageCombatScenarioFlow(input);
}

const prompt = ai.definePrompt({
  name: 'manageCombatScenarioPrompt',
  input: {schema: ManageCombatScenarioInputSchema},
  output: {schema: ManageCombatScenarioOutputSchema},
  prompt: `You are managing a combat scenario in a dynamic text-based RPG.
IMPORTANT: Your entire response, including all fields in the JSON output, MUST be in Persian (Farsi).

Here is the current scene description: {{{sceneDescription}}}

Here is the player's current state: {{{playerState}}}

Here is the list of enemies: {{{enemies}}}

Here are the available player actions: {{{playerActions}}}

Here is the current combat log, if any: {{{combatLog}}}

Based on the player's state, the enemies, and the available actions, describe what happens in the combat turn. Include the enemy actions, update the state of the enemies, and update the combat log.  Make sure to set isCombatOver to true when appropriate, and describe any rewards for the player.  Always populate sceneEntities with the player and the enemies.

Output should be a JSON object conforming to ManageCombatScenarioOutputSchema. Make sure to set isCombatOver to true only when combat is actually over, and the player has won or lost.  If combat is over, you must populate the rewards field. Rewards can include gold, gems, or unique items.
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
