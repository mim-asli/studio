
"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGameContext } from '@/context/game-context';
import { tabsConfig } from './tab-data';
import { ScrollArea } from '../ui/scroll-area';

export function Sidebar() {
  const { gameState } = useGameContext();
  const [activeTab, setActiveTab] = useState(gameState?.isCombat ? "combat" : "vitals");

  if (!gameState) return null;

  const availableTabs = tabsConfig.filter(tab => tab.condition(gameState));

  // If the active tab is no longer available (e.g., combat ends), switch to a default tab.
  if (!availableTabs.some(t => t.value === activeTab)) {
      const newTab = gameState.isCombat ? "combat" : "vitals";
      if (activeTab !== newTab) {
        setActiveTab(newTab);
      }
  }
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="h-full flex flex-row-reverse gap-4">
      <TabsList className="h-full flex-col justify-start p-2 bg-card/80 backdrop-blur-sm border">
        {availableTabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="w-full flex flex-col items-center justify-center h-20">
            <tab.icon className="w-6 h-6" />
            <span className="mt-1 text-xs">{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="flex-grow h-full overflow-hidden">
        {availableTabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="h-full m-0">
             <ScrollArea className="h-full">
                <div className="pr-2">
                    <tab.component />
                </div>
             </ScrollArea>
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
