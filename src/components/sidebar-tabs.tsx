"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Backpack, PersonStanding, ScrollText, Map } from "lucide-react";

export function SidebarTabs({ inventory, skills, quests }: { inventory: string[], skills: string[], quests: string[] }) {
  return (
    <Tabs defaultValue="inventory" className="h-full flex flex-col">
      <TabsList className="grid w-full grid-cols-4 bg-muted/50">
        <TabsTrigger value="inventory" aria-label="Inventory"><Backpack className="w-5 h-5" /></TabsTrigger>
        <TabsTrigger value="character" aria-label="Character"><PersonStanding className="w-5 h-5" /></TabsTrigger>
        <TabsTrigger value="quests" aria-label="Quests"><ScrollText className="w-5 h-5" /></TabsTrigger>
        <TabsTrigger value="map" aria-label="Map"><Map className="w-5 h-5" /></TabsTrigger>
      </TabsList>
      <div className="flex-grow mt-4">
        <TabsContent value="inventory" className="m-0">
          <Card className="bg-transparent border-primary/20">
            <CardContent className="p-4 space-y-2">
                <h3 className="font-headline text-lg text-accent mb-2">Inventory</h3>
                {inventory && inventory.length > 0 ? (
                    inventory.map((item, index) => <div key={index} className="p-2 rounded-md bg-muted/50 text-sm">{item}</div>)
                ) : (
                    <p className="text-muted-foreground text-sm">Your backpack is empty.</p>
                )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="character" className="m-0">
            <Card className="bg-transparent border-primary/20">
                <CardContent className="p-4 space-y-2">
                    <h3 className="font-headline text-lg text-accent mb-2">Skills</h3>
                    {skills && skills.length > 0 ? (
                        skills.map((skill, index) => <div key={index} className="p-2 rounded-md bg-muted/50 text-sm">{skill}</div>)
                    ) : (
                        <p className="text-muted-foreground text-sm">You have no special skills yet.</p>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="quests" className="m-0">
            <Card className="bg-transparent border-primary/20">
                <CardContent className="p-4 space-y-2">
                    <h3 className="font-headline text-lg text-accent mb-2">Quests</h3>
                    {quests && quests.length > 0 ? (
                        quests.map((quest, index) => <div key={index} className="p-2 rounded-md bg-muted/50 text-sm">{quest}</div>)
                    ) : (
                        <p className="text-muted-foreground text-sm">No active quests.</p>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="map" className="m-0">
            <Card className="bg-transparent border-primary/20">
                <CardContent className="p-4 text-center">
                    <h3 className="font-headline text-lg text-accent mb-2">World Map</h3>
                    <p className="text-muted-foreground text-sm">Map data is not yet available.</p>
                    <Map className="w-24 h-24 mx-auto mt-4 text-muted-foreground/30"/>
                </CardContent>
            </Card>
        </TabsContent>
      </div>
    </Tabs>
  );
}
