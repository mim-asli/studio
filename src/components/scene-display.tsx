
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Bot, Box, User, Sun, Moon, Cloud, Snowflake, Leaf } from "lucide-react";
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
    
    const enemyKeywords = ['enemy', 'goblin', 'orc', 'bandit', 'دشمن', 'راهزن', 'اورک', 'گابلین', 'گرگ'];
    if (enemyKeywords.some(keyword => lowerEntity.includes(keyword))) return "یک دشمن متخاصم. برای نبرد آماده شوید!";

    return "یک شیء قابل تعامل در محیط. شاید ارزش بررسی را داشته باشد.";
};


const getEntityIcon = (entity: string, companions: string[]) => {
    const lowerEntity = entity.toLowerCase();
    if (lowerEntity.includes('player') || lowerEntity.includes('بازیکن')) return <User className="w-6 h-6 text-foreground"/>;
    if (companions.some(c => lowerEntity.toLowerCase().includes(c.toLowerCase()))) return <Users className="w-6 h-6 text-green-500"/>
    
    const enemyKeywords = ['enemy', 'goblin', 'orc', 'bandit', 'دشمن', 'راهزن', 'اورک', 'گابلین', 'گرگ'];
    if (enemyKeywords.some(keyword => lowerEntity.includes(keyword))) return <Bot className="w-6 h-6 text-destructive"/>;
    
    return <Box className="w-6 h-6 text-muted-foreground"/>
}

export function SceneDisplay({ entities, companions }: { entities: string[], companions: string[] }) {
  return (
    <Card className="bg-transparent border">
        <CardHeader className="pb-4 pt-4">
            <CardTitle className="font-headline text-2xl tracking-wider">صحنه</CardTitle>
        </CardHeader>
        <CardContent>
            <TooltipProvider>
                {entities && entities.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                        {entities.map((entity, index) => (
                          <Tooltip key={index}>
                            <TooltipTrigger asChild>
                              <div className="flex flex-col items-center justify-start gap-2 p-2 rounded-md bg-muted/50 w-20 h-24 text-center border">
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
                    <p className="text-muted-foreground text-sm">صحنه آرام است.</p>
                )}
            </TooltipProvider>
        </CardContent>
    </Card>
  )
}

const getWeatherIcon = (weather: string = "") => {
    const lowerWeather = weather.toLowerCase();
    if (lowerWeather.includes('rain') || lowerWeather.includes('باران')) return <Cloud className="w-6 h-6 text-blue-300"/>;
    if (lowerWeather.includes('snow') || lowerWeather.includes('برف')) return <Snowflake className="w-6 h-6 text-white"/>;
    if (lowerWeather.includes('fog') || lowerWeather.includes('مه')) return <Cloud className="w-6 h-6 text-gray-400"/>;
    if (lowerWeather.includes('wind') || lowerWeather.includes('باد')) return <Leaf className="w-6 h-6 text-green-300"/>;
    return null;
}

export function WorldStateDisplay({ worldState }: { worldState: GameState['worldState'] }) {
    if (!worldState) return null;
    const isNight = worldState.time?.toLowerCase().includes('شب');
    const weatherIcon = getWeatherIcon(worldState.weather);

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
                 <div className="border-l h-10 border-border/50"></div>
                 <div className="flex items-center gap-2">
                    <div className="font-headline text-3xl">{worldState.day}</div>
                    <p className="text-xs text-muted-foreground mt-2">روز</p>
                 </div>
                 {worldState.weather && weatherIcon && (
                    <>
                        <div className="border-l h-10 border-border/50"></div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center gap-2">
                                        {weatherIcon}
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{worldState.weather}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </>
                 )}
            </CardContent>
        </Card>
    )
}
