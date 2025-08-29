
"use client";

import { Backpack, PersonStanding, ScrollText, Map, Hammer, HeartPulse, Microscope, Globe, Swords } from "lucide-react";
import type { GameState } from "@/lib/types";

interface TabConfig {
    value: string;
    label: string;
    icon: React.ReactNode;
    show: (gameState: GameState) => boolean;
}

export const tabsConfig: TabConfig[] = [
    { 
        value: "combat", 
        label: "مبارزه", 
        icon: <Swords className="w-5 h-5" />, 
        show: (gameState) => !!gameState.isCombat,
    },
    { 
        value: "vitals", 
        label: "علائم حیاتی", 
        icon: <HeartPulse className="w-5 h-5" />, 
        show: () => true 
    },
    { 
        value: "inventory", 
        label: "موجودی", 
        icon: <Backpack className="w-5 h-5" />, 
        show: () => true 
    },
    { 
        value: "scene", 
        label: "صحنه", 
        icon: <Microscope className="w-5 h-5" />, 
        show: () => true 
    },
    { 
        value: "crafting", 
        label: "ساخت و ساز", 
        icon: <Hammer className="w-5 h-5" />, 
        show: (gameState) => !gameState.isCombat,
    },
    { 
        value: "character", 
        label: "شخصیت", 
        icon: <PersonStanding className="w-5 h-5" />, 
        show: () => true 
    },
    { 
        value: "quests", 
        label: "مأموریت‌ها", 
        icon: <ScrollText className="w-5 h-5" />, 
        show: () => true 
    },
    { 
        value: "world", 
        label: "جهان", 
        icon: <Globe className="w-5 h-5" />, 
        show: () => true 
    },
    { 
        value: "map", 
        label: "نقشه", 
        icon: <Map className="w-5 h-5" />, 
        show: (gameState) => !gameState.isCombat && !!gameState.discoveredLocations && gameState.discoveredLocations.length > 0,
    },
];
