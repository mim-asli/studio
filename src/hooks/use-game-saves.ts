
"use client";

import { useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import type { GameState, SaveFile, HallOfFameEntry } from "@/lib/types";

const SAVES_KEY = "dastan-saves";
const HALL_OF_FAME_KEY = "dastan-hall-of-fame";

export function useGameSaves() {
    const { toast } = useToast();

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

    const loadGame = useCallback(async (saveId: string): Promise<GameState | null> => {
        try {
            const savesJson = localStorage.getItem(SAVES_KEY);
            if (savesJson) {
                const saves: SaveFile[] = JSON.parse(savesJson);
                const saveFile = saves.find(save => save.id === saveId);
                return saveFile ? saveFile.gameState : null;
            }
            return null;
        } catch (error) {
            console.error("Failed to load game:", error);
            toast({
                variant: "destructive",
                title: "بارگذاری ناموفق بود",
                description: "فایل ذخیره ممکن است خراب باشد.",
            });
            return null;
        }
    }, [toast]);

    const loadSavedGames = useCallback(async (): Promise<SaveFile[]> => {
        try {
            const savesJson = localStorage.getItem(SAVES_KEY);
            if (savesJson) {
                const saves: SaveFile[] = JSON.parse(savesJson);
                saves.sort((a, b) => b.timestamp - a.timestamp);
                return saves;
            }
            return [];
        } catch (error) {
            console.error("Failed to load saved games list:", error);
            return [];
        }
    }, []);

    const deleteSave = useCallback((saveId: string) => {
        try {
            const savesJson = localStorage.getItem(SAVES_KEY);
            if (savesJson) {
                let saves: SaveFile[] = JSON.parse(savesJson);
                saves = saves.filter(game => game.id !== saveId);
                localStorage.setItem(SAVES_KEY, JSON.stringify(saves));
            }
        } catch (error) {
            console.error("Failed to delete save:", error);
        }
    }, []);

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

    return { saveGame, loadGame, loadSavedGames, deleteSave, saveToHallOfFame };
}
