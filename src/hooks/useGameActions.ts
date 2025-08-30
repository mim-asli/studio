
"use client";

import { useCallback } from "react";
import { generateNextTurn } from "@/ai/flows/generate-next-turn";
import { manageCombatScenario } from "@/ai/flows/manage-combat-scenario";
import type { GameState, GenerateNextTurnOutput, ManageCombatScenarioOutput } from "@/lib/types";
import { useToast } from "./use-toast";
import { useSettingsContext } from "@/context/settings-context";
import {type GenkitErrorCode, type GenkitError} from 'genkit';

export const PLAYER_ACTION_PREFIX = "> ";

interface UseGameActionsProps {
  setIsLoading: (loading: boolean) => void;
  onStateUpdate: (newState: GameState) => void;
  onImagePrompt: (prompt: string) => void;
}

export function useGameActions({ setIsLoading, onStateUpdate, onImagePrompt }: UseGameActionsProps) {
    const { toast } = useToast();
    const { settings, setAndCycleApiKey } = useSettingsContext();

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

        const executeAI = async <T,U>(
            flow: (input: T & { apiKey?: string }) => Promise<U>,
            input: T, 
            maxRetries = settings.geminiApiKeys.length
        ): Promise<U> => {
            
            let attempts = 0;
            let currentApiKeyId: string | undefined;

            while(attempts < maxRetries) {
                const availableKeys = settings.geminiApiKeys.filter(
                    k => k.enabled && k.status !== 'invalid' && k.status !== 'quota_exceeded'
                );

                if (availableKeys.length === 0) {
                    throw new Error("No valid, enabled Gemini API keys are available.");
                }
                
                const keyToUse = availableKeys[0];
                currentApiKeyId = keyToUse.id;

                try {
                    return await flow({...input, apiKey: keyToUse.value });
                } catch (e) {
                    const err = e as GenkitError;
                    const cause = err.cause as any;

                    if ((err.code === ('unavailable' as GenkitErrorCode) || 
                         err.code === ('resourceExhausted' as GenkitErrorCode) ||
                         (cause?.status === 429))
                    ) {
                        attempts++;
                        setAndCycleApiKey(currentApiKeyId); // Mark the key as bad
                        if(attempts >= maxRetries) {
                            throw new Error("All API keys have exceeded their quota.");
                        }
                    } else {
                        // For non-quota errors, we don't retry.
                        throw err;
                    }
                }
            }
            throw new Error("Failed to get a response from the AI after multiple attempts.");
        }


        try {
            let nextState;
            if (currentState.isCombat) {
                const combatResult = await executeAI<ManageCombatScenarioOutput, ManageCombatScenarioOutput>(manageCombatScenario, {
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
                const nextTurn = await executeAI<GenerateNextTurnInput, GenerateNextTurnOutput>(generateNextTurn, {
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

        } catch (error: any) {
            console.error("Error processing player action:", error);
            
            let description = "عملیات با خطا مواجه شد. لطفاً یک اقدام متفاوت را امتحان کنید.";
            if (error.message.includes("No valid, enabled Gemini API keys are available")) {
                description = "هیچ کلید API معتبری یافت نشد. لطفاً کلیدهای خود را در صفحه تنظیمات بررسی کنید یا یک کلید جدید اضافه کنید."
            } else if (error.message.includes("All API keys have exceeded their quota")) {
                description = "سهمیه تمام کلیدهای API شما تمام شده است. لطفاً کلید جدیدی اضافه کنید یا بعداً دوباره تلاش کنید."
            }

            toast({
                variant: "destructive",
                title: "خطای هوش مصنوعی",
                description,
            });
            onStateUpdate({...currentState, isLoading: false});
        } finally {
            setIsLoading(false);
        }
    }, [setIsLoading, onStateUpdate, onImagePrompt, toast, handleGameOver, settings.geminiApiKeys, setAndCycleApiKey]);

    return { processPlayerAction };
}
