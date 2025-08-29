
"use client";

import React, { createContext, useContext, useCallback } from 'react';
import type { GameState, SaveFile, CustomScenario } from "@/lib/types";
import { useSettingsContext } from './settings-context';
import { useGameInitializer } from '@/hooks/useGameInitializer';
import { useGameActions } from '@/hooks/useGameActions';
import { useCraftingHandler } from '@/hooks/useCraftingHandler';
import { useImageGenerator } from '@/hooks/use-image-generator';
import { useGameSaves } from '@/hooks/use-game-saves';
import { useGameState } from '@/hooks/useGameState';
import { useRouter } from 'next/navigation';

interface GameContextType {
    gameState: GameState | null;
    isGameLoading: boolean;
    isLoading: boolean;
    currentImage: string | null;
    isImageLoading: boolean;
    savedGames: SaveFile[];
    startGame: (scenario: CustomScenario, characterName: string) => void;
    loadGame: (saveId: string) => void;
    deleteSave: (saveId: string) => void;
    resetGame: () => void;
    handleAction: (action: string) => void;
    handleCrafting: (ingredients: string[]) => void;
    handleFastTravel: (location: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { settings } = useSettingsContext();
    const router = useRouter();
    const { gameState, setGameState, isLoading, setIsLoading, isGameLoading, setIsGameLoading } = useGameState();

    const { savedGames, loadGame: loadGameFromStorage, deleteSave } = useGameSaves();
    const { currentImage, isImageLoading, generateImage, clearImage } = useImageGenerator(settings.generateImages);
    
    const onStateUpdate = useCallback((newState: GameState) => {
        setGameState(newState);
    }, [setGameState]);
    
    const { processPlayerAction } = useGameActions({ setIsLoading, onStateUpdate, onImagePrompt: generateImage });
    const { handleCrafting } = useCraftingHandler({ gameState, setIsLoading, onStateUpdate });
    
    const { startGame, resetGame } = useGameInitializer({
        onGameLoad: setGameState,
        processPlayerAction,
        clearImage,
        router
    });
    
    const loadGame = useCallback(async (saveId: string) => {
        setIsGameLoading(true);
        const loadedState = await loadGameFromStorage(saveId);
        if (loadedState) {
            setGameState({ ...loadedState, isLoading: false, gameStarted: true });
            router.push('/play');
        }
        setIsGameLoading(false);
    }, [loadGameFromStorage, setGameState, setIsGameLoading, router]);

    const handleAction = useCallback((action: string) => {
        if (gameState) {
            processPlayerAction(action, gameState);
        }
    }, [gameState, processPlayerAction]);

    const handleFastTravel = useCallback((location: string) => {
        handleAction(`سفر به ${location}`);
    }, [handleAction]);


    const value: GameContextType = {
        gameState,
        isLoading,
        isGameLoading,
        currentImage,
        isImageLoading,
        savedGames,
        startGame,
        loadGame,
        deleteSave,
        resetGame,
        handleAction,
        handleCrafting,
        handleFastTravel,
    };

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGameContext = (): GameContextType => {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error('useGameContext must be used within a GameProvider');
    }
    return context;
};
