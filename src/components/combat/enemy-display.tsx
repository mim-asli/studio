
"use client";

import type { Enemy } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ShieldAlert, Heart, Shield } from "lucide-react";

interface EnemyDisplayProps {
    enemy: Enemy;
    onAttack: () => void;
}

export function EnemyDisplay({ enemy, onAttack }: EnemyDisplayProps) {
    const healthPercentage = (enemy.health / enemy.maxHealth) * 100;
    
    return (
        <Card className="bg-muted/50 border-primary/20 hover:border-primary/50 transition-colors">
            <CardContent className="p-3">
                <div className="flex justify-between items-center gap-4">
                    <div className="flex-shrink-0">
                        <ShieldAlert className="w-8 h-8 text-destructive" />
                    </div>
                    <div className="flex-grow space-y-2">
                        <h4 className="font-bold text-lg leading-tight">{enemy.name}</h4>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Heart className="w-4 h-4 text-red-500" />
                                <Progress value={healthPercentage} className="h-2 flex-grow" />
                            </div>
                            <p className="text-xs text-muted-foreground text-right font-mono">
                                {enemy.health} / {enemy.maxHealth}
                            </p>
                        </div>
                    </div>
                     <div className="flex-shrink-0">
                        <Button onClick={onAttack} size="sm">
                            حمله
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
