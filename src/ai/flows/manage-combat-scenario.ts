
'use server';

/**
 * @fileOverview Manages the combat scenario in the Dastan AI RPG.
 *
 * - manageCombatScenario - A function that handles the combat scenario.
 * - ManageCombatScenarioInput - The input type for the manageCombatScenario function.
 * - ManageCombatScenarioOutput - The return type for the manageCombatScenario function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { PlayerStateSchema, EnemySchema } from '@/lib/types';
import type { ManageCombatScenarioInput, ManageCombatScenarioOutput } from '@/lib/types';
import { manageCombatScenarioPrompt } from '../prompts/manage-combat-scenario-prompt';


// Schemas for manageCombatScenarioFlow
const ManageCombatScenarioInputSchema = z.object({
  playerAction: z.string().describe("The combat action taken by the player (e.g., '[مبارزه] حمله به گابلین')."),
  playerState: PlayerStateSchema.describe('The current state of the player.'),
  enemies: z.array(EnemySchema).describe('The list of enemies currently in combat.'),
  combatLog: z.array(z.string()).optional().describe('A log of recent events in this combat.'),
  apiKey: z.string().optional(),
});

const CombatRewardSchema = z.object({
    items: z.array(z.string()).optional().describe("Items looted from the enemies."),
    experience: z.number().optional().describe("Experience points gained."),
});

const ManageCombatScenarioOutputSchema = z.object({
  turnNarration: z.string().describe('A step-by-step narration of what happened this turn. First the player action, then the enemy actions.'),
  updatedPlayerState: PlayerStateSchema.describe("The player's state after this turn's events."),
  updatedEnemies: z.array(EnemySchema).describe('The updated state of all enemies after this turn. Include defeated enemies with 0 health.'),
  choices: z.array(z.string()).describe("The available combat choices for the next player turn."),
  isCombatOver: z.boolean().describe('Set to true if all enemies are defeated or the player is defeated.'),
  rewards: CombatRewardSchema.optional().describe('If combat is over and the player won, populate this with rewards. Be realistic about loot.'),
});


export async function manageCombatScenario(input: ManageCombatScenarioInput & { apiKey?: string }): Promise<ManageCombatScenarioOutput> {
  return manageCombatScenarioFlow(input);
}

const manageCombatScenarioFlow = ai.defineFlow(
  {
    name: 'manageCombatScenarioFlow',
    inputSchema: ManageCombatScenarioInputSchema,
    outputSchema: ManageCombatScenarioOutputSchema,
  },
  async ({apiKey, ...input}) => {
    // If player action is to end turn, or if they have no AP, make it explicit for the AI
    if (input.playerState.ap <= 0 && !input.playerAction) {
      input.playerAction = '[پایان نوبت]';
    }
    
    const model = apiKey ? ai.model('googleai/gemini-pro', { requestMiddleware: (req, next) => {
        if (!req.headers) req.headers = new Headers();
        req.headers.set('x-goog-api-key', apiKey);
        return next(req);
    }}) : ai.model('googleai/gemini-pro');

    const {output} = await ai.run(manageCombatScenarioPrompt, {input, model});
    return output!;
  }
);
