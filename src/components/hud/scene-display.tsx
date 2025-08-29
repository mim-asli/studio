
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Bot, Box, User, UserCheck } from "lucide-react";
import type { GameState } from "@/lib/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const getEntityClassification = (entity: string, companions: string[]): string => {
    const lowerEntity = entity.toLowerCase();
    if (lowerEntity.includes('player') || lowerEntity.includes('بازیکن')) return "این شما هستید، قهرمان داستان.";
    if (companions.some(c => lowerEntity.toLowerCase().includes(c.toLowerCase()))) return "یکی از همراهان وفادار شما در این ماجراجویی.";
    
    const enemyKeywords = ['enemy', 'goblin', 'orc', 'bandit', 'دشمن', 'راهزن', 'اورک', 'گابلین', 'گرگ', 'هیولا'];
    if (enemyKeywords.some(keyword => lowerEntity.includes(keyword))) return "یک دشمن متخاصم. برای نبرد آماده شوید!";

    const npcKeywords = [
        'merchant', 'vendor', 'shopkeeper', 'man', 'woman', 'child', 'guard', 'blacksmith', 'innkeeper',
        'فروشنده', 'مرد', 'زن', 'کودک', 'نگهبان', 'آهنگر', 'مهمانخانه‌دار', 'تاجر', 'کشاورز', 'شهروند', 'رهگذر'
    ];
    if (npcKeywords.some(keyword => lowerEntity.includes(keyword))) return "یک شخصیت در صحنه. شاید بتوانید با او صحبت کنید.";

    return "یک شیء قابل تعامل در محیط. شاید ارزش بررسی را داشته باشد.";
};


const getEntityIcon = (entity: string, companions: string[]) => {
    const lowerEntity = entity.toLowerCase();
    if (lowerEntity.includes('player') || lowerEntity.includes('بازیکن')) return <User className="w-6 h-6 text-foreground"/>;
    if (companions.some(c => lowerEntity.toLowerCase().includes(c.toLowerCase()))) return <Users className="w-6 h-6 text-green-500"/>
    
    const enemyKeywords = ['enemy', 'goblin', 'orc', 'bandit', 'دشمن', 'راهزن', 'اورک', 'گابلین', 'گرگ', 'هیولا'];
    if (enemyKeywords.some(keyword => lowerEntity.includes(keyword))) return <Bot className="w-6 h-6 text-destructive"/>;

    const npcKeywords = [
        'merchant', 'vendor', 'shopkeeper', 'man', 'woman', 'child', 'guard', 'blacksmith', 'innkeeper',
        'فروشنده', 'مرد', 'زن', 'کودک', 'نگهبان', 'آهنگر', 'مهمانخانه‌دار', 'تاجر', 'کشاورز', 'شهروند', 'رهگذر'
    ];
    if (npcKeywords.some(keyword => lowerEntity.includes(keyword))) return <UserCheck className="w-6 h-6 text-blue-400"/>;
    
    return <Box className="w-6 h-6 text-muted-foreground"/>
}

export function SceneDisplay({ entities, companions }: { entities: string[], companions: string[] }) {
  return (
    <Card className="bg-card/80 backdrop-blur-sm border h-full">
        <CardHeader className="pb-4">
            <CardTitle className="font-headline text-2xl tracking-wider">صحنه</CardTitle>
        </CardHeader>
        <CardContent className="h-[calc(100%-4rem)] overflow-y-auto pr-2">
            <TooltipProvider>
                {entities && entities.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {entities.map((entity, index) => (
                          <Tooltip key={index}>
                            <TooltipTrigger asChild>
                              <div className="flex flex-col items-center justify-start gap-2 p-2 rounded-md bg-muted/50 w-24 h-28 text-center border">
                                  {getEntityIcon(entity, companions)}
                                  <p className="text-xs break-words leading-tight font-code">{entity}</p>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{getEntityClassification(entity, companions)}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-sm text-center pt-10">صحنه آرام است.</p>
                )}
            </TooltipProvider>
        </CardContent>
    </Card>
  )
}
