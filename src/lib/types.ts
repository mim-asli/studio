import type { GenerateNextTurnOutput } from '@/ai/flows/generate-next-turn';

// This will be the main state object for the game
export type GameState = GenerateNextTurnOutput & {
    isGameOver: boolean;
    gameStarted: boolean;
    isLoading: boolean;
    isCombat: boolean;
    enemies: any[];
};

// This represents a saved game file
export interface SaveFile {
    id: string;
    timestamp: number;
    gameState: GameState;
    customScenario?: CustomScenario;
}

export interface CustomScenario {
    title: string;
    character: string;
    initialItems: string;
    storyPrompt: string;
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
