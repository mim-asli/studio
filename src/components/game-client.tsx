
"use client";

import { useState, useEffect, useCallback } from "react";
import type { GameState, SaveFile, CustomScenario, HallOfFameEntry } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { initialGameState, PLAYER_ACTION_PREFIX } from '@/lib/game-data';

import { StoryDisplay } from "@/components/story-display";
import { InteractionPanel } from "@/components/interaction-panel";
import { SidebarTabs } from "@/components/sidebar-tabs";
import { Button } from "@/components/ui/button";
import { Loader2, FilePlus, AlertTriangle, LogOut } from "lucide-react";
import { StartScreen } from "@/components/screens/start-screen";
import { LoadGame } from "@/components/screens/load-game";
import { SettingsPage } from "@/components/screens/settings-page";
import { Scoreboard } from "@/components/screens/scoreboard";
import { NewGameCreator } from "@/components/screens/new-game-creator";
import { GameDirectorChat } from "./game-director-chat";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useSettings } from "@/hooks/use-settings";
import { useGameLoop } from "@/hooks/use-game-loop";
import { useGameSaves } from "@/hooks/use-game-saves";


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

export function GameClient() {
  const [view, setView] = useState<View>("start");
  const [isDirectorChatOpen, setIsDirectorChatOpen] = useState(false);
  const { toast } = useToast();
  const { settings, isLoaded: settingsLoaded } = useSettings();
  const { loadGame, saveToHallOfFame } = useGameSaves();

  const {
      gameState,
      setGameState,
      processPlayerAction,
      handleCrafting,
      isLoading: isGameLoading,
  } = useGameLoop();

  useEffect(() => {
    handleLowSanityEffect(gameState);
    handleLowHealthEffect(gameState);
  }, [gameState]);


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
    const gameId = crypto.randomUUID();
    const characterSkills = Array.isArray(scenario.character) ? scenario.character : scenario.character.split(',').map(s => s.trim());
    const isMagical = characterSkills.some(skill => skill.toLowerCase().includes('جادوگر'));

    const freshGameState: GameState = {
      ...initialGameState,
      id: gameId,
      story: [], // Start with an empty story array
      activeEffects: [], // Clear any test effects
      playerState: { 
        health: 100, 
        sanity: 100, 
        hunger: 100, 
        thirst: 100,
        stamina: 100, // Always start with stamina
        mana: isMagical ? 100 : undefined, // Only add mana for magical characters
        ap: 4, 
        maxAp: 4,
      },
      inventory: Array.isArray(scenario.initialItems) ? scenario.initialItems : scenario.initialItems.split('\n').filter(i => i.trim() !== ''),
      skills: characterSkills,
      companions: [],
      gameStarted: true,
      isLoading: true, // We will be loading the first turn
      choices: [],
      characterName: characterName,
      scenarioTitle: scenario.title,
      currentLocation: 'شروع ماجرا', // Initial location
      discoveredLocations: ['شروع ماجرا'], // Add initial location
      difficulty: scenario.difficulty,
      gmPersonality: scenario.gmPersonality,
      isGameOver: false,
    };
    
    setGameState(freshGameState);
    setView("game");
    
    const startPrompt = `دستورالعمل‌های سناریو برای هوش مصنوعی (این متن به بازیکن نشان داده نمی‌شود):\n${scenario.storyPrompt}\n\nبازی را شروع کن و اولین صحنه را با جزئیات توصیف کن.`;
    
    // Use the action processor from the hook
    processPlayerAction(startPrompt, freshGameState);
  };


  const resetGame = () => {
    setGameState(null);
    setView("start");
  }

  // Effect for handling game over state changes
  useEffect(() => {
    if (gameState?.isGameOver) {
      saveToHallOfFame(gameState);
    }
  }, [gameState?.isGameOver, gameState, saveToHallOfFame]);


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
            return <LoadGame onBack={() => setView("start")} onLoad={handleLoadGame} />;
        case "settings":
            return <SettingsPage onBack={() => setView("start")} />;
        case "scoreboard":
            return <Scoreboard onBack={() => setView("start")} />;
        case "game":
            if (!gameState) return null; // Should not happen in this view
            if (gameState.isGameOver) {
                 return (
                    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 text-center">
                        <AlertTriangle className="w-24 h-24 text-destructive mb-4" />
                        <h1 className="text-6xl font-headline text-destructive mb-2">بازی تمام شد</h1>
                        <p className="text-xl text-muted-foreground mb-8 max-w-2xl">{gameState.story[gameState.story.length-1]}</p>
                        <Button size="lg" onClick={resetGame}>
                            <FilePlus className="ml-2" /> شروع یک افسانه جدید
                        </Button>
                  </div>
                );
            }
            return (
                 <TooltipProvider>
                  <GameDirectorChat 
                    isOpen={isDirectorChatOpen}
                    onClose={() => setIsDirectorChatOpen(false)}
                    gameState={gameState}
                  />
                  <div className="relative w-full h-screen">
                    <main className="relative grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 min-h-screen text-foreground font-body p-2 sm:p-4 gap-4">
                      <div className="lg:col-span-2 xl:col-span-3 flex flex-col gap-4 h-[calc(100vh-2rem)]">
                        <div className="relative flex-grow border rounded-md shadow-inner bg-card/80 backdrop-blur-sm overflow-hidden flex flex-col">
                           <div className="absolute inset-0 bg-black/60" />
                          <StoryDisplay storySegments={gameState.story} />
                          {gameState.isLoading && (
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
                              <Loader2 className="w-16 h-16 text-primary animate-spin" />
                            </div>
                          )}
                        </div>
                        <InteractionPanel 
                          choices={gameState.choices} 
                          onAction={(action) => processPlayerAction(action, gameState)} 
                          isLoading={gameState.isLoading}
                          onDirectorChat={() => setIsDirectorChatOpen(true)}
                        />
                      </div>

                      <div className="flex flex-col gap-4 h-[calc(100vh-2rem)]">
                        <div className="flex justify-between items-center">
                          <h1 className="text-4xl font-headline text-primary tracking-widest uppercase">داستان</h1>
                          <div className="flex items-center gap-2">
                            <AlertDialog>
                              <Tooltip>
                                  <TooltipTrigger asChild>
                                    <AlertDialogTrigger asChild>
                                      <Button size="icon" variant="ghost"><LogOut/></Button>
                                    </AlertDialogTrigger>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>خروج به منوی اصلی</p>
                                  </TooltipContent>
                                </Tooltip>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>بازگشت به منوی اصلی؟</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    پیشرفت شما به صورت خودکار ذخیره شده است. آیا می‌خواهید به منوی اصلی بازگردید؟
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>لغو</AlertDialogCancel>
                                  <AlertDialogAction onClick={resetGame}>
                                    خروج
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                        <div className="flex-grow flex flex-col overflow-hidden">
                          <SidebarTabs 
                            gameState={gameState}
                            onCraft={handleCrafting}
                            isCrafting={gameState.isLoading}
                            onFastTravel={(location) => processPlayerAction(location, gameState)}
                          />
                        </div>
                      </div>
                    </main>
                  </div>
                </TooltipProvider>
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
