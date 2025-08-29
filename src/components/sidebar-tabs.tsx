
"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { GameState } from "@/lib/types";
import { tabsData } from './sidebar-tab-data';
import { cn } from '@/lib/utils';


interface SidebarTabsProps {
    gameState: GameState;
    onCraft: (ingredients: string[]) => void;
    isCrafting: boolean;
    onFastTravel: (action: string) => void;
}

export function SidebarTabs({ gameState, onCraft, isCrafting, onFastTravel }: SidebarTabsProps) {
  const [activeTab, setActiveTab] = useState("vitals");
  
  const tabs = tabsData({ gameState, onCraft, isCrafting, onFastTravel });

  return (
    <Tabs 
      value={activeTab} 
      onValueChange={setActiveTab} 
      className="h-full grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4"
      orientation="vertical"
    >
      <TabsList className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-1 md:h-full bg-transparent p-0 gap-2">
        {tabs.map((tab) => (
          <TabsTrigger 
            key={tab.value} 
            value={tab.value}
            className={cn(
              "w-full justify-start p-3 gap-3 h-auto data-[state=active]:bg-card/80 data-[state=active]:border data-[state=active]:shadow-sm data-[state=active]:border-border",
              "bg-card/30 border border-transparent"
            )}
          >
            {tab.icon}
            <span className="hidden sm:inline-block md:hidden lg:inline-block">{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      <div className="md:col-span-2 xl:col-span-3 h-full">
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="m-0 h-full">
            {tab.component}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
