
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { GameState, SaveFile, CustomScenario, GenerateNextTurnOutput, CraftItemOutput, ActiveEffect, HallOfFameEntry } from "@/lib/types";
import { generateNextTurn } from "@/ai/flows/generate-next-turn";
import { manageCombatScenario, ManageCombatScenarioOutput } from "@/ai/flows/manage-combat-scenario";
import { craftItem } from "@/ai/flows/craft-item-flow";
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


const SAVES_KEY = "dastan-saves";
const HALL_OF_FAME_KEY = "dastan-hall-of-fame";


type View = "start" | "game" | "new-game" | "load-game" | "settings" | "scoreboard";

const handleLowSanityEffect = (gameState: GameState | null) => {
  if (gameState && gameState.playerState?.sanity < 30) {
    document.body.classList.add("sanity-glitch");
  } else {
    document.body.classList.remove("sanity-glitch");
  }
};

const handleLowHealthEffect = (gameState: GameState | null) => {
  if (gameState && gameState.playerState?.health < 30) {
    document.body.classList.add("low-health-pulse");
  } else {
    document.body.classList.remove("low-health-pulse");
  }
};

export function GameClient() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [view, setView] = useState<View>("start");
  const [isDirectorChatOpen, setIsDirectorChatOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    handleLowSanityEffect(gameState);
    handleLowHealthEffect(gameState);
  }, [gameState]);

  const saveToHallOfFame = useCallback((finalState: GameState) => {
    try {
        const hallOfFameJson = localStorage.getItem(HALL_OF_FAME_KEY);
        const entries: HallOfFameEntry[] = hallOfFameJson ? JSON.parse(hallOfFameJson) : [];

        const newEntry: HallOfFameEntry = {
            id: finalState.id,
            characterName: finalState.characterName,
            scenarioTitle: finalState.scenarioTitle,
            outcome: finalState.story[finalState.story.length - 1] || "سرنوشت نامعلوم",
            daysSurvived: finalState.worldState.day,
            timestamp: Date.now(),
        };

        // Avoid duplicate entries for the same game session
        if (!entries.some(entry => entry.id === newEntry.id)) {
            entries.push(newEntry);
            localStorage.setItem(HALL_OF_FAME_KEY, JSON.stringify(entries));
            toast({
                title: "یک حماسه به پایان رسید!",
                description: `داستان ${finalState.characterName} در تالار افتخارات ثبت شد.`,
            });
        }
    } catch (error) {
        console.error("Failed to save to Hall of Fame:", error);
    }
  }, [toast]);


  const saveGame = useCallback((stateToSave?: GameState | null) => {
    if (!stateToSave || !stateToSave.gameStarted || !stateToSave.id) return;
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

  const handleGameOver = useCallback((state: GameState) => {
    const finalState = { ...state, isGameOver: true };
    if (finalState.playerState.health <= 0) {
        finalState.story.push("شما مرده‌اید. داستان شما در اینجا به پایان می‌رسد.");
    }
    saveToHallOfFame(finalState);
    return finalState;
  }, [saveToHallOfFame]);
  
  const processPlayerAction = async (playerAction: string) => {
    if (!gameState) return;
    const formattedPlayerAction = `${PLAYER_ACTION_PREFIX}${playerAction}`;
    const stateBeforeAction = { ...gameState };

    setGameState(prev => (prev ? { 
      ...prev, 
      story: [...prev.story, formattedPlayerAction],
      isLoading: true, 
      choices: [] 
    }: null));

    try {
        if (stateBeforeAction.isCombat) {
            await handleCombatTurn(playerAction, stateBeforeAction);
        } else {
            await handleExplorationTurn(playerAction, stateBeforeAction);
        }
    } catch (error) {
      console.error("Error processing player action:", error);
      setGameState(prev => (prev ? { 
          ...prev, 
          isLoading: false, 
          choices: stateBeforeAction.choices.length > 0 ? stateBeforeAction.choices : ["دوباره تلاش کن"] 
      }: null));
      toast({
        variant: "destructive",
        title: "خطای هوش مصنوعی",
        description: "عملیات با خطا مواجه شد. لطفاً یک اقدام متفاوت را امتحان کنید.",
      });
    }
  };

  const handleExplorationTurn = async (playerAction: string, stateBeforeAction: GameState) => {
    const gameStateForAI = JSON.stringify(stateBeforeAction);

    const nextTurn: GenerateNextTurnOutput = await generateNextTurn({
        gameState: gameStateForAI,
        playerAction,
        difficulty: stateBeforeAction.difficulty,
        gmPersonality: stateBeforeAction.gmPersonality,
    });
    
    setGameState(prevGameState => {
        if (!prevGameState) return null;
        const { story: newStory, ...restOfNextTurn } = nextTurn;

        let updatedGameState: GameState = {
            ...prevGameState,
            ...restOfNextTurn,
            story: [...prevGameState.story, newStory], 
            gameStarted: true,
            isLoading: false,
        };

        if (updatedGameState.playerState.health <= 0) {
            updatedGameState = handleGameOver(updatedGameState);
        }

        saveGame(updatedGameState);
        return updatedGameState;
    });

    if (nextTurn.newCharacter) toast({ title: "شخصیت جدید", description: `شما با ${nextTurn.newCharacter} ملاقات کردید.` });
    if (nextTurn.newQuest) toast({ title: "مأموریت جدید", description: nextTurn.newQuest });
    if (nextTurn.newLocation) toast({ title: "مکان جدید کشف شد", description: `شما ${nextTurn.newLocation} را پیدا کردید.` });
  };
  
  const handleCombatTurn = async (playerAction: string, stateBeforeAction: GameState) => {
    const combatResult: ManageCombatScenarioOutput = await manageCombatScenario({
        playerAction,
        playerState: stateBeforeAction.playerState,
        enemies: stateBeforeAction.enemies || [],
        combatLog: stateBeforeAction.story.slice(-5), // Pass recent history as combat log
    });

    setGameState(prev => {
        if (!prev) return null;
        const { turnNarration, updatedPlayerState, updatedEnemies, choices, isCombatOver, rewards } = combatResult;
        
        const newStory = [...prev.story, turnNarration];
        let newInventory = prev.inventory;
        
        if (isCombatOver) {
            newStory.push("مبارزه تمام شد.");
            if (rewards && rewards.items) {
                newInventory = [...newInventory, ...rewards.items];
                const rewardText = `شما به دست آوردید: ${rewards.items.join(', ')}`;
                newStory.push(rewardText);
                toast({ title: "غنائم جنگی!", description: rewardText });
            }
        }
        
        let updatedGameState: GameState = {
            ...prev,
            story: newStory,
            playerState: updatedPlayerState,
            enemies: updatedEnemies,
            choices: isCombatOver ? ["ادامه بده..."] : choices,
            isCombat: !isCombatOver,
            inventory: newInventory,
            isLoading: false,
        };

        if (updatedPlayerState.health <= 0) {
            updatedGameState = handleGameOver(updatedGameState);
        }

        saveGame(updatedGameState);
        return updatedGameState;
    });
  };

  const handleCrafting = async (ingredients: string[]) => {
    if (!gameState) return;
    setGameState(prev => (prev ? { ...prev, isLoading: true } : null));
    try {
        const result: CraftItemOutput = await craftItem({
            ingredients,
            playerSkills: gameState.skills,
        });

        setGameState(prev => {
            if (!prev) return null;
            let newInventory = [...prev.inventory];
            // Remove consumed items
            result.consumedItems.forEach(consumed => {
                const index = newInventory.findIndex(item => item === consumed);
                if (index > -1) {
                    newInventory.splice(index, 1);
                }
            });
            // Add created item
            if (result.success && result.createdItem) {
                newInventory.push(result.createdItem);
            }
            
            const updatedGameState: GameState = {
                ...prev,
                inventory: newInventory,
                isLoading: false,
                story: [...prev.story, `[ساخت و ساز]: ${result.message}`],
            };

            saveGame(updatedGameState);
            return updatedGameState;
        });

        toast({
            title: result.success ? "ساخت و ساز موفق" : "ساخت و ساز ناموفق",
            description: result.message,
            variant: result.success ? "default" : "destructive",
        });

    } catch (error) {
        console.error("Crafting error:", error);
        setGameState(prev => (prev ? { ...prev, isLoading: false } : null));
        toast({
            variant: "destructive",
            title: "خطای ساخت و ساز",
            description: "یک خطای پیش‌بینی نشده در سیستم ساخت و ساز رخ داد.",
        });
    }
  };

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
    
    processPlayerAction(startPrompt);
  };


  const resetGame = () => {
    setGameState(null);
    setView("start");
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
            return <LoadGame onBack={() => setView("start")} onLoad={loadGame} />;
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
                          onAction={processPlayerAction} 
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
                            onFastTravel={processPlayerAction}
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
