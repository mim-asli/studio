"use client";

import { Button } from "./ui/button";
import { ArrowLeft, Trash2, Upload, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
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

interface SaveGameItem {
    name: string;
    date: string;
}

interface LoadGameProps {
    onBack: () => void;
    onLoad: () => string | null | undefined;
}

export function LoadGame({ onBack, onLoad }: LoadGameProps) {
    // Placeholder data
    const savedGames: SaveGameItem[] = [];

    const handleLoadGame = (save: SaveGameItem) => {
        // Here you would call the actual load logic
        console.log("Loading game:", save.name);
        onLoad();
    }

    const handleDeleteGame = (save: SaveGameItem) => {
        // Here you would call the actual delete logic
        console.log("Deleting game:", save.name);
    }
    
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
            <div className="w-full max-w-2xl">
                <div className="flex justify-between items-center mb-8">
                    <Button onClick={onBack} variant="ghost" size="icon">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <h1 className="text-4xl font-headline text-accent">بارگذاری ماجراجویی</h1>
                    <div className="w-10"></div>
                </div>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>بازی‌های ذخیره شده</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {savedGames.length > 0 ? (
                            <ul className="space-y-3">
                                {savedGames.map((save, index) => (
                                     <li key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 group">
                                        <div>
                                            <p className="font-semibold">{save.name}</p>
                                            <p className="text-sm text-muted-foreground">{save.date}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleLoadGame(save)}>
                                                بارگذاری
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Trash2 className="w-4 h-4"/>
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>آیا مطمئن هستید؟</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                           این عمل قابل بازگشت نیست. این کار فایل ذخیره شده "{save.name}" را برای همیشه حذف خواهد کرد.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>لغو</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteGame(save)} className="bg-destructive hover:bg-destructive/90">
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
                
                <div className="flex justify-center gap-4 mt-8">
                    <Button variant="outline"><Upload className="ml-2"/> ورود (Import)</Button>
                    <Button variant="outline"><Download className="ml-2"/> خروج (Export)</Button>
                </div>
            </div>
        </div>
    );
}
