
"use client";

import React from 'react';
import { PlayerHud } from "@/components/hud/player-hud";
import { InfoPanel } from "./info-panel";
import { SceneDisplay } from "@/components/hud/scene-display";
import { CraftingPanel } from "@/components/hud/crafting-panel";
import { WorldStateDisplay } from "@/components/hud/world-state-display";
import { MapDisplay } from "@/components/hud/map-display";
import { CombatControls } from "@/components/combat/combat-controls";
import { useGameContext } from '@/context/game-context';
import { ScrollArea } from '../ui/scroll-area';

export function Sidebar() {
  const { gameState, isLoading, handleCrafting, handleAction, handleFastTravel } = useGameContext();

  if (!gameState) return null;

  const showMap = !gameState.isCombat && !!gameState.discoveredLocations && gameState.discoveredLocations.length > 0;
  const showCrafting = !gameState.isCombat;

  return (
    <ScrollArea className="h-full">
        <div className="grid grid-cols-1 gap-4 pr-2">
            {gameState.isCombat ? (
                <CombatControls enemies={gameState.enemies || []} onAction={handleAction} />
            ) : (
                <PlayerHud playerState={gameState.playerState} activeEffects={gameState.activeEffects} isCombat={gameState.isCombat} />
            )}

            <SceneDisplay entities={gameState.sceneEntities || []} companions={gameState.companions || []} />
            
            {showCrafting && (
                <CraftingPanel inventory={gameState.inventory} onCraft={handleCrafting} isCrafting={isLoading} />
            )}

            {showMap && (
                 <MapDisplay locations={gameState.discoveredLocations || []} onFastTravel={handleFastTravel} />
            )}

            <InfoPanel title="موجودی" items={gameState.inventory} emptyMessage="کوله پشتی شما خالی است." />
            <InfoPanel title="مهارت‌ها و ویژگی‌ها" description="توانایی‌ها و خصوصیات منحصر به فرد شما." items={gameState.skills} emptyMessage="شما هنوز مهارت خاصی ندارید." />
            <InfoPanel title="مأموریت‌ها" items={gameState.quests} emptyMessage="هیچ مأموریت فعالی وجود ندارد." />
            <WorldStateDisplay worldState={gameState.worldState} />
        </div>
    </ScrollArea>
  );
}
