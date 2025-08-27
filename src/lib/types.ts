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
