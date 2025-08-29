
"use client";

import type { Enemy } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { EnemyDisplay } from "./enemy-display";
import { Swords } from "lucide-react";

interface CombatControlsProps {
    enemies: Enemy[];
    onAction: (action: string) => void;
}

export function CombatControls({ enemies, onAction }: CombatControlsProps) {
    const livingEnemies = enemies.filter(e => e.health > 0);
    
    return (
        <Card className="bg-card/80 backdrop-blur-sm border h-full">
            <CardHeader className="pb-4">
                <CardTitle className="font-headline text-2xl tracking-wider flex items-center gap-3">
                    <Swords />
                    مبارزه
                </CardTitle>
                <CardDescription>دشمنان خود را برای حمله انتخاب کنید.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 h-[calc(100%-6rem)] overflow-y-auto pr-2">
                {livingEnemies.length > 0 ? (
                    livingEnemies.map(enemy => (
                        <EnemyDisplay 
                            key={enemy.id} 
                            enemy={enemy} 
                            onAttack={() => onAction(`[مبارزه] حمله به ${enemy.name}`)}
                        />
                    ))
                ) : (
                    <p className="text-muted-foreground text-sm text-center pt-10">
                        هیچ دشمنی برای مبارزه وجود ندارد.
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
