
"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Backpack, PersonStanding, ScrollText, Map, Hammer, HeartPulse, Microscope, Globe } from "lucide-react";
import { CraftingPanel } from "@/components/crafting-panel";
import { PlayerHud } from "@/components/player-hud";
import { SceneDisplay } from "@/components/scene-display";
import { WorldStateDisplay } from "@/components/world-state-display";
import type { GameState } from "@/lib/types";
import { MapDisplay } from "./map-display";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface SidebarTabsProps {
    gameState: GameState;
    onCraft: (ingredients: string[]) => void;
    isCrafting: boolean;
    onFastTravel: (action: string) => void;
}

export function SidebarTabs({ gameState, onCraft, isCrafting, onFastTravel }: SidebarTabsProps) {
  const { inventory, skills, quests, playerState, worldState, sceneEntities, companions, activeEffects, discoveredLocations, currentLocation, isCombat } = gameState;
  const [activeTab, setActiveTab] = useState("vitals");
  
  const tabs = [
    { value: "vitals", label: "علائم حیاتی", icon: <HeartPulse className="w-5 h-5" />, component: <PlayerHud playerState={playerState} activeEffects={activeEffects} isCombat={isCombat} /> },
    { value: "inventory", label: "موجودی", icon: <Backpack className="w-5 h-5" />, component: (
      <Card className="bg-card/80 backdrop-blur-sm border h-full">
        <CardHeader>
          <CardTitle className="font-headline text-2xl tracking-wider text-foreground">موجودی</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 h-[calc(100%-4rem)] overflow-y-auto pr-2">
            {inventory && inventory.length > 0 ? (
                inventory.map((item, index) => <div key={index} className="p-2 rounded-md bg-muted/50 text-sm border">{item}</div>)
            ) : (
                <p className="text-muted-foreground text-sm text-center pt-10">کوله پشتی شما خالی است.</p>
            )}
        </CardContent>
      </Card>
    )},
    { value: "scene", label: "صحنه", icon: <Microscope className="w-5 h-5" />, component: <SceneDisplay entities={sceneEntities || []} companions={companions || []} /> },
    { value: "crafting", label: "ساخت و ساز", icon: <Hammer className="w-5 h-5" />, component: <CraftingPanel inventory={inventory} onCraft={onCraft} isCrafting={isCrafting}/> },
    { value: "character", label: "شخصیت", icon: <PersonStanding className="w-5 h-5" />, component: (
      <Card className="bg-card/80 backdrop-blur-sm border h-full">
        <CardHeader>
          <CardTitle className="font-headline text-2xl tracking-wider text-foreground">مهارت‌ها</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 h-[calc(100%-4rem)] overflow-y-auto pr-2">
            {skills && skills.length > 0 ? (
                skills.map((skill, index) => <div key={index} className="p-2 rounded-md bg-muted/50 text-sm border">{skill}</div>)
            ) : (
                <p className="text-muted-foreground text-sm text-center pt-10">شما هنوز مهارت خاصی ندارید.</p>
            )}
        </CardContent>
      </Card>
    )},
    { value: "quests", label: "مأموریت‌ها", icon: <ScrollText className="w-5 h-5" />, component: (
      <Card className="bg-card/80 backdrop-blur-sm border h-full">
         <CardHeader>
            <CardTitle className="font-headline text-2xl tracking-wider text-foreground">مأموریت‌ها</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 h-[calc(100%-4rem)] overflow-y-auto pr-2">
              {quests && quests.length > 0 ? (
                  quests.map((quest, index) => <div key={index} className="p-2 rounded-md bg-muted/50 text-sm border">{quest}</div>)
              ) : (
                  <p className="text-muted-foreground text-sm text-center pt-10">هیچ مأموریت فعالی وجود ندارد.</p>
              )}
          </CardContent>
      </Card>
    )},
    { value: "world", label: "جهان", icon: <Globe className="w-5 h-5" />, component: <WorldStateDisplay worldState={worldState} /> },
    { value: "map", label: "نقشه", icon: <Map className="w-5 h-5" />, component: (
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
    )},
  ];
  
  return (
    <TooltipProvider>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 bg-card/80 backdrop-blur-sm border rounded-md">
          {tabs.map((tab) => (
            <Tooltip key={tab.value}>
              <TooltipTrigger asChild>
                <TabsTrigger value={tab.value} aria-label={tab.label}>{tab.icon}</TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>{tab.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TabsList>
        <div className="flex-grow mt-4">
          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="m-0 h-full" forceMount={tab.value === activeTab}>
              {tab.component}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </TooltipProvider>
  );
}
