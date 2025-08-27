'use server';

/**
 * @fileOverview Generates the next turn of the Dastan AI RPG story.
 *
 * - generateNextTurn - A function that generates the next turn of the story.
 * - GenerateNextTurnInput - The input type for the generateNextTurn function.
 * - GenerateNextTurnOutput - The return type for the generateNextTurn function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateNextTurnInputSchema = z.object({
  gameState: z.any().describe('The current state of the game.'),
  playerAction: z.string().describe('The action taken by the player.'),
});
export type GenerateNextTurnInput = z.infer<typeof GenerateNextTurnInputSchema>;

const GenerateNextTurnOutputSchema = z.object({
  story: z.string().describe('The narrative text of the current events. This should be a single string.'),
  playerState: z.any().describe('The state of the player (health, sanity, etc.).'),
  inventory: z.array(z.string()).describe('A list of items in the player\'s inventory.'),
  skills: z.array(z.string()).describe('A list of the player\'s skills.'),
  quests: z.array(z.string()).describe('A list of the player\'s quests.'),
  choices: z.array(z.string()).describe('A list of choices the player can make.'),
  worldState: z.any().describe('The state of the game world (day, time, etc.).'),
  newCharacter: z.string().optional().describe('A new character introduced in this turn.'),
  newQuest: z.string().optional().describe('A new quest introduced in this turn.'),
  newLocation: z.string().optional().describe('A new location introduced in this turn.'),
  globalEvent: z.string().optional().describe('A global event that occurred in this turn.'),
  sceneEntities: z.array(z.string()).describe('List of entities in the current scene.'),
});
export type GenerateNextTurnOutput = z.infer<typeof GenerateNextTurnOutputSchema>;

export async function generateNextTurn(input: GenerateNextTurnInput): Promise<GenerateNextTurnOutput> {
  return generateNextTurnFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNextTurnPrompt',
  input: {schema: GenerateNextTurnInputSchema},
  output: {schema: GenerateNextTurnOutputSchema},
  prompt: `You are the game master for a dynamic text-based RPG called Dastan.\n
Enforce the following rules:\n- **State Synchronization Philosophy:** Any changes to the game world or player state MUST be reflected in the JSON output.\n- **Forward Momentum Philosophy:** Always move the story forward. Options presented to the player should be meaningful, distinct, and logical consequences of the last action.\n- **Persistent World Philosophy:** The game doesn\'t end with a quest. Introduce a new challenge or long-term goal after each major victory. Game over only when the player dies.\n
Respond in the persona of the GM Personality specified in the story prompt.
JSON Output Structure:
ALWAYS return a JSON object with the following structure:\n{
  "story": "string", // Narrative text of the current events.
  "playerState": {}, // Player status (health, sanity, hunger, thirst, etc.).
  "inventory": [], // List of items.
  "skills": [], // List of skills.
  "quests": [], // List of quests.
  "choices": [], // List of choices the player can make.
  "worldState": {}, // Game world state (day, time).
  "newCharacter": "string", // (Optional) New character introduced.
  "newQuest": "string", // (Optional) New quest introduced.
  "newLocation": "string", // (Optional) New location discovered.
  "globalEvent": "string", // (Optional) Global event occurring.
  "sceneEntities": ["entity1", "entity2"] // (Optional) List of entities in the current scene.
}

Turn-Based Combat:
If combat starts, create the isCombat field and populate enemies with their stats. Player choices should be [COMBAT: ATTACK] enemyId.  Manage turns.

Scene Composition:
Populate sceneEntities with all entities in the scene (player, companions, enemies, objects).

\nUse the current game state and player action to generate the next turn of the story.  Adhere to the rules and output structure above.\n\nCurrent Game State:\n{{{gameState}}}
\nPlayer Action:\n{{{playerAction}}}
`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const generateNextTurnFlow = ai.defineFlow(
  {
    name: 'generateNextTurnFlow',
    inputSchema: GenerateNextTurnInputSchema,
    outputSchema: GenerateNextTurnOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
