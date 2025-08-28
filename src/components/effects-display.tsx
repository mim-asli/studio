
"use client";

import type { ActiveEffect } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, ZapOff, Shield, ShieldAlert, PlusCircle, MinusCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils";

interface EffectsDisplayProps {
  effects: ActiveEffect[];
}

const getEffectIcon = (type: 'buff' | 'debuff', name: string) => {
    if (name.toLowerCase().includes('protect')) return <Shield className="w-5 h-5"/>;
    if (name.toLowerCase().includes('poison')) return <ShieldAlert className="w-5 h-5"/>;
    if (type === 'buff') return <PlusCircle className="w-5 h-5"/>;
    return <MinusCircle className="w-5 h-5"/>
}

export function EffectsDisplay({ effects }: EffectsDisplayProps) {
  if (!effects || effects.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="pt-4 mt-4 border-t">
        <h4 className="text-sm font-headline tracking-wider text-muted-foreground mb-3 text-center">رویدادها و اثرات</h4>
        <div className="flex flex-wrap justify-center gap-2">
            {effects.map((effect, index) => {
                const isBuff = effect.type === 'buff';
                return (
                    <Tooltip key={index}>
                        <TooltipTrigger asChild>
                            <div className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold cursor-default",
                                isBuff ? "bg-green-500/10 border-green-500/30 text-green-300" : "bg-red-500/10 border-red-500/30 text-red-400"
                            )}>
                                {getEffectIcon(effect.type, effect.name)}
                                <span>{effect.name}</span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-xs">
                            <p>{effect.description}</p>
                        </TooltipContent>
                    </Tooltip>
                );
            })}
        </div>
      </div>
    </TooltipProvider>
  );
}
