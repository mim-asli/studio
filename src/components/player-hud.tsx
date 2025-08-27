"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeartPulse, BrainCircuit } from "lucide-react";

interface HudStatProps {
  label: string;
  value: number;
  max?: number;
  color: string;
  icon: React.ReactNode;
}

const HudGauge = ({ label, value, max = 100, color, icon }: HudStatProps) => {
  const percentage = (value / max) * 100;
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div
        className="relative flex h-24 w-24 items-center justify-center rounded-full transition-all duration-500"
        style={{ background: `conic-gradient(from 0deg at 50% 50%, ${color} ${percentage}%, hsl(var(--muted)) 0deg)` }}
      >
        <div className="absolute flex h-[88%] w-[88%] items-center justify-center rounded-full bg-background">
          <div className="flex flex-col items-center justify-center">
             <div className="text-2xl font-bold font-headline" style={{ color: color }}>{value}</div>
             <div className="h-6 w-6" style={{ color: color }}>{icon}</div>
          </div>
        </div>
      </div>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
};

export function PlayerHud({ playerState }: { playerState: any }) {
  return (
    <Card className="border-primary/20 bg-transparent">
      <CardHeader className="pb-4 pt-4">
        <CardTitle className="text-accent font-headline">علائم حیاتی</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <HudGauge 
            label="سلامتی" 
            value={playerState?.health ?? 100} 
            color="hsl(var(--chart-2))" 
            icon={<HeartPulse />}
        />
        <HudGauge 
            label="عقلانیت" 
            value={playerState?.sanity ?? 100} 
            color="hsl(var(--chart-4))" 
            icon={<BrainCircuit />}
        />
      </CardContent>
    </Card>
  );
}
