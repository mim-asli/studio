
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeartPulse, BrainCircuit, Droplets, Wheat, Zap, Sparkles, Star } from "lucide-react";
import type { GameState, ActiveEffect } from "@/lib/types";
import { EffectsDisplay } from "./effects-display";

interface HudStatProps {
  label: string;
  value: number;
  max?: number;
  icon: React.ReactNode;
}

const HudGauge = ({ label, value, max = 100, icon }: HudStatProps) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  let colorClass = "text-green-500"; // Default healthy color

  const isDanger = percentage < 30;
  const isWarning = percentage < 60;

  if (label === "امتیاز عمل") {
    colorClass = "text-blue-400";
  } else if (isDanger) {
    colorClass = "text-red-500";
  } else if (isWarning) {
    colorClass = "text-yellow-500";
  }

  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <div
        className="relative flex h-16 w-16 items-center justify-center rounded-full"
      >
        <svg className="w-full h-full" viewBox="0 0 36 36" transform="rotate(-90)">
          <path
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            className="stroke-current text-muted/30"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            className={`stroke-current ${colorClass} transition-all duration-300`}
            strokeWidth="2.5"
            fill="none"
            strokeDasharray={`${percentage}, 100`}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
           <div className={`h-6 w-6 ${colorClass}`}>{icon}</div>
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{label}</span>
      <span className="text-sm font-bold">{value}{max > 0 && `/${max}`}</span>
    </div>
  );
};

interface PlayerHudProps {
    playerState: GameState['playerState'];
    activeEffects: GameState['activeEffects'];
    isCombat: boolean;
}

export function PlayerHud({ playerState, activeEffects, isCombat }: PlayerHudProps) {
  const { health, sanity, hunger, thirst, stamina, mana, ap, maxAp } = playerState || {};
  
  return (
    <Card className="bg-transparent border h-full">
      <CardHeader className="pb-4">
        <CardTitle className="font-headline text-2xl tracking-wider">علائم حیاتی</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-y-6 justify-items-center">
          {isCombat && ap != null && maxAp != null && (
             <HudGauge 
                label="امتیاز عمل" 
                value={ap}
                max={maxAp} 
                icon={<Star />}
            />
          )}
          <HudGauge 
              label="سلامتی" 
              value={health ?? 100} 
              max={100}
              icon={<HeartPulse />}
          />
          <HudGauge 
              label="عقلانیت" 
              value={sanity ?? 100} 
              max={100}
              icon={<BrainCircuit />}
          />
          <HudGauge 
              label="سیری" 
              value={hunger ?? 100} 
              max={100}
              icon={<Wheat />}
          />
          <HudGauge 
              label="آب بدن" 
              value={thirst ?? 100} 
              max={100}
              icon={<Droplets />}
          />
          {stamina != null && (
            <HudGauge 
                label="انرژی" 
                value={stamina} 
                max={100}
                icon={<Zap />}
            />
          )}
          {mana != null && (
             <HudGauge 
                label="مانا" 
                value={mana} 
                max={100}
                icon={<Sparkles />}
            />
          )}
        </div>
        <EffectsDisplay effects={activeEffects || []} />
      </CardContent>
    </Card>
  );
}
