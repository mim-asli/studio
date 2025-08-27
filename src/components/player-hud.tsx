"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeartPulse, BrainCircuit } from "lucide-react";

interface HudStatProps {
  label: string;
  value: number;
  max?: number;
  icon: React.ReactNode;
}

const HudGauge = ({ label, value, max = 100, icon }: HudStatProps) => {
  const percentage = (value / max) * 100;
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div
        className="relative flex h-20 w-20 items-center justify-center rounded-full"
      >
        <svg className="w-full h-full" viewBox="0 0 36 36">
          <path
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            className="stroke-current text-muted/50"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            className="stroke-current text-foreground"
            strokeWidth="2"
            fill="none"
            strokeDasharray={`${percentage}, 100`}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
           <div className="font-headline text-3xl">{value}</div>
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{label}</span>
    </div>
  );
};

export function PlayerHud({ playerState }: { playerState: any }) {
  return (
    <Card className="bg-transparent border">
      <CardHeader className="pb-4 pt-4">
        <CardTitle className="font-headline text-2xl tracking-wider">علائم حیاتی</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <HudGauge 
            label="سلامتی" 
            value={playerState?.health ?? 100} 
            icon={<HeartPulse />}
        />
        <HudGauge 
            label="عقلانیت" 
            value={playerState?.sanity ?? 100} 
            icon={<BrainCircuit />}
        />
      </CardContent>
    </Card>
  );
}
