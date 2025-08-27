"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import type { CustomScenario } from "@/lib/types";

interface NewGameModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartGame: (scenario: CustomScenario) => void;
}

export function NewGameModal({ open, onOpenChange, onStartGame }: NewGameModalProps) {
  const [scenario, setScenario] = useState<CustomScenario>({
    genre: "High Fantasy",
    character: "A curious adventurer with a mysterious past",
    initialItems: "A rusty sword and a piece of bread",
    storyPrompt: "You wake up in a dimly lit tavern, with no memory of how you got there. A hooded figure in the corner seems to be watching you.",
  });

  const handleStart = () => {
    onStartGame(scenario);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-background border-accent/30">
        <DialogHeader>
          <DialogTitle className="font-headline text-accent">Create Your Dastan</DialogTitle>
          <DialogDescription>
            Define the world and character for your unique adventure. The AI will weave your ideas into the story.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="genre" className="text-right">Genre</Label>
            <Input id="genre" value={scenario.genre} onChange={e => setScenario(s => ({...s, genre: e.target.value}))} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="character" className="text-right">Character</Label>
            <Input id="character" value={scenario.character} onChange={e => setScenario(s => ({...s, character: e.target.value}))} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="initialItems" className="text-right">Starting Items</Label>
            <Input id="initialItems" value={scenario.initialItems} onChange={e => setScenario(s => ({...s, initialItems: e.target.value}))} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="storyPrompt" className="text-right pt-2">Opening Scene</Label>
            <Textarea id="storyPrompt" value={scenario.storyPrompt} onChange={e => setScenario(s => ({...s, storyPrompt: e.target.value}))} className="col-span-3 min-h-[100px]" />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" onClick={handleStart} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            Begin Adventure
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
