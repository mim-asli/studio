
"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { GameState } from "@/lib/types";
import { tabsData } from './sidebar-tab-data';
import { cn } from '@/lib/utils';


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

  const tabs = tabsData({ gameState, onCraft, onAction, isCrafting, onFastTravel });

  return (
    <Tabs 
      value={activeTab} 
      onValueChange={setActiveTab} 
      className="h-full flex flex-col md:flex-row gap-4"
      orientation="vertical"
    >
      <TabsList className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-1 md:h-full bg-transparent p-0 gap-2 shrink-0">
        {tabs.map((tab) => (
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
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="m-0 h-full">
            {tab.component}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
