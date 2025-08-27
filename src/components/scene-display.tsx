"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Bot, Box, User, Sun, Moon } from "lucide-react";
import type { GameState } from "@/lib/types";

const getEntityIcon = (entity: string) => {
    const lowerEntity = entity.toLowerCase();
    if (lowerEntity.includes('player') || lowerEntity.includes('بازیکن')) return <User className="w-6 h-6 text-foreground"/>;
    if (lowerEntity.includes('enemy') || lowerEntity.includes('goblin') || lowerEntity.includes('orc') || lowerEntity.includes('bandit') || lowerEntity.includes('دشمن')) return <Bot className="w-6 h-6 text-destructive"/>;
    if (lowerEntity.includes('companion') || lowerEntity.includes('ally') || lowerEntity.includes('همراه')) return <Users className="w-6 h-6 text-green-500"/>
    return <Box className="w-6 h-6 text-muted-foreground"/>
}

export function SceneDisplay({ entities }: { entities: string[] }) {
  return (
    <Card className="bg-transparent border">
        <CardHeader className="pb-4 pt-4">
            <CardTitle className="font-headline text-2xl tracking-wider">صحنه</CardTitle>
        </CardHeader>
        <CardContent>
            {entities && entities.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                    {entities.map((entity, index) => (
                        <div key={index} className="flex flex-col items-center justify-start gap-2 p-2 rounded-md bg-muted/50 w-20 h-24 text-center border">
                            {getEntityIcon(entity)}
                            <p className="text-xs break-words leading-tight font-code">{entity}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-muted-foreground text-sm">صحنه آرام است.</p>
            )}
        </CardContent>
    </Card>
  )
}

export function WorldStateDisplay({ worldState }: { worldState: GameState['worldState'] }) {
    if (!worldState) return null;
    const isNight = worldState.time?.toLowerCase().includes('شب');

    return (
        <Card className="bg-transparent border">
            <CardContent className="p-4 flex justify-around items-center text-center">
                 <div className="flex items-center gap-2">
                    {isNight ? <Moon className="w-6 h-6 text-yellow-300" /> : <Sun className="w-6 h-6 text-yellow-500" />}
                    <div>
                        <p className="font-headline text-xl">{worldState.time}</p>
                        <p className="text-xs text-muted-foreground">زمان</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                     <p className="font-headline text-3xl">{worldState.day}</p>
                     <p className="text-xs text-muted-foreground mt-2">روز</p>
                 </div>
            </CardContent>
        </Card>
    )
}
