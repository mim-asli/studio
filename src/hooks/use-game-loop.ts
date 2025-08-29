
"use client";

import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { craftItem } from "@/ai/flows/craft-item-flow";
import { generateNextTurn } from "@/ai/flows/generate-next-turn";
import { manageCombatScenario } from "@/ai/flows/manage-combat-scenario";
import type { GameState, CraftItemOutput, CustomScenario, GenerateNextTurnOutput, ManageCombatScenarioOutput } from "@/lib/types";
import { initialGameState } from "@/lib/game-data";

export const PLAYER_ACTION_PREFIX = "> ";

interface UseGameLoopProps {
    onImagePrompt: (prompt: string) => void;
    onSaveGame: (gameState: GameState) => void;
    onGameLoad: (gameState: GameState) => void;
}

export function useGameLoop({ onImagePrompt, onSaveGame, onGameLoad }: UseGameLoopProps) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleGameOver = useCallback((state: GameState): GameState => {
    const finalState = { ...state, isGameOver: true, isLoading: false, choices: [] };
    if (finalState.playerState.health <= 0) {
        finalState.story.push("شما مرده‌اید. داستان شما در اینجا به پایان می‌رسد.");
    }
    return finalState;
  }, []);

  const processPlayerAction = useCallback(async (playerAction: string, currentState: GameState | null) => {
    if (!currentState) return;
    const formattedPlayerAction = `${PLAYER_ACTION_PREFIX}${playerAction}`;
    
    setIsLoading(true);
    setGameState(prev => (prev ? { 
      ...prev, 
      story: [...prev.story, formattedPlayerAction],
      choices: [] 
    }: null));

    try {
        let nextState;
        if (currentState.isCombat) {
            // Logic from handleCombatTurn
            const combatResult: ManageCombatScenarioOutput = await manageCombatScenario({
                playerAction,
                playerState: currentState.playerState,
                enemies: currentState.enemies || [],
                combatLog: currentState.story.slice(-5),
            });

            const { turnNarration, updatedPlayerState, updatedEnemies, choices, isCombatOver, rewards } = combatResult;

            const newStory = [...currentState.story, formattedPlayerAction, turnNarration];
            let newInventory = currentState.inventory;

            if (isCombatOver) {
                newStory.push("مبارزه تمام شد.");
                if (rewards && rewards.items && rewards.items.length > 0) {
                    newInventory = [...newInventory, ...rewards.items];
                    const rewardText = `شما به دست آوردید: ${rewards.items.join(', ')}`;
                    newStory.push(rewardText);
                    toast({ title: "غنائم جنگی!", description: rewardText });
                }
            }

            nextState = {
                ...currentState,
                story: newStory,
                playerState: updatedPlayerState,
                enemies: updatedEnemies,
                choices: isCombatOver ? ["ادامه بده..."] : choices,
                isCombat: !isCombatOver,
                inventory: newInventory,
                isLoading: false,
            };

        } else {
            // Logic from handleExplorationTurn
            const gameStateForAI = JSON.stringify(currentState);
            const nextTurn: GenerateNextTurnOutput = await generateNextTurn({
                gameState: gameStateForAI,
                playerAction,
                difficulty: currentState.difficulty,
                gmPersonality: currentState.gmPersonality,
            });

            if (nextTurn.imagePrompt) {
                onImagePrompt(nextTurn.imagePrompt);
            }

            if (nextTurn.newCharacter) toast({ title: "شخصیت جدید", description: `شما با ${nextTurn.newCharacter} ملاقات کردید.` });
            if (nextTurn.newQuest) toast({ title: "مأموریت جدید", description: nextTurn.newQuest });
            if (nextTurn.newLocation) toast({ title: "مکان جدید کشف شد", description: `شما ${nextTurn.newLocation} را پیدا کردید.` });

            const { story: newStory, ...restOfNextTurn } = nextTurn;

            nextState = {
                ...currentState,
                ...restOfNextTurn,
                story: [...currentState.story, formattedPlayerAction, newStory],
                gameStarted: true,
                isLoading: false,
            };
        }

        if (nextState.playerState.health <= 0) {
            nextState = handleGameOver(nextState);
        }
        
        nextState.isLoading = false;
        onSaveGame(nextState);
        setGameState(nextState);

    } catch (error) {
      console.error("Error processing player action:", error);
      toast({
        variant: "destructive",
        title: "خطای هوش مصنوعی",
        description: "عملیات با خطا مواجه شد. لطفاً یک اقدام متفاوت را امتحان کنید.",
      });
      // Restore previous state and choices on error
      setGameState(currentState);
    } finally {
        setIsLoading(false);
    }
  }, [onImagePrompt, onSaveGame, toast, handleGameOver]);

  const handleCrafting = useCallback(async (ingredients: string[]) => {
    if (!gameState) return;
    setIsLoading(true);
    const formattedPlayerAction = `${PLAYER_ACTION_PREFIX}ترکیب کردن: ${ingredients.join('، ')}`;
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
                story: [...prev.story, formattedPlayerAction, `[ساخت و ساز]: ${result.message}`],
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
        toast({
            variant: "destructive",
            title: "خطای ساخت و ساز",
            description: "یک خطای پیش‌بینی نشده در سیستم ساخت و ساز رخ داد.",
        });
    } finally {
        setIsLoading(false);
    }
  }, [gameState, onSaveGame, toast]);
  
  const startGame = useCallback((scenario: CustomScenario, characterName: string) => {
    setIsLoading(true);
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
    
    setGameState(freshGameState);
    onGameLoad(freshGameState);

    const startPrompt = `دستورالعمل‌های سناریو برای هوش مصنوعی (این متن به بازیکن نشان داده نمی‌شود):\\n${scenario.storyPrompt}\\n\\nبازی را شروع کن و اولین صحنه را با جزئیات توصیف کن.`;
    
    processPlayerAction(startPrompt, freshGameState);
  }, [processPlayerAction, onGameLoad]);


  return {
    gameState,
    setGameState,
    processPlayerAction,
    handleCrafting,
    startGame,
    isLoading,
  };
}
