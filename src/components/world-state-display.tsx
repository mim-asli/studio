
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Moon, Cloud, Snowflake, Leaf } from "lucide-react";
import type { GameState } from "@/lib/types";


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
        <Card className="bg-card/80 backdrop-blur-sm border h-full flex flex-col">
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
