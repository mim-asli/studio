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

const presetScenarios: Record<string, CustomScenario> = {
    "فانتزی": {
        genre: "فانتزی حماسی",
        character: "یک ماجراجوی کنجکاو با گذشته‌ای مرموز",
        initialItems: "یک شمشیر زنگ‌زده و یک تکه نان",
        storyPrompt: "شما در یک میخانه کم‌نور بیدار می‌شوید، بدون اینکه به یاد بیاورید چگونه به آنجا رسیده‌اید. به نظر می‌رسد یک فرد شنل‌پوش در گوشه‌ای شما را زیر نظر دارد.",
    },
    "علمی-تخیلی": {
        genre: "علمی-تخیلی سایبرپانک",
        character: "یک هکر تحت تعقیب که به دنبال یک معامله بزرگ است",
        initialItems: "یک دک داده، مقداری اعتبار دیجیتال و یک ژاکت فرسوده",
        storyPrompt: "چراغ‌های نئونی شهر سایبری از میان پنجره کثیف آپارتمان شما می‌تابند. یک پیام رمزگذاری شده روی کنسول شما ظاهر می‌شود: 'فرصتی برای پاک کردن همه چیز. علاقه مندی؟'",
    },
    "کارآگاهی": {
        genre: "معمایی نوآر",
        character: "یک کارآگاه خصوصی بدبین با قلبی از طلا",
        initialItems: "یک هفت‌تیر، یک فلاسک ویسکی و یک دفترچه یادداشت چروکیده",
        storyPrompt: "باران روی پنجره‌های دفتر شما می‌کوبد. زنی با لباس قرمز وارد می‌شود، چشمانش پر از ترس است. 'باید شوهرم را پیدا کنید'، او نفس نفس می‌زند، 'فکر می‌کنم او در خطر بزرگی است.'",
    },
    "بقا": {
        genre: "بقا پس از آخرالزمان",
        character: "یک بازمانده تنها در حال جستجو در خرابه‌های تمدن",
        initialItems: "یک کوله پشتی، یک قوطی کنسرو و یک نقشه پاره شده",
        storyPrompt: "سکوت یک شهر متروکه کر کننده است و تنها با صدای باد در ساختمان‌های ویران شکسته می‌شود. گرسنگی شما را به سمت یک سوپرمارکت غارت شده می‌کشاند، اما شما تنها نیستید.",
    }
}

export function NewGameModal({ open, onOpenChange, onStartGame }: NewGameModalProps) {
  const [scenario, setScenario] = useState<CustomScenario>(presetScenarios["فانتزی"]);

  const handleStart = () => {
    onStartGame(scenario);
  };
  
  const selectPreset = (presetName: string) => {
    setScenario(presetScenarios[presetName]);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-background border-accent/30">
        <DialogHeader>
          <DialogTitle className="font-headline text-accent">داستان خود را بسازید</DialogTitle>
          <DialogDescription>
            یک سناریو را انتخاب کنید یا دنیای منحصر به فرد خود را بسازید. هوش مصنوعی ایده‌های شما را در داستان خواهد بافت.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-wrap gap-2 py-2">
            {Object.keys(presetScenarios).map(key => (
                <Button key={key} variant="outline" size="sm" onClick={() => selectPreset(key)}>
                    {key}
                </Button>
            ))}
        </div>

        <div className="grid gap-4 pt-4">
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
