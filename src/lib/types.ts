
import {z} from 'zod';
import type {GenerateNextTurnOutputSchema} from '@/ai/flows/generate-next-turn';
import type {CraftItemOutputSchema, CraftItemInputSchema} from '@/ai/flows/craft-item-flow';

// This is the raw output from the AI flow. story is a single string.
export type GenerateNextTurnOutput = z.infer<typeof GenerateNextTurnOutputSchema>;
export type CraftItemInput = z.infer<typeof CraftItemInputSchema>;
export type CraftItemOutput = z.infer<typeof CraftItemOutputSchema>;
export type ActiveEffect = z.infer<typeof GenerateNextTurnOutputSchema.shape.activeEffects.element>;
export type Enemy = z.infer<typeof GenerateNextTurnOutputSchema.shape.enemies.element>;

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
