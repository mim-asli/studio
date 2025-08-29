
"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { GameState } from "@/lib/types";
import { tabsConfig } from './sidebar-tab-data';
import { cn } from '@/lib/utils';
import { PlayerHud } from "@/components/player-hud";
import { InfoPanel } from "./sidebar/info-panel";
import { SceneDisplay } from "@/components/scene-display";
import { CraftingPanel } from "@/components/crafting-panel";
import { WorldStateDisplay } from "@/components/world-state-display";
import { MapDisplay } from "@/components/map-display";
import { CombatControls } from "@/components/combat/combat-controls";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";


interface SidebarTabsProps {
    gameState: GameState;
    onCraft: (ingredients: string[]) => void;
    onAction: (action: string) => void;
    isCrafting: boolean;
    onFastTravel: (action: string) => void;
}

export function SidebarTabs({ gameState, onCraft, onAction, isCrafting, onFastTravel }: SidebarTabsProps) {
  const [activeTab, setActiveTab] = useState("vitals");
  
  useEffect(() => {
    if (gameState.isCombat && activeTab !== "combat") {
      setActiveTab("combat");
    } else if (!gameState.isCombat && activeTab === "combat") {
      setActiveTab("vitals");
    }
  }, [gameState.isCombat, activeTab]);

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
        return <CraftingPanel inventory={gameState.inventory} onCraft={onCraft} isCrafting={isCrafting} />;
      case "character":
        return <InfoPanel title="مهارت‌ها" items={gameState.skills} emptyMessage="شما هنوز مهارت خاصی ندارید." />;
      case "quests":
        return <InfoPanel title="مأموریت‌ها" items={gameState.quests} emptyMessage="هیچ مأموریت فعالی وجود ندارد." />;
      case "world":
        return <WorldStateDisplay worldState={gameState.worldState} />;
      case "map":
        return (
          <Card className="bg-card/80 backdrop-blur-sm border h-full flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline text-2xl tracking-wider text-foreground">نقشه جهان</CardTitle>
                <CardContent className="text-sm text-muted-foreground p-0 pt-2">جهان را بچرخانید و مکان‌های کشف شده را ببینید.</CardContent>
            </CardHeader>
            <CardContent className="text-center w-full flex-grow overflow-hidden p-0">
                <MapDisplay 
                  locations={gameState.discoveredLocations || []}
                  onLocationClick={onFastTravel}
                />
            </CardContent>
          </Card>
        );
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
