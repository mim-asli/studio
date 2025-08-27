"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Bot, Box, User } from "lucide-react";

const getEntityIcon = (entity: string) => {
    const lowerEntity = entity.toLowerCase();
    if (lowerEntity.includes('player')) return <User className="w-6 h-6 text-accent"/>;
    if (lowerEntity.includes('enemy') || lowerEntity.includes('goblin') || lowerEntity.includes('orc') || lowerEntity.includes('bandit')) return <Bot className="w-6 h-6 text-destructive"/>;
    if (lowerEntity.includes('companion') || lowerEntity.includes('ally')) return <Users className="w-6 h-6 text-green-500"/>
    return <Box className="w-6 h-6 text-muted-foreground"/>
}

export function SceneDisplay({ entities }: { entities: string[] }) {
  return (
    <Card className="border-primary/20 bg-transparent">
        <CardHeader className="pb-4 pt-4">
            <CardTitle className="text-accent font-headline">Scene</CardTitle>
        </CardHeader>
        <CardContent>
            {entities && entities.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                    {entities.map((entity, index) => (
                        <div key={index} className="flex flex-col items-center justify-start gap-2 p-2 rounded-lg bg-muted/50 w-20 h-24 text-center">
                            {getEntityIcon(entity)}
                            <p className="text-xs break-words leading-tight text-foreground/80">{entity}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-muted-foreground">The scene is quiet.</p>
            )}
        </CardContent>
    </Card>
  )
}
