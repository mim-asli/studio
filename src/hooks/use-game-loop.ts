
"use client";

import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { generateNextTurn } from "@/ai/flows/generate-next-turn";
import { manageCombatScenario } from "@/ai/flows/manage-combat-scenario";
import { craftItem } from "@/ai/flows/craft-item-flow";
import { generateImage } from "@/ai/flows/generate-image-flow";
import type { GameState, GenerateNextTurnOutput, ManageCombatScenarioOutput, CraftItemOutput, CustomScenario } from "@/lib/types";
import { initialGameState } from "@/lib/game-data";
import { useGameSaves } from "./use-game-saves";

export const PLAYER_ACTION_PREFIX = "> ";

export function useGameLoop(imageGenEnabled: boolean) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const { toast } = useToast();
  const { saveGame } = useGameSaves();

  useEffect(() => {
    // Clear image when game starts or resets
    if (!gameState) {
      setCurrentImage(null);
      setIsImageLoading(false);
    }
  }, [gameState]);


  const handleGameOver = useCallback((state: GameState): GameState => {
    const finalState = { ...state, isGameOver: true, isLoading: false, choices: [] };
    if (finalState.playerState.health <= 0) {
        finalState.story.push("شما مرده‌اید. داستان شما در اینجا به پایان می‌رسد.");
    }
    // The actual saving to hall of fame is handled by an effect in GameClient
    // watching for the isGameOver flag.
    return finalState;
  }, []);

  const handleImageGeneration = useCallback(async (prompt: string) => {
    if (!imageGenEnabled) return;
    setIsImageLoading(true);
    try {
      const imageUrl = await generateImage(prompt);
      setCurrentImage(imageUrl);
    } catch (error) {
      console.error("Image generation failed:", error);
      toast({
        variant: "destructive",
        title: "خطا در تولید تصویر",
        description: "متاسفانه تولید تصویر با مشکل مواجه شد.",
      });
    } finally {
      setIsImageLoading(false);
    }
  }, [imageGenEnabled, toast]);

  const handleExplorationTurn = useCallback(async (playerAction: string, stateBeforeAction: GameState) => {
    const gameStateForAI = JSON.stringify(stateBeforeAction);

    const nextTurn: GenerateNextTurnOutput = await generateNextTurn({
        gameState: gameStateForAI,
        playerAction,
        difficulty: stateBeforeAction.difficulty,
        gmPersonality: stateBeforeAction.gmPersonality,
    });
    
    // Trigger image generation if prompt is provided
    if (nextTurn.imagePrompt) {
        handleImageGeneration(nextTurn.imagePrompt);
    }
    
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
  }, [handleGameOver, saveGame, toast, handleImageGeneration]);
  
  const handleCombatTurn = useCallback(async (playerAction: string, stateBeforeAction: GameState) => {
    const combatResult: ManageCombatScenarioOutput = await manageCombatScenario({
        playerAction,
        playerState: stateBeforeAction.playerState,
        enemies: stateBeforeAction.enemies || [],
        combatLog: stateBeforeAction.story.slice(-5),
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
  }, [handleGameOver, saveGame, toast]);

  const processPlayerAction = useCallback(async (playerAction: string, currentState: GameState | null) => {
    if (!currentState) return;
    const formattedPlayerAction = `${PLAYER_ACTION_PREFIX}${playerAction}`;
    const stateBeforeAction = { ...currentState };

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
  }, [handleCombatTurn, handleExplorationTurn, toast]);

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
  }, [gameState, saveGame, toast]);
  
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
      inventory: Array.isArray(scenario.initialItems) ? scenario.initialItems : scenario.initialItems.split('\n').filter(i => i.trim() !== ''),
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
    
    const startPrompt = `دستورالعمل‌های سناریو برای هوش مصنوعی (این متن به بازیکن نشان داده نمی‌شود):\n${scenario.storyPrompt}\n\nبازی را شروع کن و اولین صحنه را با جزئیات توصیف کن.`;
    
    processPlayerAction(startPrompt, freshGameState);
  }, [processPlayerAction]);


  return {
    gameState,
    setGameState,
    processPlayerAction,
    handleCrafting,
    startGame,
    isLoading: gameState?.isLoading ?? false,
    currentImage,
    isImageLoading,
  };
}
