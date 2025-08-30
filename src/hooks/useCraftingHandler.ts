
"use client";

import { useCallback } from "react";
import { craftItem } from "@/ai/flows/craft-item-flow";
import type { GameState, CraftItemOutput } from "@/lib/types";
import { useToast } from "./use-toast";
import { useSettingsContext } from "@/context/settings-context";

interface UseCraftingHandlerProps {
  gameState: GameState | null;
  setIsLoading: (loading: boolean) => void;
  onStateUpdate: (newState: GameState) => void;
}

export function useCraftingHandler({ gameState, setIsLoading, onStateUpdate }: UseCraftingHandlerProps) {
  const { toast } = useToast();
  const { settings } = useSettingsContext();

  const handleCrafting = useCallback(async (ingredients: string[]) => {
    if (!gameState) return;
    
    setIsLoading(true);
    const formattedPlayerAction = `> ترکیب کردن: ${ingredients.join('، ')}`;

    try {
        const availableKeys = settings.geminiApiKeys.filter(k => k.enabled && k.value && k.status !== 'invalid' && k.status !== 'quota_exceeded');
        if (availableKeys.length === 0) {
            throw new Error("No valid API key available.");
        }
        const apiKey = availableKeys[0].value;


        const result: CraftItemOutput = await craftItem({
            ingredients,
            playerSkills: gameState.skills,
            apiKey: apiKey,
        });

        let newInventory = [...gameState.inventory];
        
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
            ...gameState,
            inventory: newInventory,
            story: [...gameState.story, formattedPlayerAction, `[ساخت و ساز]: ${result.message}`],
            isLoading: false,
        };

        onStateUpdate(updatedGameState);

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
  }, [gameState, setIsLoading, onStateUpdate, toast, settings.geminiApiKeys]);

  return { handleCrafting };
}
