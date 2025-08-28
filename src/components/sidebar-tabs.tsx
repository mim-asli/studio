
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Backpack, PersonStanding, ScrollText, Map, Hammer, HeartPulse, Microscope, Globe } from "lucide-react";
import { CraftingPanel } from "@/components/crafting-panel";
import { PlayerHud } from "@/components/player-hud";
import { SceneDisplay, WorldStateDisplay } from "@/components/scene-display";
import type { GameState } from "@/lib/types";

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
}

export function SidebarTabs({ gameState, onCraft, isCrafting }: SidebarTabsProps) {
  const { inventory, skills, quests, playerState, worldState, sceneEntities, companions } = gameState;
  
  const tabs = [
    { value: "vitals", label: "علائم حیاتی", icon: <HeartPulse className="w-5 h-5" /> },
    { value: "inventory", label: "موجودی", icon: <Backpack className="w-5 h-5" /> },
    { value: "scene", label: "صحنه", icon: <Microscope className="w-5 h-5" /> },
    { value: "crafting", label: "ساخت و ساز", icon: <Hammer className="w-5 h-5" /> },
    { value: "character", label: "شخصیت", icon: <PersonStanding className="w-5 h-5" /> },
    { value: "quests", label: "مأموریت‌ها", icon: <ScrollText className="w-5 h-5" /> },
    { value: "world", label: "جهان", icon: <Globe className="w-5 h-5" /> },
    { value: "map", label: "نقشه", icon: <Map className="w-5 h-5" /> },
  ]
  
  return (
    <TooltipProvider>
      <Tabs defaultValue="vitals" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-8 bg-transparent border rounded-md">
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
          <TabsContent value="vitals" className="m-0">
             <PlayerHud playerState={playerState} />
          </TabsContent>
          <TabsContent value="inventory" className="m-0">
            <Card className="bg-transparent border">
              <CardContent className="p-4 space-y-2">
                  <h3 className="font-headline text-2xl tracking-wider text-foreground mb-2">موجودی</h3>
                  {inventory && inventory.length > 0 ? (
                      inventory.map((item, index) => <div key={index} className="p-2 rounded-md bg-muted/50 text-sm border">{item}</div>)
                  ) : (
                      <p className="text-muted-foreground text-sm">کوله پشتی شما خالی است.</p>
                  )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="scene" className="m-0">
             <SceneDisplay entities={sceneEntities || []} companions={companions || []} />
          </TabsContent>
          <TabsContent value="crafting" className="m-0 h-full">
            <CraftingPanel 
                inventory={inventory}
                onCraft={onCraft}
                isCrafting={isCrafting}
            />
          </TabsContent>
          <TabsContent value="character" className="m-0">
              <Card className="bg-transparent border">
                  <CardContent className="p-4 space-y-2">
                      <h3 className="font-headline text-2xl tracking-wider text-foreground mb-2">مهارت‌ها</h3>
                      {skills && skills.length > 0 ? (
                          skills.map((skill, index) => <div key={index} className="p-2 rounded-md bg-muted/50 text-sm border">{skill}</div>)
                      ) : (
                          <p className="text-muted-foreground text-sm">شما هنوز مهارت خاصی ندارید.</p>
                      )}
                  </CardContent>
              </Card>
          </TabsContent>
          <TabsContent value="quests" className="m-0">
              <Card className="bg-transparent border">
                  <CardContent className="p-4 space-y-2">
                      <h3 className="font-headline text-2xl tracking-wider text-foreground mb-2">مأموریت‌ها</h3>
                      {quests && quests.length > 0 ? (
                          quests.map((quest, index) => <div key={index} className="p-2 rounded-md bg-muted/50 text-sm border">{quest}</div>)
                      ) : (
                          <p className="text-muted-foreground text-sm">هیچ مأموریت فعالی وجود ندارد.</p>
                      )}
                  </CardContent>
              </Card>
          </TabsContent>
           <TabsContent value="world" className="m-0">
             <WorldStateDisplay worldState={worldState} />
          </TabsContent>
          <TabsContent value="map" className="m-0">
              <Card className="bg-transparent border">
                  <CardContent className="p-4 text-center">
                      <h3 className="font-headline text-2xl tracking-wider text-foreground mb-2">نقشه جهان</h3>
                      <p className="text-muted-foreground text-sm">داده‌های نقشه هنوز در دسترس نیست.</p>
                      <Map className="w-24 h-24 mx-auto mt-4 text-muted-foreground/30"/>
                  </CardContent>
              </Card>
          </TabsContent>
        </div>
      </Tabs>
    </TooltipProvider>
  );
}
