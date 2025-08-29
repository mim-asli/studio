
"use client";

import { useCallback } from "react";
import type { GameState, CustomScenario } from "@/lib/types";
import { initialGameState } from "@/lib/game-data";
import { useRouter } from 'next/navigation';

interface UseGameInitializerProps {
  onGameLoad: (gameState: GameState) => void;
  processPlayerAction: (action: string, gameState: GameState) => void;
  clearImage: () => void;
}

export function useGameInitializer({ onGameLoad, processPlayerAction, clearImage }: UseGameInitializerProps) {
    const router = useRouter();

    const startGame = useCallback((scenario: CustomScenario, characterName: string) => {
        clearImage();
        const gameId = crypto.randomUUID();
        const characterSkills = Array.isArray(scenario.character) ? scenario.character : scenario.character.split(',').map(s => s.trim());
        const isMagical = characterSkills.some(skill => skill.toLowerCase().includes('جادوگر'));

        const freshGameState: GameState = {
            ...initialGameState,
            id: gameId,
            story: [],
            activeEffects: [],
            playerState: { 
                health: 100, 
                sanity: 100, 
                hunger: 100, 
                thirst: 100,
                stamina: 100,
                mana: isMagical ? 100 : undefined,
                ap: 4, 
                maxAp: 4,
            },
            inventory: Array.isArray(scenario.initialItems) ? scenario.initialItems : scenario.initialItems.split('\\n').filter(i => i.trim() !== ''),
            skills: characterSkills,
            companions: [],
            gameStarted: true,
            isLoading: true,
            choices: [],
            characterName: characterName,
            scenarioTitle: scenario.title,
            currentLocation: 'شروع ماجرا',
            discoveredLocations: ['شروع ماجرا'],
            difficulty: scenario.difficulty,
            gmPersonality: scenario.gmPersonality,
            isGameOver: false,
        };
        
        onGameLoad(freshGameState);
        router.push('/play');

        const startPrompt = `دستورالعمل‌های سناریو برای هوش مصنوعی (این متن به بازیکن نشان داده نمی‌شود):\\n${scenario.storyPrompt}\\n\\nبازی را شروع کن و اولین صحنه را با جزئیات توصیف کن.`;
        
        processPlayerAction(startPrompt, freshGameState);
    }, [onGameLoad, processPlayerAction, clearImage, router]);


    const resetGame = useCallback(() => {
        onGameLoad(initialGameState); // Essentially clears the state
        clearImage();
        router.push('/');
    }, [onGameLoad, clearImage, router]);

    return { startGame, resetGame };
}
