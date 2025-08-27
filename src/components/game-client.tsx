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
import { NewGameModal } from "@/components/new-game-modal";
import { Button } from "@/components/ui/button";
import { Loader2, Save, FilePlus, AlertTriangle, Volume2, VolumeX } from "lucide-react";

const SAVE_GAME_KEY = "dastan-savegame";

const initialGameState: GameState = {
  story: "Welcome to Dastan. Your adventure awaits. Create a new world or load a previous journey.",
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

export function GameClient() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [showNewGameModal, setShowNewGameModal] = useState(false);
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
        title: "Game Saved",
        description: "Your progress has been saved to this device.",
      });
    } catch (error) {
      console.error("Failed to save game:", error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not save your game.",
      });
    }
  }, [gameState, toast]);

  const loadGame = useCallback(() => {
    try {
      const savedGameJson = localStorage.getItem(SAVE_GAME_KEY);
      if (savedGameJson) {
        const saveFile: SaveFile = JSON.parse(savedGameJson);
        setGameState({ ...saveFile.gameState, isLoading: false });
        toast({
          title: "Game Loaded",
          description: "Your adventure continues!",
        });
      } else {
        toast({
          variant: "destructive",
          title: "No Save File Found",
          description: "Start a new game to create a save file.",
        });
      }
    } catch (error) {
      console.error("Failed to load game:", error);
      toast({
        variant: "destructive",
        title: "Load Failed",
        description: "The save file might be corrupted.",
      });
    }
  }, [toast]);
  
  const processPlayerAction = async (playerAction: string) => {
    setGameState(prev => ({ ...prev, isLoading: true }));

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

      if (nextTurn.newCharacter) toast({ title: "New Character", description: `You met ${nextTurn.newCharacter}.` });
      if (nextTurn.newQuest) toast({ title: "New Quest", description: nextTurn.newQuest });
      if (nextTurn.newLocation) toast({ title: "Location Discovered", description: `You have found ${nextTurn.newLocation}.` });

    } catch (error) {
      console.error("Error generating next turn:", error);
      setGameState(prev => ({ ...prev, isLoading: false }));
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "The story could not proceed. Please try a different action.",
      });
    }
  };

  const startNewGame = (scenario: CustomScenario) => {
      const playerAction = `Start a new game.
      Genre: ${scenario.genre}
      Character: ${scenario.character}
      Starting Items: ${scenario.initialItems}
      Opening Scene: ${scenario.storyPrompt}`;

      const freshGameState = {
        ...initialGameState,
        gameStarted: true
      };

      setGameState(freshGameState);
      setShowNewGameModal(false);
      processPlayerAction(playerAction);
  };

  if (!gameState.gameStarted) {
    return (
      <>
        <NewGameModal 
            open={showNewGameModal} 
            onOpenChange={setShowNewGameModal} 
            onStartGame={startNewGame}
        />
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
          <h1 className="text-6xl font-headline text-accent mb-2 tracking-widest">DASTAN</h1>
          <p className="text-xl text-muted-foreground mb-8">An Endless AI Role-Playing Game</p>
          <div className="flex gap-4">
            <Button size="lg" onClick={() => setShowNewGameModal(true)}>
              <FilePlus className="mr-2" /> New Game
            </Button>
            <Button size="lg" variant="secondary" onClick={loadGame}>
              <Save className="mr-2" /> Load Game
            </Button>
          </div>
        </div>
      </>
    );
  }

  if (gameState.isGameOver) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 text-center">
            <AlertTriangle className="w-24 h-24 text-destructive mb-4" />
            <h1 className="text-6xl font-headline text-destructive mb-2">Game Over</h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">{gameState.story}</p>
            <Button size="lg" onClick={() => setGameState(initialGameState)}>
                <FilePlus className="mr-2" /> Start a New Legend
            </Button>
      </div>
    );
  }

  return (
    <>
      <NewGameModal 
        open={showNewGameModal} 
        onOpenChange={setShowNewGameModal} 
        onStartGame={startNewGame}
      />
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
            <h1 className="text-2xl font-headline text-accent tracking-widest">DASTAN</h1>
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
