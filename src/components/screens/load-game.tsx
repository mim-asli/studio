
"use client";

import { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
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
import type { SaveFile } from '@/lib/types';
import { useGameSaves } from '@/hooks/use-game-saves';

interface LoadGameProps {
    onBack: () => void;
    onLoad: (saveId: string) => void;
}

export function LoadGame({ onBack, onLoad }: LoadGameProps) {
    const { savedGames, deleteSave, loadSavedGames } = useGameSaves();
    const [games, setGames] = useState<SaveFile[]>([]);
    
    useEffect(() => {
        const fetchGames = async () => {
            const loadedGames = await loadSavedGames();
            setGames(loadedGames);
        }
        fetchGames();
    }, [loadSavedGames]);

    const handleDeleteGame = (saveId: string) => {
        deleteSave(saveId);
        setGames(currentGames => currentGames.filter(game => game.id !== saveId));
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
            <div className="w-full max-w-2xl">
                <div className="flex justify-between items-center mb-8">
                    <Button onClick={onBack} variant="ghost" size="icon">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <h1 className="text-4xl font-headline text-primary">بارگذاری ماجراجویی</h1>
                    <div className="w-10"></div>
                </div>

                <Card className="mb-6 border-primary/20">
                    <CardHeader>
                        <CardTitle>بازی‌های ذخیره شده</CardTitle>
                        <CardDescription>یک ماجراجویی را برای ادامه انتخاب کنید.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {games.length > 0 ? (
                            <ul className="space-y-3">
                                {games.map((save) => (
                                     <li key={save.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 group border hover:border-primary/50 transition-colors">
                                        <div className="flex-1 overflow-hidden">
                                            <p className="font-semibold truncate">{save.characterName || 'شخصیت بی‌نام'}</p>
                                            <p className="text-sm text-muted-foreground truncate">{save.scenarioTitle}</p>
                                            <p className="text-xs text-muted-foreground/70 mt-1">
                                                آخرین ذخیره: {new Date(save.timestamp).toLocaleString('fa-IR')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => onLoad(save.id)}>
                                                بارگذاری
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-destructive opacity-50 group-hover:opacity-100 transition-opacity">
                                                        <Trash2 className="w-4 h-4"/>
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>آیا مطمئن هستید؟</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                           این عمل قابل بازگشت نیست. این کار ماجراجویی "{save.characterName}" را برای همیشه حذف خواهد کرد.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>لغو</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteGame(save.id)} className="bg-destructive hover:bg-destructive/90">
                                                            حذف
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground text-center py-8">
                                هیچ بازی ذخیره شده‌ای یافت نشد.
                            </p>
                        )}
                    </CardContent>
                </Card>
                 <div className="text-center mt-10">
                    <Button onClick={onBack}>
                        <ArrowLeft className="ml-2" />
                        بازگشت به منوی اصلی
                    </Button>
                </div>
            </div>
        </div>
    );
}
