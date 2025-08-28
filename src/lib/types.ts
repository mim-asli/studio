import type {z} from 'genkit';
import type {GenerateNextTurnOutputSchema} from '@/ai/flows/generate-next-turn';
import type {CraftItemOutputSchema, CraftItemInputSchema} from '@/ai/flows/craft-item-flow';

// This is the raw output from the AI flow. story is a single string.
export type GenerateNextTurnOutput = z.infer<typeof GenerateNextTurnOutputSchema>;
export type CraftItemInput = z.infer<typeof CraftItemInputSchema>;
export type CraftItemOutput = z.infer<typeof CraftItemOutputSchema>;
export type ActiveEffect = z.infer<typeof GenerateNextTurnOutputSchema.shape.activeEffects.element>;

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
