"use client";

import { useState, useEffect, useCallback } from "react";
import type { GameState, SaveFile, CustomScenario, GenerateNextTurnOutput } from "@/lib/types";
import { generateNextTurn } from "@/ai/flows/generate-next-turn";
import { useToast } from "@/hooks/use-toast";

import { StoryDisplay } from "@/components/story-display";
import { PlayerHud } from "@/components/player-hud";
import { InteractionPanel } from "@/components/interaction-panel";
import { SidebarTabs } from "@/components/sidebar-tabs";
import { SceneDisplay, WorldStateDisplay } from "@/components/scene-display";
import { Button } from "@/components/ui/button";
import { Loader2, FilePlus, AlertTriangle, LogOut } from "lucide-react";
import { StartScreen } from "./screens/start-screen";
import { CustomScenarioCreator } from "./custom-scenario-creator";
import { LoadGame } from "./load-game";
import { SettingsPage } from "./screens/settings-page";
import { Scoreboard } from "./screens/scoreboard";
import { NewGameCreator } from "./new-game-creator";
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

const SAVES_KEY = "dastan-saves";
export const PLAYER_ACTION_PREFIX = "> ";

export const initialGameState: GameState = {
  id: '',
  story: ["به داستان خوش آمدید. ماجراجویی شما در انتظار است. دنیای جدیدی بسازید یا یک سفر قبلی را بارگذاری کنید."],
  playerState: { health: 100, sanity: 100, hunger: 0, thirst: 0 },
  inventory: [],
  skills: [],
  quests: [],
  choices: [],
  worldState: { day: 1, time: "صبح", weather: "آفتابی" },
  sceneEntities: [],
  companions: [],
  isCombat: false,
  enemies: [],
  isGameOver: false,
  gameStarted: false,
  isLoading: false,
  characterName: '',
  scenarioTitle: '',
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
  }, [handleLowSanityEffect, handleLowHealthEffect]);

  const saveGame = useCallback((stateToSave: GameState) => {
    if (!stateToSave.gameStarted || !stateToSave.id) return;
    try {
        const savesJson = localStorage.getItem(SAVES_KEY);
        const saves: SaveFile[] = savesJson ? JSON.parse(savesJson) : [];
        
        const newSave: SaveFile = {
            id: stateToSave.id,
            timestamp: Date.now(),
            gameState: stateToSave,
            characterName: stateToSave.characterName,
            scenarioTitle: stateToSave.scenarioTitle,
        };

        const existingSaveIndex = saves.findIndex(save => save.id === stateToSave.id);
        if (existingSaveIndex !== -1) {
            saves[existingSaveIndex] = newSave;
        } else {
            saves.push(newSave);
        }

        localStorage.setItem(SAVES_KEY, JSON.stringify(saves));
    } catch (error) {
        console.error("Failed to save game:", error);
        toast({
            variant: "destructive",
            title: "ذخیره ناموفق بود",
            description: "بازی شما ذخیره نشد.",
        });
    }
  }, [toast]);

  const loadGame = useCallback((saveId: string) => {
    try {
      const savesJson = localStorage.getItem(SAVES_KEY);
      if (savesJson) {
        const saves: SaveFile[] = JSON.parse(savesJson);
        const saveFile = saves.find(save => save.id === saveId);
        if (saveFile) {
            setGameState({ ...saveFile.gameState, isLoading: false, gameStarted: true });
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
      } else {
        toast({
          variant: "destructive",
          title: "فایل ذخیره‌ای یافت نشد",
          description: "هیچ بازی ذخیره شده‌ای وجود ندارد.",
        });
      }
    } catch (error) {
      console.error("Failed to load game:", error);
      toast({
        variant: "destructive",
        title: "بارگذاری ناموفق بود",
        description: "فایل ذخیره ممکن است خراب باشد.",
      });
    }
  }, [toast]);
  
  const processPlayerAction = async (playerAction: string) => {
    const formattedPlayerAction = `${PLAYER_ACTION_PREFIX}${playerAction}`;
    
    const currentState = {...gameState};

    setGameState(prev => ({ 
      ...prev, 
      story: [...prev.story, formattedPlayerAction],
      isLoading: true, 
      choices: [] 
    }));
    
    // Create a summarized version of the story for the AI prompt.
    const storyHistory = currentState.story.slice(-10).join('\n\n');
    
    // Create the gameState payload for the AI, ensuring it has the full state but a summarized story.
    const gameStateForAI = {
        ...currentState,
        story: storyHistory,
    };
    
    // Remove client-side only state properties from the object sent to the AI
    // @ts-ignore
    delete gameStateForAI.isLoading; 
    // @ts-ignore
    delete gameStateForAI.gameStarted;
    // @ts-ignore
    delete gameStateForAI.isGameOver;
    // @ts-ignore
    delete gameStateForAI.id;


    try {
      const nextTurn: GenerateNextTurnOutput = await generateNextTurn({
        // We send the player action without the prefix to the AI.
        gameState: gameStateForAI,
        playerAction,
      });
      
      setGameState(prevGameState => {
        const { story: newStory, ...restOfNextTurn } = nextTurn;

        const updatedGameState: GameState = {
            ...prevGameState,
            ...restOfNextTurn,
            story: [...prevGameState.story, newStory],
            gameStarted: true,
            isLoading: false,
        };

        saveGame(updatedGameState); // Auto-save after each turn
        return updatedGameState;
      });

      if (nextTurn.newCharacter) toast({ title: "شخصیت جدید", description: `شما با ${nextTurn.newCharacter} ملاقات کردید.` });
      if (nextTurn.newQuest) toast({ title: "مأموریت جدید", description: nextTurn.newQuest });
      if (nextTurn.newLocation) toast({ title: "مکان جدید کشف شد", description: `شما ${nextTurn.newLocation} را پیدا کردید.` });

    } catch (error) {
      console.error("Error generating next turn:", error);
      setGameState(prev => ({ ...prev, isLoading: false, choices: prev.choices.length > 0 ? prev.choices : ["دوباره تلاش کن"] }));
      toast({
        variant: "destructive",
        title: "خطای هوش مصنوعی",
        description: "داستان نتوانست ادامه یابد. لطفاً یک اقدام متفاوت را امتحان کنید.",
      });
    }
  };

  const handleStartGame = (scenario: CustomScenario, characterName: string) => {
    const gameId = crypto.randomUUID();
    const freshGameState: GameState = {
      ...initialGameState,
      id: gameId,
      story: [], // Start with an empty story array
      playerState: { health: 100, sanity: 100, hunger: 0, thirst: 0 },
      inventory: scenario.initialItems.split('\n').filter(i => i.trim() !== ''),
      skills: scenario.character.split(',').map(s => s.trim()),
      gameStarted: true,
      isLoading: true, // We will be loading the first turn
      choices: [],
      characterName: characterName,
      scenarioTitle: scenario.title,
    };
    
    setGameState(freshGameState);
    setView("game");
    
    // The initial prompt for the AI to start the game
    const startPrompt = `دستورالعمل‌های سناریو برای هوش مصنوعی (این متن به بازیکن نشان داده نمی‌شود):\n${scenario.storyPrompt}\n\nبازی را شروع کن و اولین صحنه را با جزئیات توصیف کن.`;
    
    processPlayerAction(startPrompt);
  };


  const resetGame = () => {
    setGameState(initialGameState);
    setView("start");
  }

  if (view === "start") {
    return (
      <StartScreen 
        onNewGame={() => setView("new-game")}
        onLoadGame={() => setView("load-game")}
        onCustomScenario={() => setView("custom-scenario")}
        onSettings={() => setView("settings")}
        onScoreboard={() => setView("scoreboard")}
      />
    );
  }

  if (view === "new-game") {
    return <NewGameCreator onBack={() => setView("start")} onStartGame={handleStartGame} />;
  }

  if (view === "custom-scenario") {
    return <CustomScenarioCreator onBack={() => setView("start")} onStartGame={handleStartGame}/>;
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
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">{gameState.story[gameState.story.length-1]}</p>
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
          <div className="relative flex-grow border rounded-md shadow-inner bg-card overflow-hidden flex flex-col">
            <StoryDisplay storySegments={gameState.story} />
            {gameState.isLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
              </div>
            )}
          </div>
          <InteractionPanel choices={gameState.choices} onAction={processPlayerAction} isLoading={gameState.isLoading} />
        </div>

        <div className="flex flex-col gap-4 h-[calc(100vh-2rem)]">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-headline text-primary tracking-widest uppercase">داستان</h1>
            <div className="flex items-center gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="icon" variant="ghost"><LogOut/></Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>بازگشت به منوی اصلی؟</AlertDialogTitle>
                    <AlertDialogDescription>
                      پیشرفت شما به صورت خودکار ذخیره شده است. آیا می‌خواهید به منوی اصلی بازگردید؟
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>لغو</AlertDialogCancel>
                    <AlertDialogAction onClick={resetGame} variant="destructive">
                        خروج
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          <div className="flex-grow flex flex-col gap-4 overflow-y-auto pr-2">
            <PlayerHud playerState={gameState.playerState} />
            <WorldStateDisplay worldState={gameState.worldState} />
            <SceneDisplay entities={gameState.sceneEntities || []} companions={gameState.companions || []} />
            <div className="flex-grow">
              <SidebarTabs inventory={gameState.inventory} skills={gameState.skills} quests={gameState.quests}/>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
