"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  FilePlus,
  Upload,
  Swords,
  Settings,
  Trophy,
  AlertTriangle,
} from "lucide-react";
import { NewGameCreator } from "../new-game-creator";
import { LoadGame } from "../load-game";

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
  const [view, setView] = useState<
    "main" | "new-game" | "load-game" | "custom-scenario"
  >("main");

  if (view === "new-game") {
    return <NewGameCreator onBack={() => setView("main")} />;
  }
  
  if (view === "load-game") {
    return <LoadGame onBack={() => setView("main")} />;
  }

  // TODO: Add other views (custom scenario, settings, scoreboard)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gray-900/50 -z-10" />
      {/* I can't create animated nebula/data streams, using a simple gradient */}
      <div className="absolute inset-0 bg-gradient-to-tr from-gray-900 via-blue-900/50 to-purple-900/50 opacity-30 -z-10" />

      <div className="text-center mb-12">
        <h1 className="text-8xl font-headline text-accent mb-2 tracking-widest title-glitch" style={{textShadow: '0 0 10px hsl(var(--accent))'}}>
          داستان
        </h1>
        <p className="text-xl text-muted-foreground">
          یک بازی نقش‌آفرینی بی‌پایان با هوش مصنوعی
        </p>
      </div>

      {apiKeyError && (
        <div className="bg-destructive/20 border border-destructive text-destructive-foreground p-4 rounded-lg flex items-center gap-4 max-w-md mx-auto mb-8">
          <AlertTriangle className="h-6 w-6" />
          <div>
            <h3 className="font-bold">خطای پیکربندی</h3>
            <p className="text-sm">{apiKeyError}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Button size="lg" onClick={() => setView("new-game")} className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/20">
          <FilePlus />
          ماجراجویی جدید
        </Button>
        <Button size="lg" variant="secondary" onClick={() => setView("load-game")}>
          <Upload />
          بارگذاری ماجراجویی
        </Button>
        <Button size="lg" variant="secondary" onClick={onCustomScenario}>
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
