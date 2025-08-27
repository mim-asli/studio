
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeartPulse, BrainCircuit, Droplets, Wheat, Zap, Sparkles } from "lucide-react";
import type { GameState } from "@/lib/types";

interface HudStatProps {
  label: string;
  value: number;
  max?: number;
  icon: React.ReactNode;
  variant?: 'default' | 'inverse';
}

const HudGauge = ({ label, value, max = 100, icon, variant = 'default' }: HudStatProps) => {
  let percentage, colorClass;

  if (variant === 'inverse') {
    // For hunger, thirst. Higher value is worse.
    percentage = (value / max) * 100;
    if (value > 70) {
      colorClass = "text-red-500";
    } else if (value > 40) {
      colorClass = "text-yellow-500";
    } else {
      colorClass = "text-green-500";
    }
  } else {
    // For health, sanity, stamina, mana. Lower value is worse.
    percentage = (value / max) * 100;
    if (value < 30) {
      colorClass = "text-red-500";
    } else if (value < 60) {
      colorClass = "text-yellow-500";
    } else {
      colorClass = "text-green-500";
    }
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
      <span className="text-sm font-bold">{value}</span>
    </div>
  );
};

export function PlayerHud({ playerState }: { playerState: GameState['playerState'] }) {
  const { health = 100, sanity = 100, hunger = 0, thirst = 0, stamina, mana } = playerState || {};
  
  return (
    <Card className="bg-transparent border">
      <CardHeader className="pb-4 pt-4">
        <CardTitle className="font-headline text-2xl tracking-wider">علائم حیاتی</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
        <HudGauge 
            label="سلامتی" 
            value={health} 
            icon={<HeartPulse />}
            variant="default"
        />
        <HudGauge 
            label="عقلانیت" 
            value={sanity} 
            icon={<BrainCircuit />}
            variant="default"
        />
        <HudGauge 
            label="گرسنگی" 
            value={hunger} 
            icon={<Wheat />}
            variant="inverse"
        />
        <HudGauge 
            label="تشنگی" 
            value={thirst} 
            icon={<Droplets />}
            variant="inverse"
        />
        {stamina !== undefined && (
          <HudGauge 
              label="انرژی" 
              value={stamina} 
              icon={<Zap />}
              variant="default"
          />
        )}
        {mana !== undefined && (
           <HudGauge 
              label="مانا" 
              value={mana} 
              icon={<Sparkles />}
              variant="default"
          />
        )}
      </CardContent>
    </Card>
  );
}
