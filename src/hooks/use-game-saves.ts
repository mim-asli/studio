
"use client";

import { useState, useCallback, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import type { GameState, SaveFile, HallOfFameEntry } from "@/lib/types";

const SAVES_KEY = "dastan-saves";
const HALL_OF_FAME_KEY = "dastan-hall-of-fame";

export function useGameSaves() {
    const { toast } = useToast();
    const [savedGames, setSavedGames] = useState<SaveFile[]>([]);
    
    const loadSavedGames = useCallback(async (): Promise<void> => {
        try {
            const savesJson = localStorage.getItem(SAVES_KEY);
            if (savesJson) {
                const saves: SaveFile[] = JSON.parse(savesJson);
                saves.sort((a, b) => b.timestamp - a.timestamp);
                setSavedGames(saves);
            } else {
                setSavedGames([]);
            }
        } catch (error) {
            console.error("Failed to load saved games list:", error);
            setSavedGames([]);
        }
    }, []);

    useEffect(() => {
        loadSavedGames();
    },[loadSavedGames]);

    const saveGame = useCallback((stateToSave?: GameState | null) => {
        if (!stateToSave || !stateToSave.gameStarted || !stateToSave.id) return;
        try {
            const newSave: SaveFile = {
                id: stateToSave.id,
                timestamp: Date.now(),
                gameState: stateToSave,
                characterName: stateToSave.characterName,
                scenarioTitle: stateToSave.scenarioTitle,
            };

            setSavedGames(prevSaves => {
                 const existingSaveIndex = prevSaves.findIndex(save => save.id === stateToSave.id);
                 let newSaves = [...prevSaves];
                if (existingSaveIndex !== -1) {
                    newSaves[existingSaveIndex] = newSave;
                } else {
                    newSaves.push(newSave);
                }
                newSaves.sort((a,b) => b.timestamp - a.timestamp);
                localStorage.setItem(SAVES_KEY, JSON.stringify(newSaves));
                return newSaves;
            });
            
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
            const saveFile = savedGames.find(save => save.id === saveId);
            if (saveFile) {
                toast({
                  title: "بازی بارگذاری شد",
                  description: "ماجراجویی شما ادامه می‌یابد!",
                });
                return saveFile.gameState;
            }
            toast({
                variant: "destructive",
                title: "فایل ذخیره یافت نشد",
                description: "فایل ذخیره مورد نظر پیدا نشد.",
            });
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
    }, [toast, savedGames]);


    const deleteSave = useCallback((saveId: string) => {
        try {
            const currentSavesJson = localStorage.getItem(SAVES_KEY);
            const currentSaves: SaveFile[] = currentSavesJson ? JSON.parse(currentSavesJson) : [];
            const newSaves = currentSaves.filter(game => game.id !== saveId);
            localStorage.setItem(SAVES_KEY, JSON.stringify(newSaves));
            setSavedGames(newSaves);
           
           toast({
               title: "فایل حذف شد",
               description: "ماجراجویی انتخاب شده با موفقیت حذف شد.",
           });
        } catch (error) {
            console.error("Failed to delete save:", error);
            toast({
                variant: "destructive",
                title: "حذف ناموفق بود",
                description: "خطایی در هنگام حذف فایل ذخیره رخ داد.",
            });
        }
    }, [toast]);

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

    const exportSave = useCallback((saveId: string) => {
        const saveFile = savedGames.find(save => save.id === saveId);
        if (!saveFile) {
            toast({ variant: 'destructive', title: 'فایل یافت نشد' });
            return;
        }

        const jsonString = JSON.stringify(saveFile, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const safeCharName = saveFile.characterName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        a.download = `dastan_save_${safeCharName}_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({ title: 'فایل با موفقیت خروجی گرفته شد!' });
    }, [savedGames, toast]);

    const importSave = useCallback(async (file: File): Promise<void> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const json = event.target?.result as string;
                    if (!json) {
                        throw new Error("فایل خالی است");
                    }
                    const newSave: SaveFile = JSON.parse(json);

                    if (!newSave.id || !newSave.timestamp || !newSave.gameState || !newSave.characterName) {
                        throw new Error("فرمت فایل ذخیره نامعتبر است.");
                    }

                    setSavedGames(prevSaves => {
                        const newSaves = [...prevSaves];
                        const existingSaveIndex = newSaves.findIndex(s => s.id === newSave.id);
                        if (existingSaveIndex > -1) {
                            newSaves[existingSaveIndex] = newSave;
                        } else {
                            newSaves.push(newSave);
                        }
                        newSaves.sort((a, b) => b.timestamp - a.timestamp);
                        localStorage.setItem(SAVES_KEY, JSON.stringify(newSaves));
                        return newSaves;
                    });

                    toast({ title: 'فایل با موفقیت وارد شد!', description: `ماجراجویی "${newSave.characterName}" اضافه شد.` });
                    resolve();
                } catch (error: any) {
                    console.error("Failed to import save:", error);
                    toast({ variant: 'destructive', title: 'وارد کردن ناموفق بود', description: error.message });
                    reject(error);
                }
            };
            reader.onerror = (error) => {
                 toast({ variant: 'destructive', title: 'خطا در خواندن فایل' });
                 reject(error);
            }
            reader.readAsText(file);
        });
    }, [toast]);

    return { savedGames, saveGame, loadGame, deleteSave, saveToHallOfFame, exportSave, importSave };
}
