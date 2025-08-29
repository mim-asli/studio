
"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { useGameSaves } from "@/hooks/use-game-saves";
import { useImageGenerator } from "@/hooks/use-image-generator";
import type { GameState, SaveFile, CustomScenario } from "@/lib/types";
import { useSettingsContext } from './settings-context';
import { useGameInitializer } from '@/hooks/useGameInitializer';
import { useGameActions } from '@/hooks/useGameActions';
import { useCraftingHandler } from '@/hooks/useCraftingHandler';

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
    const router = useRouter();
    const { toast } = useToast();
    const { settings } = useSettingsContext();
    const { savedGames, loadGame: loadGameFromStorage, saveGame, deleteSave, saveToHallOfFame } = useGameSaves();
    const { currentImage, isImageLoading, generateImage, clearImage } = useImageGenerator(settings.generateImages);
    
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isGameLoading, setIsGameLoading] = useState(true);


    const onGameLoad = (state: GameState) => {
        router.push('/play');
    };

    const onStateUpdate = (newState: GameState) => {
        setGameState(newState);
        saveGame(newState);
        if (newState.playerState.health <= 0) {
            setGameState(prev => prev ? {...prev, isGameOver: true, isLoading: false, choices: []} : null);
        }
    };
    
    const { startGame } = useGameInitializer({ setGameState, setIsLoading, onGameLoad, onStateUpdate, onImagePrompt: generateImage });
    const { processPlayerAction } = useGameActions({ setIsLoading, onStateUpdate, onImagePrompt: generateImage });
    const { handleCrafting } = useCraftingHandler({ gameState, setIsLoading, onStateUpdate, toast });


    useEffect(() => {
        if (gameState?.isGameOver) {
            saveToHallOfFame(gameState);
        }
    }, [gameState?.isGameOver, saveToHallOfFame, gameState]);

    const startNewGame = useCallback((scenario: CustomScenario, characterName: string) => {
        clearImage();
        startGame(scenario, characterName);
    }, [startGame, clearImage]);

    const loadGame = useCallback(async (saveId: string) => {
        setIsGameLoading(true);
        const loadedState = await loadGameFromStorage(saveId);
        if (loadedState) {
            setGameState({ ...loadedState, isLoading: false, gameStarted: true });
            toast({
              title: "بازی بارگذاری شد",
              description: "ماجراجویی شما ادامه می‌یابد!",
            });
            router.push('/play');
        } else {
             toast({
                variant: "destructive",
                title: "فایل ذخیره یافت نشد",
                description: "فایل ذخیره مورد نظر پیدا نشد.",
            });
        }
        setIsGameLoading(false);
    }, [loadGameFromStorage, setGameState, toast, router]);

    const resetGame = useCallback(() => {
        setGameState(null);
        clearImage();
        router.push('/');
    }, [setGameState, clearImage, router]);
    
    const handleAction = useCallback((action: string) => {
        if (gameState) {
            processPlayerAction(action, gameState);
        }
    }, [gameState, processPlayerAction]);

    const handleFastTravel = useCallback((location: string) => {
        handleAction(`سفر به ${location}`);
    }, [handleAction]);

    useEffect(() => {
        setIsGameLoading(false);
    }, []);

    const value: GameContextType = {
        gameState,
        isLoading: isLoading || isGameLoading,
        isGameLoading,
        currentImage,
        isImageLoading,
        savedGames,
        startGame: startNewGame,
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
