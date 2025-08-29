
"use client";

import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { craftItem } from "@/ai/flows/craft-item-flow";
import type { GameState, CraftItemOutput, CustomScenario } from "@/lib/types";
import { initialGameState } from "@/lib/game-data";
import { handleCombatTurn, handleExplorationTurn } from "@/lib/game-manager";

export const PLAYER_ACTION_PREFIX = "> ";

interface UseGameLoopProps {
    onImagePrompt: (prompt: string) => void;
    onSaveGame: (gameState: GameState) => void;
}

export function useGameLoop({ onImagePrompt, onSaveGame }: UseGameLoopProps) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const { toast } = useToast();
  
  const handleGameOver = useCallback((state: GameState): GameState => {
    const finalState = { ...state, isGameOver: true, isLoading: false, choices: [] };
    if (finalState.playerState.health <= 0) {
        finalState.story.push("شما مرده‌اید. داستان شما در اینجا به پایان می‌رسد.");
    }
    // The actual saving to hall of fame is handled by an effect in AppManager
    // watching for the isGameOver flag.
    return finalState;
  }, []);

  const processPlayerAction = useCallback(async (playerAction: string, currentState: GameState | null) => {
    if (!currentState) return;
    const formattedPlayerAction = `${PLAYER_ACTION_PREFIX}${playerAction}`;
    
    // Set loading state and add player action to story immediately
    setGameState(prev => (prev ? { 
      ...prev, 
      story: [...prev.story, formattedPlayerAction],
      isLoading: true, 
      choices: [] 
    }: null));

    try {
        let nextState;
        if (currentState.isCombat) {
            nextState = await handleCombatTurn(currentState, playerAction, toast);
        } else {
            nextState = await handleExplorationTurn(currentState, playerAction, onImagePrompt, toast);
        }

        // Check for game over condition
        if (nextState.playerState.health <= 0) {
            nextState = handleGameOver(nextState);
        }
        
        onSaveGame(nextState);
        setGameState(nextState);

    } catch (error) {
      console.error("Error processing player action:", error);
      toast({
        variant: "destructive",
        title: "خطای هوش مصنوعی",
        description: "عملیات با خطا مواجه شد. لطفاً یک اقدام متفاوت را امتحان کنید.",
      });
      // Revert to the state before the failed action, but stop loading
      setGameState(prev => (prev ? { 
          ...currentState, 
          isLoading: false, 
          choices: currentState.choices.length > 0 ? currentState.choices : ["دوباره تلاش کن"] 
      }: null));
    }
  }, [gameState, onImagePrompt, onSaveGame, toast, handleGameOver]);

  const handleCrafting = useCallback(async (ingredients: string[]) => {
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
            
            result.consumedItems.forEach(consumed => {
                const index = newInventory.findIndex(item => item === consumed);
                if (index > -1) {
                    newInventory.splice(index, 1);
                }
            });
            
            if (result.success && result.createdItem) {
                newInventory.push(result.createdItem);
            }
            
            const updatedGameState: GameState = {
                ...prev,
                inventory: newInventory,
                isLoading: false,
                story: [...prev.story, `[ساخت و ساز]: ${result.message}`],
            };

            onSaveGame(updatedGameState);
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
  }, [gameState, onSaveGame, toast]);
  
  const startGame = useCallback((scenario: CustomScenario, characterName: string) => {
    const gameId = crypto.randomUUID();
    const characterSkills = Array.isArray(scenario.character) ? scenario.character : scenario.character.split(',').map(s => s.trim());
    const isMagical = characterSkills.some(skill => skill.toLowerCase().includes('جادوگر'));

    const freshGameState: GameState = {
      ...initialGameState,
      id: gameId,
      story: [],
      activeEffects: [],
      playerState: { 
        health: 100, 
        sanity: 100, 
        hunger: 100, 
        thirst: 100,
        stamina: 100,
        mana: isMagical ? 100 : undefined,
        ap: 4, 
        maxAp: 4,
      },
      inventory: Array.isArray(scenario.initialItems) ? scenario.initialItems : scenario.initialItems.split('\\n').filter(i => i.trim() !== ''),
      skills: characterSkills,
      companions: [],
      gameStarted: true,
      isLoading: true,
      choices: [],
      characterName: characterName,
      scenarioTitle: scenario.title,
      currentLocation: 'شروع ماجرا',
      discoveredLocations: ['شروع ماجرا'],
      difficulty: scenario.difficulty,
      gmPersonality: scenario.gmPersonality,
      isGameOver: false,
    };
    
    // We don't set the state here directly. Instead, we start the first turn.
    const startPrompt = `دستورالعمل‌های سناریو برای هوش مصنوعی (این متن به بازیکن نشان داده نمی‌شود):\\n${scenario.storyPrompt}\\n\\nبازی را شروع کن و اولین صحنه را با جزئیات توصیف کن.`;
    
    processPlayerAction(startPrompt, freshGameState);
  }, [processPlayerAction]);


  return {
    gameState,
    setGameState,
    processPlayerAction,
    handleCrafting,
    startGame,
    isLoading: gameState?.isLoading ?? false,
  };
}
