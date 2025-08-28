
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
import { generateMapImage } from './generate-map-flow';

const GenerateNextTurnInputSchema = z.object({
  gameState: z.string().describe('The current state of the game as a JSON string.'),
  playerAction: z.string().describe('The action taken by the player.'),
});
export type GenerateNextTurnInput = z.infer<typeof GenerateNextTurnInputSchema>;

const EnemySchema = z.object({
    id: z.string().describe("A unique identifier for the enemy in this combat scene."),
    name: z.string().describe("The name of the enemy."),
    health: z.number().describe("The current health of the enemy."),
});

const PlayerStateSchema = z.object({
  health: z.number().describe("Player's current health. Max 100."),
  sanity: z.number().describe("Player's current sanity. Max 100. Low sanity can cause hallucinations or negative effects."),
  hunger: z.number().describe("Player's current hunger level. 0 is not hungry, 100 is starving."),
  thirst: z.number().describe("Player's current thirst level. 0 is not thirsty, 100 is dehydrated."),
  stamina: z.number().optional().describe("Player's current stamina/energy. Max 100. Physical actions consume stamina."),
  mana: z.number().optional().describe("Player's current magical energy. Max 100. Casting spells consumes mana."),
});

const WorldStateSchema = z.object({
    day: z.number().describe("The current day number in the game world."),
    time: z.string().describe("The current time of day. Be descriptive (e.g., 'Early Morning', 'Noon', 'Late Afternoon', 'Midnight')."),
    weather: z.string().optional().describe("The current weather (e.g., 'Sunny', 'Raining', 'Foggy').")
});

const ActiveEffectSchema = z.object({
    name: z.string().describe("The name of the effect (e.g., 'Sandstorm', 'Well Fed', 'Poisoned')."),
    type: z.enum(['buff', 'debuff']).describe("The type of effect: 'buff' for positive, 'debuff' for negative."),
    description: z.string().describe("A brief description of the effect's impact on the player."),
});

const GenerateNextTurnOutputSchema = z.object({
  story: z.string().describe('The narrative text of the current events. This should be a single string.'),
  playerState: PlayerStateSchema.describe('The state of the player (health, sanity, etc.).'),
  inventory: z.array(z.string()).describe("A list of items in the player's inventory. This should be the player's complete inventory. The player might find valuable items like Bronze, Silver, or Gold Coins, and gems like Rubies or Diamonds."),
  skills: z.array(z.string()).describe("A list of the player's skills."),
  quests: z.array(z.string()).describe("A list of the player's quests."),
  choices: z.array(z.string()).describe('A list of choices the player can make.'),
  worldState: WorldStateSchema.describe('The state of the game world (day, time, etc.).'),
  newCharacter: z.string().optional().describe('A new character introduced in this turn.'),
  newQuest: z.string().optional().describe('A new quest introduced in this turn.'),
  newLocation: z.string().optional().describe('A new location introduced in this turn.'),
  globalEvent: z.string().optional().describe('A global event that occurred in this turn.'),
  sceneEntities: z.array(z.string()).describe('List of all entities in the current scene (player, companions, enemies, important objects).'),
  companions: z.array(z.string()).optional().describe("A list of the player's current companions. This should be the complete list of companions."),
  isCombat: z.boolean().optional().describe('Whether combat is active.'),
  enemies: z.array(EnemySchema).optional().describe('A list of enemies in the combat.'),
  activeEffects: z.array(ActiveEffectSchema).optional().describe("A list of temporary buffs or debuffs affecting the player due to environment or status."),
  mapImageUrl: z.string().optional().describe('A data URI for the newly generated map of the current location.'),
});
export type GenerateNextTurnOutput = z.infer<typeof GenerateNextTurnOutputSchema>;

export async function generateNextTurn(input: GenerateNextTurnInput): Promise<GenerateNextTurnOutput> {
  return generateNextTurnFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNextTurnPrompt',
  input: {schema: GenerateNextTurnInputSchema},
  output: {schema: GenerateNextTurnOutputSchema.omit({ mapImageUrl: true })},
  prompt: `You are the game master for a dynamic text-based RPG called Dastan.
IMPORTANT: Your entire response, including all fields in the JSON output, MUST be in Persian (Farsi).

The user has specified a difficulty level. You MUST adjust the game's challenges accordingly:
- **آسان (Easy):** Resources are more abundant. Enemies are less frequent and weaker. NPCs are generally more helpful.
- **معمولی (Normal):** A balanced experience with standard challenges and rewards.
- **سخت (Hard):** Resources are scarce. Enemies are more frequent, stronger, and more strategic. Survival is a constant challenge.

Enforce the following rules:
- **State Synchronization Philosophy:** Any changes to the game world or player state (health, hunger, thirst, sanity, inventory, skills, quests, companions, activeEffects) MUST be reflected in the JSON output. The inventory, companions, and activeEffects in the output must always be the complete lists.
- **Active Effects:** Based on the situation, apply status effects to the player. These can be positive (buffs) or negative (debuffs). For example:
    - Eating a good meal could result in a 'Well Fed' buff.
    - Being in a blizzard could apply a 'Freezing' debuff.
    - Being poisoned applies a 'Poisoned' debuff that might reduce health each turn.
    - A blessing from a cleric could grant a 'Protected' buff.
    Populate the 'activeEffects' array accordingly. These effects should be temporary and removed when the condition ends.
- **Treasure and Economy:** The world contains valuable items. Players can find Bronze, Silver, and Gold Coins, as well as precious gems like Rubies, Sapphires, and Diamonds as loot, in chests, or as rewards. Make sure to include these as part of the story and inventory when appropriate.
- **Economic System:** You must manage a dynamic economy. Use the following as a guideline, but feel free to adjust prices based on location (a big city vs. a remote village), scarcity, or player reputation.
    - **Currency Exchange:** 10 Bronze Coins = 1 Silver Coin. 10 Silver Coins = 1 Gold Coin.
    - **Sample Prices:**
        - A loaf of bread: 2-3 Bronze Coins.
        - A night at a simple inn: 1 Silver Coin.
        - A simple iron sword: 5-8 Gold Coins.
        - A healing potion: 2-3 Gold Coins.
        - A horse: 30-50 Gold Coins, depending on quality.
        - A Ruby: Worth around 20-25 Gold Coins.
        - A Diamond: Worth over 100 Gold Coins.
    - **Transactions:** When the player wants to buy or sell, present the price and require them to confirm the transaction as their next action. For example: "The merchant offers you 5 Gold Coins for the ruby. Do you accept?" Choices: ["بله، معامله می‌کنم", "نه، ممنون"].
- **Item Crafting:** If the player action describes an attempt to combine items from their inventory, evaluate the logic of the combination. If it makes sense, allow the crafting attempt. The result might be a new item, a broken item, or a partial success. Update the inventory accordingly. For example, if a player tries to combine a sturdy branch and a sharp rock, they might create a 'makeshift axe'.
- **Stamina and Fatigue:** All characters, including the player, have Stamina (max 100). Physical actions like running, fighting, climbing, or swimming consume stamina. The amount consumed should be proportional to the effort. Resting or consuming certain items can restore stamina. Low stamina (below 20) should have negative consequences, such as reduced combat effectiveness or inability to perform strenuous actions.
- **Mana and Magic:** For characters with magical abilities, all spells consume Mana (max 100). The more powerful the spell, the more mana it consumes. Mana can be restored through rest, meditation, or special potions. If a character's mana is too low, they cannot cast spells. Only include mana for characters who are magical in nature (e.g. 'جادوگر').
- **Forward Momentum Philosophy:** Always move the story forward. Options presented to the player should be meaningful, distinct, and logical consequences of the last action. Whenever possible, provide at least 4 to 6 meaningful and diverse choices to give the player a real sense of agency.
- **Persistent World Philosophy:** The game doesn't end with a quest. Introduce a new challenge or long-term goal after each major victory. Game over only when the player dies.
- **Time and Resource Progression:** With every player action, time must progress logically. Update the day and time of day in the worldState. Actions also affect hunger and thirst; update them accordingly.
Respond in the persona of the GM Personality specified in the story prompt.

JSON Output Structure:
ALWAYS return a JSON object with the specified structure. Ensure all fields are populated correctly based on the current turn. DO NOT include mapImageUrl, it will be handled separately.

Turn-Based Combat:
If combat starts, set isCombat to true and populate the 'enemies' array with their stats. Player choices should include combat actions like [COMBAT: ATTACK] enemyId.

Scene Composition:
Populate 'sceneEntities' with all entities in the scene (player, companions, enemies, objects).
Populate the 'companions' array with the names of any allies currently with the player.

Use the current game state and player action to generate the next turn of the story. Adhere to the rules and output structure above.

Current Game State (JSON String):
{{{gameState}}}

Player Action:
{{{playerAction}}}
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
  async (input) => {
    const { output } = await prompt(input);
    const nextTurnData = output! as GenerateNextTurnOutput;

    // If a new location is discovered, generate a map for it.
    if (nextTurnData.newLocation) {
      try {
        const mapResult = await generateMapImage({ locationName: nextTurnData.newLocation });
        nextTurnData.mapImageUrl = mapResult.mapImageUrl;
      } catch (error) {
        console.error("Failed to generate map image:", error);
        // Continue without a map if generation fails
      }
    }

    return nextTurnData;
  }
);
