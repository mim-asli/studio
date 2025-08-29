
import {z} from 'zod';

// Define Zod schemas that are shared across different flows.
// These can be imported and used in both server-side flows and client-side components.

export const EnemySchema = z.object({
    id: z.string().describe("A unique identifier for the enemy in this combat scene."),
    name: z.string().describe("The name of the enemy."),
    health: z.number().describe("The current health of the enemy."),
    maxHealth: z.number().describe("The maximum health of the enemy."),
    attack: z.number().describe("The enemy's attack power."),
    defense: z.number().describe("The enemy's defense power."),
    ap: z.number().describe("The enemy's current action points."),
    maxAp: z.number().describe("The enemy's maximum action points."),
});
export type Enemy = z.infer<typeof EnemySchema>;

export const PlayerStateSchema = z.object({
  health: z.number().describe("Player's current health. Max 100. At 0, the player dies."),
  sanity: z.number().describe("Player's current sanity. Max 100. Low sanity (below 30) can cause hallucinations or negative effects."),
  hunger: z.number().describe("Player's current satiety level. 100 is full, 0 is starving. At 0, the player starts losing health."),
  thirst: z.number().describe("Player's current hydration level. 100 is fully hydrated, 0 is dehydrated. At 0, the player starts losing health."),
  stamina: z.number().optional().describe("Player's current stamina/energy. Max 100. Physical actions consume stamina."),
  mana: z.number().optional().describe("Player's current magical energy. Max 100. Casting spells consumes mana."),
  ap: z.number().describe("Player's current action points for combat."),
  maxAp: z.number().describe("Player's maximum action points for combat."),
});
export type PlayerState = z.infer<typeof PlayerStateSchema>;

export const WorldStateSchema = z.object({
    day: z.number().describe("The current day number in the game world."),
    time: z.string().describe("The current time of day. Be descriptive (e.g., 'Early Morning', 'Noon', 'Late Afternoon', 'Midnight')."),
    weather: z.string().optional().describe("The current weather (e.g., 'Sunny', 'Raining', 'Foggy').")
});

export const ActiveEffectSchema = z.object({
    name: z.string().describe("The name of the effect (e.g., 'Sandstorm', 'Well Fed', 'Poisoned')."),
    type: z.enum(['buff', 'debuff']).describe("The type of effect: 'buff' for positive, 'debuff' for negative."),
    description: z.string().describe("A brief description of the effect's impact on the player."),
});
export type ActiveEffect = z.infer<typeof ActiveEffectSchema>;

// Input and Output types for flows are now defined here for clarity.
// The actual Zod schemas remain in their respective flow files but are not exported.

// Types for generate-next-turn.ts
export interface GenerateNextTurnInput {
    gameState: string;
    playerAction: string;
    difficulty: string;
    gmPersonality: string;
}
export interface GenerateNextTurnOutput {
    story: string;
    playerState: PlayerState;
    inventory: string[];
    skills: string[];
    quests: string[];
    choices: string[];
    worldState: z.infer<typeof WorldStateSchema>;
    newCharacter?: string;
    newQuest?: string;
    currentLocation: string;
    newLocation?: string;
    discoveredLocations: string[];
    globalEvent?: string;
    sceneEntities: string[];
    companions?: string[];
    isCombat?: boolean;
    enemies?: Enemy[];
    activeEffects?: ActiveEffect[];
    imagePrompt?: string;
}

// Types for craft-item-flow.ts
export interface CraftItemInput {
    ingredients: string[];
    playerSkills?: string[];
}
export interface CraftItemOutput {
    success: boolean;
    consumedItems: string[];
    createdItem?: string;
    message: string;
}

// Types for manage-combat-scenario.ts
export interface ManageCombatScenarioInput {
    playerAction: string;
    playerState: PlayerState;
    enemies: Enemy[];
    combatLog?: string[];
}
export interface ManageCombatScenarioOutput {
    turnNarration: string;
    updatedPlayerState: PlayerState;
    updatedEnemies: Enemy[];
    choices: string[];
    isCombatOver: boolean;
    rewards?: {
        items?: string[];
        experience?: number;
    };
}

// Types for query-game-director.ts
export type DirectorMessage = {
  role: 'user' | 'model';
  content: string;
};

export interface QueryGameDirectorInput {
    playerQuery: string;
    gameState: string;
    conversationHistory?: Array<DirectorMessage>;
}
export interface QueryGameDirectorOutput {
    directorResponse: string;
}


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

// Represents an entry in the Hall of Fame
export interface HallOfFameEntry {
    id: string; // Unique ID from the game session
    characterName: string;
    scenarioTitle: string;
    outcome: string; // The final story segment describing the end
    daysSurvived: number;
    timestamp: number; // When the game ended
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

export type AppSettings = {
  theme: 'dark' | 'light';
  generateImages: boolean;
  geminiApiKeys: ApiKey[];
  huggingFace: HuggingFaceSettings;
  localLlm: LocalLlmSettings;
};
