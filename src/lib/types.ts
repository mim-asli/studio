import {z} from 'zod';

// Schemas for generateNextTurn flow
export const GenerateNextTurnInputSchema = z.object({
  gameState: z.string().describe('The current state of the game as a JSON string.'),
  playerAction: z.string().describe('The action taken by the player.'),
  difficulty: z.string().optional().describe("The game's difficulty level (e.g., 'آسان', 'معمولی', 'سخت'). This must be respected on every turn."),
  gmPersonality: z.string().optional().describe("The Game Master's personality (e.g., 'جدی و تاریک', 'شوخ و سرگرم‌کننده'). This must be respected on every turn."),
});
export type GenerateNextTurnInput = z.infer<typeof GenerateNextTurnInputSchema>;

const EnemySchema = z.object({
    id: z.string().describe("A unique identifier for the enemy in this combat scene."),
    name: z.string().describe("The name of the enemy."),
    health: z.number().describe("The current health of the enemy."),
    maxHealth: z.number().describe("The maximum health of the enemy."),
    attack: z.number().describe("The enemy's attack power."),
    defense: z.number().describe("The enemy's defense power."),
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

export const GenerateNextTurnOutputSchema = z.object({
  story: z.string().describe('The narrative text of the current events. This should be a single string.'),
  playerState: PlayerStateSchema.describe('The state of the player (health, sanity, etc.).'),
  inventory: z.array(z.string()).describe("A list of items in the player's inventory. This should be the player's complete inventory. The player might find valuable items like Bronze, Silver, or Gold Coins, and gems like Rubies or Diamonds."),
  skills: z.array(z.string()).describe("A list of the player's skills."),
  quests: z.array(z.string()).describe("A list of the player's quests."),
  choices: z.array(z.string()).describe('A list of choices the player can make.'),
  worldState: WorldStateSchema.describe('The state of the game world (day, time, etc.).'),
  newCharacter: z.string().optional().describe('A new character introduced in this turn.'),
  newQuest: z.string().optional().describe('A new quest introduced in this turn.'),
  currentLocation: z.string().describe("The player's current location name. This MUST always be populated."),
  newLocation: z.string().optional().describe('A new location introduced in this turn. If a new location is introduced, it must be different from the current location.'),
  discoveredLocations: z.array(z.string()).describe("A list of all locations the player has discovered so far. This should be the complete list, including any new locations from this turn."),
  globalEvent: z.string().optional().describe('A global event that occurred in this turn.'),
  sceneEntities: z.array(z.string()).describe('List of all entities in the current scene (player, companions, enemies, important objects).'),
  companions: z.array(z.string()).optional().describe("A list of the player's current companions. This should be the complete list of companions."),
  isCombat: z.boolean().optional().describe('If the player action initiates combat, set this to true. Otherwise, leave it undefined.'),
  enemies: z.array(EnemySchema).optional().describe("If isCombat is true, populate this list with the enemies the player is facing. Define their stats (health, attack, defense)."),
  activeEffects: z.array(ActiveEffectSchema).optional().describe("A list of temporary buffs or debuffs affecting the player due to environment or status."),
});
export type GenerateNextTurnOutput = z.infer<typeof GenerateNextTurnOutputSchema>;


// Schemas for craftItem flow
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


// Local Types, not from AI flows
export type ActiveEffect = z.infer<typeof ActiveEffectSchema>;
export type Enemy = z.infer<typeof EnemySchema>;


// Schemas for manageCombatScenarioFlow
const EnemyStateSchema = z.object({
    id: z.string(),
    name: z.string(),
    health: z.number(),
    maxHealth: z.number(),
    attack: z.number(),
    defense: z.number(),
});

const PlayerCombatStateSchema = z.object({
  health: z.number(),
  sanity: z.number(),
  hunger: z.number(),
  thirst: z.number(),
  stamina: z.number().optional(),
  mana: z.number().optional(),
});

export const ManageCombatScenarioInputSchema = z.object({
  playerAction: z.string().describe("The combat action taken by the player (e.g., '[COMBAT] Attack Goblin')."),
  playerState: PlayerCombatStateSchema.describe('The current state of the player.'),
  enemies: z.array(EnemyStateSchema).describe('The list of enemies currently in combat.'),
  inventory: z.array(z.string()).describe("The player's current inventory."),
  skills: z.array(z.string()).describe("The player's current skills."),
  combatLog: z.array(z.string()).optional().describe('A log of recent events in this combat.'),
});
export type ManageCombatScenarioInput = z.infer<typeof ManageCombatScenarioInputSchema>;

const CombatRewardSchema = z.object({
    items: z.array(z.string()).optional().describe("Items looted from the enemies."),
    gold: z.number().optional().describe("Gold coins looted."),
    silver: z.number().optional().describe("Silver coins looted."),
    bronze: z.number().optional().describe("Bronze coins looted."),
    experience: z.number().optional().describe("Experience points gained."),
});

export const ManageCombatScenarioOutputSchema = z.object({
  turnNarration: z.string().describe('A step-by-step narration of what happened this turn. First the player action, then the enemy actions.'),
  updatedPlayerState: PlayerCombatStateSchema.describe("The player's state after this turn's events."),
  updatedEnemies: z.array(EnemyStateSchema).describe('The updated state of all enemies after this turn. Include defeated enemies with 0 health.'),
  choices: z.array(z.string()).describe("The available combat choices for the next player turn."),
  isCombatOver: z.boolean().describe('Set to true if all enemies are defeated or the player is defeated.'),
  rewards: CombatRewardSchema.optional().describe('If combat is over and the player won, populate this with rewards. Be realistic about loot.'),
});
export type ManageCombatScenarioOutput = z.infer<typeof ManageCombatScenarioOutputSchema>;


// Schemas for queryGameDirector flow
export const QueryGameDirectorInputSchema = z.object({
  playerQuery: z.string().describe('The question the player wants to ask the game director.'),
  gameState: z.string().describe('The current game state in JSON format.'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional().describe('The history of the conversation so far.'),
});
export type QueryGameDirectorInput = z.infer<typeof QueryGameDirectorInputSchema>;

export const QueryGameDirectorOutputSchema = z.object({
  directorResponse: z.string().describe('The game director’s insightful answer to the player’s question.'),
});
export type QueryGameDirectorOutput = z.infer<typeof QueryGameDirectorOutputSchema>;


// This is the main state object for the game client. story is an array of strings.
export type GameState = Omit<GenerateNextTurnOutput, 'story'> & {
    id: string; // Unique ID for the game session
    story: string[]; // Keep a history of story segments
    isGameOver: boolean;
    gameStarted: boolean;
    isLoading: boolean;
    characterName: string;
    scenarioTitle: string;
    difficulty: 'آسان' | 'معمولی' | 'سخت';
    gmPersonality: string;
};

// This represents a saved game file
export interface SaveFile {
    id: string; // Corresponds to GameState.id
    timestamp: number;
    gameState: GameState;
    characterName: string;
    scenarioTitle: string;
}

export interface CustomScenario {
    title: string;
    character: string[];
    initialItems: string[];
    storyPrompt: string;
    difficulty: 'آسان' | 'معمولی' | 'سخت';
    gmPersonality: string;
}

// --- Settings Types ---

export type ApiKey = {
  id: string;
  name: string;
  value: string;
  enabled: boolean;
  status?: 'valid' | 'invalid' | 'quota_exceeded' | 'unchecked';
};

export type HuggingFaceSettings = {
  enabled: boolean;
  apiKey: string;
  modelId: string;
  prioritize: boolean;
};

export type LocalLlmSettings = {
  enabled: boolean;
  endpoint: string;
  prioritize: boolean;
};

export type AudioSettings = {
  master: number;
  music: number;
  ambient: number;
  sfx: number;
};

export type AppSettings = {
  theme: 'dark' | 'light';
  geminiApiKeys: ApiKey[];
  huggingFace: HuggingFaceSettings;
  localLlm: LocalLlmSettings;
  audio: AudioSettings;
};
