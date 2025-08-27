"use client";

import { useState, useEffect, useCallback } from "react";
import type { GameState, SaveFile, CustomScenario } from "@/lib/types";
import { generateNextTurn } from "@/ai/flows/generate-next-turn";
import { useToast } from "@/hooks/use-toast";

import { StoryDisplay } from "@/components/story-display";
import { PlayerHud } from "@/components/player-hud";
import { InteractionPanel } from "@/components/interaction-panel";
import { SidebarTabs } from "@/components/sidebar-tabs";
import { SceneDisplay } from "@/components/scene-display";
import { Button } from "@/components/ui/button";
import { Loader2, Save, FilePlus, AlertTriangle } from "lucide-react";
import { StartScreen } from "./screens/start-screen";
import { CustomScenarioCreator } from "./custom-scenario-creator";
import { LoadGame } from "./load-game";
import { SettingsPage } from "./screens/settings-page";
import { Scoreboard } from "./screens/scoreboard";
import { NewGameCreator } from "./new-game-creator";

const SAVE_GAME_KEY = "dastan-savegame";

export const initialGameState: GameState = {
  story: "به داستان خوش آمدید. ماجراجویی شما در انتظار است. دنیای جدیدی بسازید یا یک سفر قبلی را بارگذاری کنید.",
  playerState: { health: 100, sanity: 100 },
  inventory: [],
  skills: [],
  quests: [],
  choices: [],
  worldState: {},
  sceneEntities: [],
  isCombat: false,
  enemies: [],
  isGameOver: false,
  gameStarted: false,
  isLoading: false,
};

type View = "start" | "game" | "new-game" | "custom-scenario" | "load-game" | "settings" | "scoreboard";

export function GameClient() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [view, setView] = useState<View>("start");
  const { toast } = useToast();

  const handleLowSanityEffect = useCallback(() => {
    if (gameState.playerState?.sanity < 30) {
      document.body.classList.add("sanity-glitch");
    } else {
      document.body.classList.remove("sanity-glitch");
    }
  }, [gameState.playerState?.sanity]);
  
  const handleLowHealthEffect = useCallback(() => {
    if (gameState.playerState?.health < 30) {
      document.body.classList.add("low-health-pulse");
    } else {
      document.body.classList.remove("low-health-pulse");
    }
  }, [gameState.playerState?.health]);

  useEffect(() => {
    handleLowSanityEffect();
    handleLowHealthEffect();
  }, [handleLowHealthEffect, handleLowSanityEffect]);

  const saveGame = useCallback(() => {
    if (!gameState.gameStarted) return;
    try {
      const saveFile: SaveFile = {
        id: "save_1",
        timestamp: Date.now(),
        gameState: gameState,
      };
      localStorage.setItem(SAVE_GAME_KEY, JSON.stringify(saveFile));
      toast({
        title: "بازی ذخیره شد",
        description: "پیشرفت شما در این دستگاه ذخیره شد.",
      });
    } catch (error) {
      console.error("Failed to save game:", error);
      toast({
        variant: "destructive",
        title: "ذخیره ناموفق بود",
        description: "بازی شما ذخیره نشد.",
      });
    }
  }, [gameState, toast]);

  const loadGame = useCallback(() => {
    try {
      const savedGameJson = localStorage.getItem(SAVE_GAME_KEY);
      if (savedGameJson) {
        const saveFile: SaveFile = JSON.parse(savedGameJson);
        setGameState({ ...saveFile.gameState, isLoading: false, gameStarted: true });
        setView("game");
        toast({
          title: "بازی بارگذاری شد",
          description: "ماجراجویی شما ادامه می‌یابد!",
        });
      } else {
        toast({
          variant: "destructive",
          title: "فایل ذخیره‌ای یافت نشد",
          description: "برای ایجاد فایل ذخیره، یک بازی جدید شروع کنید.",
        });
        return "not-found";
      }
    } catch (error) {
      console.error("Failed to load game:", error);
      toast({
        variant: "destructive",
        title: "بارگذاری ناموفق بود",
        description: "فایل ذخیره ممکن است خراب باشد.",
      });
    }
    return null;
  }, [toast]);
  
  const processPlayerAction = async (playerAction: string) => {
    setGameState(prev => ({ ...prev, isLoading: true, gameStarted: true }));
    setView("game");

    const currentGameStateForAI = { ...gameState };
    // @ts-ignore
    delete currentGameStateForAI.isLoading; 
    // @ts-ignore
    delete currentGameStateForAI.gameStarted;

    try {
      const nextTurn = await generateNextTurn({
        gameState: currentGameStateForAI,
        playerAction,
      });

      setGameState(prev => ({
        ...prev,
        ...nextTurn,
        gameStarted: true,
        isLoading: false,
      }));

      if (nextTurn.newCharacter) toast({ title: "شخصیت جدید", description: `شما با ${nextTurn.newCharacter} ملاقات کردید.` });
      if (nextTurn.newQuest) toast({ title: "مأموریت جدید", description: nextTurn.newQuest });
      if (nextTurn.newLocation) toast({ title: "مکان جدید کشف شد", description: `شما ${nextTurn.newLocation} را پیدا کردید.` });

    } catch (error) {
      console.error("Error generating next turn:", error);
      setGameState(prev => ({ ...prev, isLoading: false }));
      toast({
        variant: "destructive",
        title: "خطای هوش مصنوعی",
        description: "داستان نتوانست ادامه یابد. لطفاً یک اقدام متفاوت را امتحان کنید.",
      });
    }
  };

  const startNewGame = (scenario: CustomScenario) => {
      const playerAction = `Start a new game.
      Scenario Title: ${scenario.title}
      Character: ${scenario.character}
      Starting Items: ${scenario.initialItems}
      Opening Scene: ${scenario.storyPrompt}`;

      const freshGameState = {
        ...initialGameState,
        gameStarted: true
      };

      setGameState(freshGameState);
      processPlayerAction(playerAction);
  };

  const resetGame = () => {
    setGameState(initialGameState);
    setView("start");
  }

  if (view === "start") {
    return (
      <StartScreen 
        onNewGame={() => setView("new-game")}
        onLoadGame={() => {
            const result = loadGame();
            if (result === "not-found") {
              setView("load-game");
            }
          }}
        onCustomScenario={() => setView("custom-scenario")}
        onSettings={() => setView("settings")}
        onScoreboard={() => setView("scoreboard")}
      />
    );
  }

  if (view === "new-game") {
    return <NewGameCreator onBack={() => setView("start")} onStartGame={startNewGame} />;
  }

  if (view === "custom-scenario") {
    return <CustomScenarioCreator onBack={() => setView("start")} />;
  }
  
  if (view === "load-game") {
    return <LoadGame onBack={() => setView("start")} onLoad={loadGame} />;
  }

  if (view === "settings") {
    return <SettingsPage onBack={() => setView("start")} />;
  }

  if (view === "scoreboard") {
    return <Scoreboard onBack={() => setView("start")} />;
  }


  if (gameState.isGameOver) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 text-center">
            <AlertTriangle className="w-24 h-24 text-destructive mb-4" />
            <h1 className="text-6xl font-headline text-destructive mb-2">بازی تمام شد</h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">{gameState.story}</p>
            <Button size="lg" onClick={resetGame}>
                <FilePlus className="ml-2" /> شروع یک افسانه جدید
            </Button>
      </div>
    );
  }

  return (
    <>
      <main className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 min-h-screen bg-background text-foreground font-body p-2 sm:p-4 gap-4">
        <div className="lg:col-span-2 xl:col-span-3 flex flex-col gap-4 h-[calc(100vh-2rem)]">
          <div className="relative flex-grow border border-primary/20 rounded-lg shadow-inner bg-black/20 overflow-hidden flex flex-col">
            <StoryDisplay story={gameState.story} />
            {gameState.isLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                <Loader2 className="w-16 h-16 text-accent animate-spin" />
              </div>
            )}
          </div>
          <InteractionPanel choices={gameState.choices} onAction={processPlayerAction} isLoading={gameState.isLoading} />
        </div>

        <div className="flex flex-col gap-4 h-[calc(100vh-2rem)]">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-headline text-accent tracking-widest">داستان</h1>
            <Button size="icon" variant="outline" onClick={saveGame} disabled={gameState.isLoading}><Save /></Button>
          </div>
          <div className="flex-grow flex flex-col gap-4 overflow-y-auto pr-2">
            <PlayerHud playerState={gameState.playerState} />
            <SceneDisplay entities={gameState.sceneEntities} />
            <div className="flex-grow">
              <SidebarTabs inventory={gameState.inventory} skills={gameState.skills} quests={gameState.quests}/>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
