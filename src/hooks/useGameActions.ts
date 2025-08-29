
"use client";

import { useCallback } from "react";
import { generateNextTurn } from "@/ai/flows/generate-next-turn";
import { manageCombatScenario } from "@/ai/flows/manage-combat-scenario";
import type { GameState, GenerateNextTurnOutput, ManageCombatScenarioOutput } from "@/lib/types";
import { useToast } from "./use-toast";

export const PLAYER_ACTION_PREFIX = "> ";

interface UseGameActionsProps {
  setIsLoading: (loading: boolean) => void;
  onStateUpdate: (newState: GameState) => void;
  onImagePrompt: (prompt: string) => void;
}

export function useGameActions({ setIsLoading, onStateUpdate, onImagePrompt }: UseGameActionsProps) {
    const { toast } = useToast();

    const handleGameOver = useCallback((state: GameState): GameState => {
        const finalState = { ...state, isGameOver: true, isLoading: false, choices: [] };
        if (finalState.playerState.health <= 0) {
            finalState.story.push("شما مرده‌اید. داستان شما در اینجا به پایان می‌رسد.");
        }
        return finalState;
    }, []);
    
    const processPlayerAction = useCallback(async (playerAction: string, currentState: GameState) => {
        const formattedPlayerAction = `${PLAYER_ACTION_PREFIX}${playerAction}`;
        
        setIsLoading(true);

        const optimisticState: GameState = {
             ...currentState,
             story: [...currentState.story, formattedPlayerAction],
             choices: []
        }
        onStateUpdate(optimisticState);


        try {
            let nextState;
            if (currentState.isCombat) {
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
                };

            } else {
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
                };
            }

            if (nextState.playerState.health <= 0) {
                nextState = handleGameOver(nextState);
            }
            
            onStateUpdate({...nextState, isLoading: false});

        } catch (error) {
            console.error("Error processing player action:", error);
            toast({
                variant: "destructive",
                title: "خطای هوش مصنوعی",
                description: "عملیات با خطا مواجه شد. لطفاً یک اقدام متفاوت را امتحان کنید.",
            });
            onStateUpdate({...currentState, isLoading: false});
        } finally {
            setIsLoading(false);
        }
    }, [setIsLoading, onStateUpdate, onImagePrompt, toast, handleGameOver]);

    return { processPlayerAction };
}
