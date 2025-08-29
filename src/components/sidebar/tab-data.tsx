
"use client";

import React from 'react';
import type { GameState } from '@/lib/types';
import { HeartPulse, Backpack, Swords, Hammer, User, Bot, Map, Star, BookOpen, Globe } from 'lucide-react';
import { PlayerHud } from "@/components/hud/player-hud";
import { SceneDisplay } from "@/components/hud/scene-display";
import { CraftingPanel } from "@/components/hud/crafting-panel";
import { WorldStateDisplay } from "@/components/hud/world-state-display";
import { MapDisplay } from "@/components/hud/map-display";
import { CombatControls } from "@/components/combat/combat-controls";
import { InfoPanel } from './info-panel';
import { useGameContext } from '@/context/game-context';

// Wrapper components to provide context data to panels
const VitalsTab = () => {
    const { gameState } = useGameContext();
    return <PlayerHud playerState={gameState!.playerState} activeEffects={gameState!.activeEffects} isCombat={gameState!.isCombat} />;
};

const InventoryTab = () => {
    const { gameState } = useGameContext();
    return <InfoPanel title="موجودی" items={gameState!.inventory} emptyMessage="کوله پشتی شما خالی است." />;
};

const SkillsTab = () => {
    const { gameState } = useGameContext();
    return <InfoPanel title="مهارت‌ها و ویژگی‌ها" description="توانایی‌ها و خصوصیات منحصر به فرد شما." items={gameState!.skills} emptyMessage="شما هنوز مهارت خاصی ندارید." />;
};

const QuestsTab = () => {
    const { gameState } = useGameContext();
    return <InfoPanel title="مأموریت‌ها" items={gameState!.quests} emptyMessage="هیچ مأموریت فعالی وجود ندارد." />;
};

const SceneTab = () => {
    const { gameState } = useGameContext();
    return <SceneDisplay entities={gameState!.sceneEntities || []} companions={gameState!.companions || []} />;
};

const CraftingTab = () => {
    const { gameState, handleCrafting, isLoading } = useGameContext();
    return <CraftingPanel inventory={gameState!.inventory} onCraft={handleCrafting} isCrafting={isLoading} />;
};

const MapTab = () => {
    const { gameState, handleFastTravel } = useGameContext();
    return <MapDisplay 
              locations={gameState!.discoveredLocations || []} 
              onFastTravel={handleFastTravel} 
              currentLocation={gameState!.currentLocation} 
           />;
};

const CombatTab = () => {
    const { gameState, handleAction } = useGameContext();
    return <CombatControls enemies={gameState!.enemies || []} onAction={handleAction} />;
};

const WorldTab = () => {
    const { gameState } = useGameContext();
    return <WorldStateDisplay worldState={gameState!.worldState} />;
}


interface TabConfig {
    value: string;
    label: string;
    icon: React.ElementType;
    component: React.ElementType;
    condition: (state: GameState) => boolean;
}

export const tabsConfig: TabConfig[] = [
    { 
        value: "combat", 
        label: "مبارزه", 
        icon: Swords, 
        component: CombatTab, 
        condition: (state) => state.isCombat 
    },
    { 
        value: "vitals", 
        label: "علائم حیاتی", 
        icon: HeartPulse, 
        component: VitalsTab, 
        condition: (state) => !state.isCombat 
    },
    { 
        value: "inventory", 
        label: "موجودی", 
        icon: Backpack, 
        component: InventoryTab, 
        condition: () => true 
    },
    { 
        value: "skills", 
        label: "مهارت‌ها", 
        icon: Star, 
        component: SkillsTab, 
        condition: () => true 
    },
    { 
        value: "quests", 
        label: "مأموریت‌ها", 
        icon: BookOpen, 
        component: QuestsTab, 
        condition: (state) => !!state.quests && state.quests.length > 0 
    },
    { 
        value: "scene", 
        label: "صحنه", 
        icon: Bot, 
        component: SceneTab, 
        condition: () => true 
    },
    { 
        value: "crafting", 
        label: "ساخت", 
        icon: Hammer, 
        component: CraftingTab, 
        condition: (state) => !state.isCombat 
    },
    { 
        value: "map", 
        label: "نقشه", 
        icon: Map, 
        component: MapTab, 
        condition: (state) => !state.isCombat && !!state.discoveredLocations && state.discoveredLocations.length > 0 
    },
    { 
        value: "world", 
        label: "جهان", 
        icon: Globe, 
        component: WorldTab, 
        condition: () => true 
    },
];

    