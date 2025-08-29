
"use client";

import { Backpack, PersonStanding, ScrollText, Map, Hammer, HeartPulse, Microscope, Globe, Swords } from "lucide-react";
import { CraftingPanel } from "@/components/crafting-panel";
import { PlayerHud } from "@/components/player-hud";
import { SceneDisplay } from "@/components/scene-display";
import { WorldStateDisplay } from "@/components/world-state-display";
import type { GameState } from "@/lib/types";
import { MapDisplay } from "./map-display";
import { CombatControls } from "./combat/combat-controls";
import { InventoryPanel } from "./sidebar/inventory-panel";
import { CharacterPanel } from "./sidebar/character-panel";
import { QuestsPanel } from "./sidebar/quests-panel";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";


interface TabDataArgs {
    gameState: GameState;
    onCraft: (ingredients: string[]) => void;
    onAction: (action: string) => void;
    isCrafting: boolean;
    onFastTravel: (action: string) => void;
}

export const tabsData = ({ gameState, onCraft, onAction, isCrafting, onFastTravel }: TabDataArgs) => {
    const { inventory, skills, quests, playerState, worldState, sceneEntities, companions, activeEffects, discoveredLocations, isCombat, enemies } = gameState;

    const allTabs = [
        { 
            value: "combat", 
            label: "مبارزه", 
            icon: <Swords className="w-5 h-5" />, 
            component: <CombatControls enemies={enemies || []} onAction={onAction} />,
            show: isCombat 
        },
        { value: "vitals", label: "علائم حیاتی", icon: <HeartPulse className="w-5 h-5" />, component: <PlayerHud playerState={playerState} activeEffects={activeEffects} isCombat={isCombat} />, show: true },
        { 
            value: "inventory", 
            label: "موجودی", 
            icon: <Backpack className="w-5 h-5" />, 
            component: <InventoryPanel inventory={inventory} />,
            show: true 
        },
        { 
            value: "scene", 
            label: "صحنه", 
            icon: <Microscope className="w-5 h-5" />, 
            component: <SceneDisplay entities={sceneEntities || []} companions={companions || []} />, 
            show: true 
        },
        { 
            value: "crafting", 
            label: "ساخت و ساز", 
            icon: <Hammer className="w-5 h-5" />, 
            component: <CraftingPanel inventory={inventory} onCraft={onCraft} isCrafting={isCrafting}/>, 
            show: !isCombat 
        },
        { 
            value: "character", 
            label: "شخصیت", 
            icon: <PersonStanding className="w-5 h-5" />, 
            component: <CharacterPanel skills={skills} />, 
            show: true 
        },
        { 
            value: "quests", 
            label: "مأموریت‌ها", 
            icon: <ScrollText className="w-5 h-5" />, 
            component: <QuestsPanel quests={quests} />, 
            show: true 
        },
        { 
            value: "world", 
            label: "جهان", 
            icon: <Globe className="w-5 h-5" />, 
            component: <WorldStateDisplay worldState={worldState} />, 
            show: true 
        },
        { 
            value: "map", 
            label: "نقشه", 
            icon: <Map className="w-5 h-5" />, 
            component: (
              <Card className="bg-card/80 backdrop-blur-sm border h-full flex flex-col">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl tracking-wider text-foreground">نقشه جهان</CardTitle>
                    <CardContent className="text-sm text-muted-foreground p-0 pt-2">جهان را بچرخانید و مکان‌های کشف شده را ببینید.</CardContent>
                </CardHeader>
                <CardContent className="text-center w-full flex-grow overflow-hidden p-0">
                    <MapDisplay 
                      locations={discoveredLocations || []}
                      onLocationClick={onFastTravel}
                    />
                </CardContent>
              </Card>
            ), 
            show: !isCombat 
        },
      ];
    
    return allTabs.filter(tab => tab.show);
}
