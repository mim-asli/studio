
"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { useGameLoop } from "@/hooks/use-game-loop";
import { useGameSaves } from "@/hooks/use-game-saves";
import { useImageGenerator } from "@/hooks/use-image-generator";
import type { GameState, SaveFile, CustomScenario } from "@/lib/types";
import { useSettingsContext } from './settings-context';

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
    
    const [isGameLoading, setIsGameLoading] = useState(true);

    const onGameLoad = (state: GameState) => {
        router.push('/play');
    };

    const {
        gameState,
        setGameState,
        processPlayerAction,
        handleCrafting,
        startGame: startNewGame,
        isLoading,
    } = useGameLoop({
        onImagePrompt: generateImage,
        onSaveGame: saveGame,
        onGameLoad: onGameLoad,
    });

    useEffect(() => {
        if (gameState?.isGameOver) {
            saveToHallOfFame(gameState);
        }
    }, [gameState?.isGameOver, saveToHallOfFame]);

    const startGame = useCallback((scenario: CustomScenario, characterName: string) => {
        clearImage();
        startNewGame(scenario, characterName);
        // The game loop will call onGameLoad, which triggers the redirect
    }, [startNewGame, clearImage]);

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

    // This effect runs once on initial load to set the loading state correctly.
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
