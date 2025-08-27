"use client";

import { Button } from "@/components/ui/button";
import {
  FilePlus,
  Upload,
  Swords,
  Settings,
  Trophy,
  AlertTriangle,
} from "lucide-react";

interface StartScreenProps {
  onNewGame: () => void;
  onLoadGame: () => void;
  onCustomScenario: () => void;
  onSettings: () => void;
  onScoreboard: () => void;
  apiKeyError?: string;
}

export function StartScreen({
  onNewGame,
  onLoadGame,
  onCustomScenario,
  onSettings,
  onScoreboard,
  apiKeyError,
}: StartScreenProps) {

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 overflow-hidden">
      <div className="text-center mb-12">
        <h1 className="text-8xl md:text-9xl font-headline text-foreground mb-2 tracking-widest">
          داستان
        </h1>
        <p className="text-lg text-muted-foreground font-body">
          یک بازی نقش‌آفرینی بی‌پایان با هوش مصنوعی
        </p>
      </div>

      {apiKeyError && (
        <div className="bg-destructive/20 border border-destructive text-destructive-foreground p-4 rounded-md flex items-center gap-4 max-w-md mx-auto mb-8">
          <AlertTriangle className="h-6 w-6" />
          <div>
            <h3 className="font-bold">خطای پیکربندی</h3>
            <p className="text-sm">{apiKeyError}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Button size="lg" onClick={onNewGame} variant="default">
          <FilePlus />
          ماجراجویی جدید
        </Button>
        <Button size="lg" variant="outline" onClick={onLoadGame}>
          <Upload />
          بارگذاری ماجراجویی
        </Button>
        <Button size="lg" variant="outline" onClick={onCustomScenario}>
          <Swords />
          سناریوی سفارشی
        </Button>
      </div>

      <div className="absolute bottom-4 right-4 flex gap-2">
        <Button variant="ghost" size="icon" onClick={onSettings}>
          <Settings />
        </Button>
        <Button variant="ghost" size="icon" onClick={onScoreboard}>
          <Trophy />
        </Button>
      </div>
    </div>
  );
}
