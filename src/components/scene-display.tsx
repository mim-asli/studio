
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Bot, Box, User, Sun, Moon, Cloud, Snowflake, Leaf, UserCheck } from "lucide-react";
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
    <Card className="bg-transparent border h-full">
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

const getWeatherIcon = (weather: string = "") => {
    const lowerWeather = weather.toLowerCase();
    if (lowerWeather.includes('rain') || lowerWeather.includes('باران')) return <Cloud className="w-8 h-8 text-blue-300"/>;
    if (lowerWeather.includes('snow') || lowerWeather.includes('برف')) return <Snowflake className="w-8 h-8 text-white"/>;
    if (lowerWeather.includes('fog') || lowerWeather.includes('مه')) return <Cloud className="w-8 h-8 text-gray-400"/>;
    if (lowerWeather.includes('wind') || lowerWeather.includes('باد')) return <Leaf className="w-8 h-8 text-green-300"/>;
    return <Sun className="w-8 h-8 text-yellow-500" />;
}

export function WorldStateDisplay({ worldState }: { worldState: GameState['worldState'] }) {
    if (!worldState) return null;
    const isNight = worldState.time?.toLowerCase().includes('شب');
    const weatherIcon = getWeatherIcon(worldState.weather);

    return (
        <Card className="bg-transparent border h-full flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline text-2xl tracking-wider">وضعیت جهان</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow justify-around">
                 <div className="flex items-center gap-4">
                    {isNight ? <Moon className="w-10 h-10 text-yellow-300" /> : <Sun className="w-10 h-10 text-yellow-500" />}
                    <div>
                        <p className="font-headline text-2xl">{worldState.time}</p>
                        <p className="text-sm text-muted-foreground">زمان روز</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="font-headline text-5xl w-10 text-center">{worldState.day}</div>
                     <div>
                        <p className="font-headline text-2xl">روز</p>
                        <p className="text-sm text-muted-foreground">از شروع ماجراجویی</p>
                    </div>
                 </div>
                 {worldState.weather && (
                    <div className="flex items-center gap-4">
                        {weatherIcon}
                        <div>
                            <p className="font-headline text-2xl">{worldState.weather}</p>
                            <p className="text-sm text-muted-foreground">آب و هوا</p>
                        </div>
                    </div>
                 )}
            </CardContent>
        </Card>
    )
}
