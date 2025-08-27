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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface NewGameModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartGame: (scenario: CustomScenario) => void;
}

const presetScenarios: Record<string, CustomScenario> = {
    "فانتزی": {
        title: "فانتزی حماسی",
        character: "یک ماجراجوی کنجکاو با گذشته‌ای مرموز",
        initialItems: "یک شمشیر زنگ‌زده و یک تکه نان",
        storyPrompt: "شما در یک میخانه کم‌نور بیدار می‌شوید، بدون اینکه به یاد بیاورید چگونه به آنجا رسیده‌اید. به نظر می‌رسد یک فرد شنل‌پوش در گوشه‌ای شما را زیر نظر دارد.",
    },
    "علمی-تخیلی": {
        title: "سایبرپانک",
        character: "یک هکر تحت تعقیب که به دنبال یک معامله بزرگ است",
        initialItems: "یک دک داده، مقداری اعتبار دیجیتال و یک ژاکت فرسوده",
        storyPrompt: "چراغ‌های نئونی شهر سایبری از میان پنجره کثیف آپارتمان شما می‌تابند. یک پیام رمزگذاری شده روی کنسول شما ظاهر می‌شود: 'فرصتی برای پاک کردن همه چیز. علاقه مندی؟'",
    },
    "کارآگاهی": {
        title: "معمای نوآر",
        character: "یک کارآگاه خصوصی بدبین با قلبی از طلا",
        initialItems: "یک هفت‌تیر، یک فلاسک ویسکی و یک دفترچه یادداشت چروکیده",
        storyPrompt: "باران روی پنجره‌های دفتر شما می‌کوبد. زنی با لباس قرمز وارد می‌شود، چشمانش پر از ترس است. 'باید شوهرم را پیدا کنید'، او نفس نفس می‌زند، 'فکر می‌کنم او در خطر بزرگی است.'",
    },
    "بقا": {
        title: "پس از آخرالزمان",
        character: "یک بازمانده تنها در حال جستجو در خرابه‌های تمدن",
        initialItems: "یک کوله پشتی، یک قوطی کنسرو و یک نقشه پاره شده",
        storyPrompt: "سکوت یک شهر متروکه کر کننده است و تنها با صدای باد در ساختمان‌های ویران شکسته می‌شود. گرسنگی شما را به سمت یک سوپرمارکت غارت شده می‌کشاند، اما شما تنها نیستید.",
    }
}

export function NewGameModal({ open, onOpenChange, onStartGame }: NewGameModalProps) {
  const [customScenario, setCustomScenario] = useState<CustomScenario>({
    title: "سفارشی",
    character: "",
    initialItems: "",
    storyPrompt: "",
  });
  const [selectedPreset, setSelectedPreset] = useState<CustomScenario>(presetScenarios["فانتزی"]);
  const [activeTab, setActiveTab] = useState("presets");

  const handleStart = () => {
    if (activeTab === 'presets') {
        onStartGame(selectedPreset);
    } else {
        onStartGame(customScenario);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-background border-accent/30">
        <DialogHeader>
          <DialogTitle className="font-headline text-accent">داستان خود را بسازید</DialogTitle>
          <DialogDescription>
            یک سناریوی آماده را انتخاب کنید یا دنیای منحصر به فرد خود را بسازید.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="presets">انتخاب سناریو</TabsTrigger>
                <TabsTrigger value="custom">ایجاد سناریوی سفارشی</TabsTrigger>
            </TabsList>
            <TabsContent value="presets" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.values(presetScenarios).map((scenario, index) => (
                        <Card 
                            key={index} 
                            className={`cursor-pointer transition-all ${selectedPreset.title === scenario.title ? 'border-accent ring-2 ring-accent' : 'border-primary/20 hover:border-accent/70'}`}
                            onClick={() => setSelectedPreset(scenario)}
                        >
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center justify-between text-lg">
                                    {scenario.title}
                                    {selectedPreset.title === scenario.title && <CheckCircle className="w-5 h-5 text-accent" />}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                <p className="line-clamp-2">{scenario.storyPrompt}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </TabsContent>
            <TabsContent value="custom" className="mt-4">
                <div className="grid gap-4 pt-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="character" className="text-left">شخصیت</Label>
                        <Input id="character" value={customScenario.character} placeholder="یک ماجراجوی کنجکاو..." onChange={e => setCustomScenario(s => ({...s, character: e.target.value}))} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="initialItems" className="text-left">آیتم‌های اولیه</Label>
                        <Input id="initialItems" value={customScenario.initialItems} placeholder="یک شمشیر و یک تکه نان..." onChange={e => setCustomScenario(s => ({...s, initialItems: e.target.value}))} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="storyPrompt" className="text-left pt-2">صحنه ابتدایی</Label>
                        <Textarea id="storyPrompt" value={customScenario.storyPrompt} placeholder="شما در یک میخانه کم‌نور بیدار می‌شوید..." onChange={e => setCustomScenario(s => ({...s, storyPrompt: e.target.value}))} className="col-span-3 min-h-[100px]" />
                    </div>
                </div>
            </TabsContent>
        </Tabs>

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
