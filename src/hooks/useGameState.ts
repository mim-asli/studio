
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { GameState } from '@/lib/types';
import { useGameSaves } from './use-game-saves';

export function useGameState() {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isGameLoading, setIsGameLoading] = useState(true);
    const { saveGame, saveToHallOfFame } = useGameSaves();

    const updateGameState = useCallback((newState: GameState | null) => {
        setGameState(newState);
        if (newState) {
            saveGame(newState);
        }
    }, [saveGame]);

    useEffect(() => {
        if (gameState?.isGameOver) {
            saveToHallOfFame(gameState);
        }
    }, [gameState?.isGameOver, saveToHallOfFame, gameState]);
    
    useEffect(() => {
        setIsGameLoading(false);
    }, []);

    return {
        gameState,
        setGameState: updateGameState,
        isLoading,
        setIsLoading,
        isGameLoading,
        setIsGameLoading,
    };
}
