
"use client";

import { useState, useEffect, useCallback } from "react";
import type { CustomScenario } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

import { StartScreen } from "@/components/screens/start-screen";
import { LoadGame } from "@/components/screens/load-game";
import { SettingsPage } from "@/components/screens/settings-page";
import { Scoreboard } from "@/components/screens/scoreboard";
import { NewGameCreator } from "@/components/screens/new-game-creator";
import { GameClient } from "@/components/game-client";

import { useSettings } from "@/hooks/use-settings";
import { useGameLoop } from "@/hooks/use-game-loop";
import { useGameSaves } from "@/hooks/use-game-saves";
import { useImageGenerator } from "@/hooks/use-image-generator";
import type { GameState } from "@/lib/types";

type View = "start" | "game" | "new-game" | "load-game" | "settings" | "scoreboard";

const handleLowSanityEffect = (gameState: GameState | null) => {
  if (typeof document === 'undefined') return;
  if (gameState && gameState.playerState?.sanity < 30) {
    document.body.classList.add("sanity-glitch");
  } else {
    document.body.classList.remove("sanity-glitch");
  }
};

const handleLowHealthEffect = (gameState: GameState | null) => {
  if (typeof document === 'undefined') return;
  if (gameState && gameState.playerState?.health < 30) {
    document.body.classList.add("low-health-pulse");
  } else {
    document.body.classList.remove("low-health-pulse");
  }
};

export function AppManager() {
  const [view, setView] = useState<View>("start");
  const { toast } = useToast();
  const { settings } = useSettings();
  const { savedGames, loadGame, saveGame, deleteSave, saveToHallOfFame } = useGameSaves();
  
  const { currentImage, isImageLoading, generateImage, clearImage } = useImageGenerator(settings.generateImages);

  const {
      gameState,
      setGameState,
      processPlayerAction,
      handleCrafting,
      startGame,
  } = useGameLoop({
    onImagePrompt: generateImage,
    onSaveGame: saveGame,
  });

  useEffect(() => {
    handleLowSanityEffect(gameState);
    handleLowHealthEffect(gameState);
    if (gameState?.isGameOver) {
      saveToHallOfFame(gameState);
    }
  }, [gameState, saveToHallOfFame]);
  
  const handleLoadGame = useCallback(async (saveId: string) => {
    const loadedState = await loadGame(saveId);
    if (loadedState) {
        setGameState({ ...loadedState, isLoading: false, gameStarted: true });
        setView("game");
        toast({
          title: "بازی بارگذاری شد",
          description: "ماجراجویی شما ادامه می‌یابد!",
        });
    } else {
         toast({
            variant: "destructive",
            title: "فایل ذخیره یافت نشد",
            description: "فایل ذخیره مورد نظر پیدا نشد.",
        });
    }
  }, [loadGame, setGameState, toast]);

   const handleStartGame = (scenario: CustomScenario, characterName: string) => {
      startGame(scenario, characterName);
      setView("game");
  };
  
  const handleAction = useCallback((action: string) => {
    if (gameState) {
      processPlayerAction(action, gameState);
    }
  }, [gameState, processPlayerAction]);

  const resetGame = () => {
    setGameState(null);
    clearImage();
    setView("start");
  }
  
  const handleFastTravel = (location: string) => {
    handleAction(`سفر به ${location}`);
  }

  const renderContent = () => {
      switch (view) {
        case "start":
            return (
                <StartScreen 
                    onNewGame={() => setView("new-game")}
                    onLoadGame={() => setView("load-game")}
                    onSettings={() => setView("settings")}
                    onScoreboard={() => setView("scoreboard")}
                />
            );
        case "new-game":
            return <NewGameCreator onBack={() => setView("start")} onStartGame={handleStartGame} />;
        case "load-game":
            return <LoadGame onBack={() => setView("start")} onLoad={handleLoadGame} savedGames={savedGames} deleteSave={deleteSave}/>;
        case "settings":
            return <SettingsPage onBack={() => setView("start")} />;
        case "scoreboard":
            return <Scoreboard onBack={() => setView("start")} />;
        case "game":
            if (!gameState) return null; // Should not happen in this view
            return (
                <GameClient 
                    gameState={gameState}
                    handleAction={handleAction}
                    handleCrafting={handleCrafting}
                    handleFastTravel={handleFastTravel}
                    resetGame={resetGame}
                    currentImage={currentImage}
                    isImageLoading={isImageLoading}
                />
            );
        default:
          return <StartScreen onNewGame={() => setView("new-game")} onLoadGame={() => setView("load-game")} onSettings={() => setView("settings")} onScoreboard={() => setView("scoreboard")} />;
      }
  }

  return (
    <>
        {renderContent()}
    </>
  );
}
