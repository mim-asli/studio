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
    genre: "فانتزی حماسی",
    character: "یک ماجراجوی کنجکاو با گذشته‌ای مرموز",
    initialItems: "یک شمشیر زنگ‌زده و یک تکه نان",
    storyPrompt: "شما در یک میخانه کم‌نور بیدار می‌شوید، بدون اینکه به یاد بیاورید چگونه به آنجا رسیده‌اید. به نظر می‌رسد یک فرد شنل‌پوش در گوشه‌ای شما را زیر نظر دارد.",
  });

  const handleStart = () => {
    onStartGame(scenario);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-background border-accent/30">
        <DialogHeader>
          <DialogTitle className="font-headline text-accent">داستان خود را بسازید</DialogTitle>
          <DialogDescription>
            دنیا و شخصیت ماجراجویی منحصر به فرد خود را تعریف کنید. هوش مصنوعی ایده‌های شما را در داستان خواهد بافت.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="genre" className="text-left">ژانر</Label>
            <Input id="genre" value={scenario.genre} onChange={e => setScenario(s => ({...s, genre: e.target.value}))} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="character" className="text-left">شخصیت</Label>
            <Input id="character" value={scenario.character} onChange={e => setScenario(s => ({...s, character: e.target.value}))} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="initialItems" className="text-left">آیتم‌های اولیه</Label>
            <Input id="initialItems" value={scenario.initialItems} onChange={e => setScenario(s => ({...s, initialItems: e.target.value}))} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="storyPrompt" className="text-left pt-2">صحنه ابتدایی</Label>
            <Textarea id="storyPrompt" value={scenario.storyPrompt} onChange={e => setScenario(s => ({...s, storyPrompt: e.target.value}))} className="col-span-3 min-h-[100px]" />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>انصراف</Button>
          <Button type="submit" onClick={handleStart} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            شروع ماجراجویی
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
