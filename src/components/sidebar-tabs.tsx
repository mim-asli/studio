
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { tabsConfig } from './sidebar-tab-data';
import { cn } from '@/lib/utils';
import { PlayerHud } from "@/components/player-hud";
import { InfoPanel } from "./sidebar/info-panel";
import { SceneDisplay } from "@/components/scene-display";
import { CraftingPanel } from "@/components/crafting-panel";
import { WorldStateDisplay } from "@/components/world-state-display";
import { MapDisplay } from "@/components/map-display";
import { CombatControls } from "@/components/combat/combat-controls";
import { useGameContext } from '@/context/game-context';

interface SidebarTabsProps {
    onCraft: (ingredients: string[]) => void;
    onAction: (action: string) => void;
    onFastTravel: (action: string) => void;
}

export function SidebarTabs({ onCraft, onAction, onFastTravel }: SidebarTabsProps) {
  const { gameState, isLoading } = useGameContext();
  const [activeTab, setActiveTab] = useState("vitals");
  const prevIsCombatRef = useRef<boolean>();

  useEffect(() => {
    if (gameState) {
      // Switch to combat tab only when combat *starts*
      if (gameState.isCombat && !prevIsCombatRef.current) {
        setActiveTab("combat");
      }
      // When combat is over, if the user is on the combat tab, switch them to vitals.
      else if (!gameState.isCombat && prevIsCombatRef.current && activeTab === "combat") {
        setActiveTab("vitals");
      }
      // Update the ref for the next render
      prevIsCombatRef.current = gameState.isCombat;
    }
  }, [gameState?.isCombat, activeTab]);

  if (!gameState) return null;

  const availableTabs = tabsConfig.filter(tab => tab.show(gameState));

  const renderTabContent = (value: string) => {
    switch (value) {
      case "combat":
        return <CombatControls enemies={gameState.enemies || []} onAction={onAction} />;
      case "vitals":
        return <PlayerHud playerState={gameState.playerState} activeEffects={gameState.activeEffects} isCombat={gameState.isCombat} />;
      case "inventory":
        return <InfoPanel title="موجودی" items={gameState.inventory} emptyMessage="کوله پشتی شما خالی است." />;
      case "scene":
        return <SceneDisplay entities={gameState.sceneEntities || []} companions={gameState.companions || []} />;
      case "crafting":
        return <CraftingPanel inventory={gameState.inventory} onCraft={onCraft} isCrafting={isLoading} />;
      case "character":
        return <InfoPanel title="مهارت‌ها" items={gameState.skills} emptyMessage="شما هنوز مهارت خاصی ندارید." />;
      case "quests":
        return <InfoPanel title="مأموریت‌ها" items={gameState.quests} emptyMessage="هیچ مأموریت فعالی وجود ندارد." />;
      case "world":
        return <WorldStateDisplay worldState={gameState.worldState} />;
      case "map":
        return <MapDisplay locations={gameState.discoveredLocations || []} onFastTravel={onFastTravel} />;
      default:
        return null;
    }
  };

  return (
    <Tabs 
      value={activeTab} 
      onValueChange={setActiveTab} 
      className="h-full flex flex-col md:flex-row gap-4"
      orientation="vertical"
    >
      <TabsList className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-1 md:h-full bg-transparent p-0 gap-2 shrink-0">
        {availableTabs.map((tab) => (
          <TabsTrigger 
            key={tab.value} 
            value={tab.value}
            className={cn(
              "w-full flex-col md:flex-row justify-center md:justify-start p-2 md:p-3 gap-2 h-auto data-[state=active]:bg-card/80 data-[state=active]:border data-[state=active]:shadow-sm data-[state=active]:border-border",
              "bg-card/30 border border-transparent"
            )}
          >
            {tab.icon}
            <span className="text-[10px] md:text-sm">{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      <div className="w-full h-full">
        {availableTabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="m-0 h-full">
            {renderTabContent(tab.value)}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
