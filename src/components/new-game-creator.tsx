"use client";

import { useState } from 'react';
import { Button } from "./ui/button";
import { ArrowLeft, Dna, Landmark, Wand, FlaskConical, Swords, User, Shield, HeartCrack, Rocket, Bot, Fingerprint, Ghost, Sun, Moon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { cn } from '@/lib/utils';
import type { CustomScenario } from '@/lib/types';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const TOTAL_STEPS = 6;

const genres = {
    'علمی-تخیلی': { icon: Rocket },
    'فانتزی': { icon: Wand },
    'کلاسیک': { icon: Landmark },
};

const archetypes = {
    'جنگجو': { icon: Swords, description: "استاد نبردهای تن به تن با قدرت بدنی بالا." },
    'جادوگر': { icon: Wand, description: "دانای اسرار کهن و کنترل‌کننده نیروهای جادویی." },
    'مخفی‌کار': { icon: Ghost, description: "قاتلی خاموش که در سایه‌ها حرکت می‌کند." },
    'دانشمند': { icon: FlaskConical, description: "متخصص فناوری و گجت‌های پیشرفته در دنیای آینده." },
};

const perks = {
    'کاریزماتیک': { icon: User, description: "توانایی بالا در متقاعد کردن دیگران و نفوذ اجتماعی." },
    'مقاوم': { icon: Shield, description: "بدنی سرسخت که در برابر آسیب‌ها و بیماری‌ها مقاوم‌تر است." },
    'تیزهوش': { icon: Fingerprint, description: "ذهنی خلاق و سریع برای حل معماها و یافتن راه‌حل‌های غیرمنتظره." },
};

const flaws = {
    'ترسو': { icon: HeartCrack, description: "در موقعیت‌های خطرناک دچار استرس و وحشت می‌شود." },
    'بدشانس': { icon: Moon, description: "همیشه بدترین اتفاق ممکن برایش رخ می‌دهد." },
    'مغرور': { icon: Sun, description: "اعتماد به نفس بیش از حد، گاهی کار دستش می‌دهد." },
};

const scenarios = {
    'فانتزی': [
        { title: "بیداری در دخمه", description: "شما در یک دخمه سرد و تاریک به هوش می‌آیید، بدون هیچ خاطره‌ای از گذشته. تنها یک مشعل در دست دارید." },
        { title: "کاروان گمشده", description: "شما مسئول حفاظت از یک کاروان تجاری هستید که در جنگلی نفرین‌شده مسیر خود را گم کرده است." },
    ],
    'علمی-تخیلی': [
        { title: "فرار از کلان‌شهر", description: "به عنوان یک یاغی تحت تعقیب، باید از دست نیروهای امنیتی یک ابرشرکت فاسد فرار کنید." },
        { title: "سفینه رها شده", description: "سیگنال کمکی شما را به یک سفینه فضایی غول‌پیکر و متروکه کشانده است. اسرار تاریکی در انتظار شماست." },
    ],
    'کلاسیک': [
        { title: "قتل در قطار سریع‌السیر", description: "به عنوان یک کارآگاه مشهور، باید راز قتلی که در یک قطار لوکس رخ داده را پیش از رسیدن به مقصد حل کنید." },
        { title: "گنجینه گمشده دزدان دریایی", description: "نقشه‌ای قدیمی شما را به جزیره‌ای ناشناخته هدایت می‌کند که گفته می‌شود گنج کاپیتان بلک‌هارت در آن پنهان است." },
    ]
};

const gmPersonalities = ['جدی و تاریک', 'شوخ و سرگرم‌کننده', 'روایی و سینمایی', 'واقع‌گرا و بی‌رحم'];

interface NewGameCreatorProps {
    onBack: () => void;
    onStartGame: (scenario: CustomScenario) => void;
}

export function NewGameCreator({ onBack, onStartGame }: NewGameCreatorProps) {
    const [step, setStep] = useState(1);
    
    // State for all selections
    const [genre, setGenre] = useState<keyof typeof genres | null>(null);
    const [archetype, setArchetype] = useState<keyof typeof archetypes | null>(null);
    const [characterName, setCharacterName] = useState('');
    const [characterDesc, setCharacterDesc] = useState('');
    const [perk, setPerk] = useState<keyof typeof perks | null>(null);
    const [flaw, setFlaw] = useState<keyof typeof flaws | null>(null);
    const [selectedScenario, setSelectedScenario] = useState<{title: string, description: string} | null>(null);
    const [difficulty, setDifficulty] = useState('معمولی');
    const [gmPersonality, setGmPersonality] = useState('روایی و سینمایی');


    const handleNext = () => setStep(s => Math.min(s + 1, TOTAL_STEPS));
    const handlePrev = () => setStep(s => Math.max(s - 1, 1));
    
    const canProceed = () => {
        switch(step) {
            case 1: return !!genre;
            case 2: return !!archetype;
            case 3: return characterName.trim().length > 0;
            case 4: return !!perk && !!flaw;
            case 5: return !!selectedScenario;
            case 6: return true;
            default: return false;
        }
    }

    const renderStep = () => {
        switch (step) {
            case 1: return <Step title="۱. انتخاب ژانر" description="سبک و دنیای کلی ماجراجویی خود را مشخص کنید.">
                <SelectionGrid items={genres} selected={genre} onSelect={setGenre} />
            </Step>
            case 2: return <Step title="۲. انتخاب کهن‌الگو" description="کلاس و هویت اصلی شخصیت خود را انتخاب کنید.">
                <SelectionGrid items={archetypes} selected={archetype} onSelect={setArchetype} />
            </Step>
            case 3: return <Step title="۳. جزئیات شخصیت" description="به قهرمان خود یک نام و یک پیشینه (اختیاری) بدهید.">
                <div className="space-y-4">
                    <Input placeholder="نام شخصیت" value={characterName} onChange={e => setCharacterName(e.target.value)} className="text-center text-lg" />
                    <Textarea placeholder="توضیحات و پیشینه شخصیت (اختیاری)" value={characterDesc} onChange={e => setCharacterDesc(e.target.value)} rows={4} />
                </div>
            </Step>
            case 4: return <Step title="۴. انتخاب ویژگی‌ها" description="یک نقطه قوت (Perk) و یک نقطه ضعف (Flaw) انتخاب کنید تا به شخصیت خود عمق ببخشید.">
                <div className="grid md:grid-cols-2 gap-8">
                    <FeatureSelection title="نقاط قوت (Perks)" items={perks} selected={perk} onSelect={setPerk} />
                    <FeatureSelection title="نقاط ضعف (Flaws)" items={flaws} selected={flaw} onSelect={setFlaw} />
                </div>
            </Step>
            case 5: return <Step title="۵. انتخاب سناریو" description="نقطه شروع ماجراجویی خود را از بین گزینه‌های زیر انتخاب کنید.">
                <ScenarioSelection scenarios={scenarios[genre!]} selected={selectedScenario} onSelect={setSelectedScenario} />
            </Step>
            case 6: return <Step title="۶. تنظیمات نهایی" description="آخرین جزئیات را برای شخصی‌سازی کامل تجربه بازی خود تنظیم کنید.">
                <div className="space-y-6">
                    <div>
                        <Label className="text-lg font-bold text-accent">سطح دشواری</Label>
                        <RadioGroup defaultValue="معمولی" className="mt-2 grid grid-cols-3 gap-4" onValueChange={(val) => setDifficulty(val)}>
                           {['آسان', 'معمولی', 'سخت'].map(level => (
                               <Label key={level} htmlFor={`diff-${level}`} className={cn("flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground", difficulty === level && "border-accent")}>
                                  <RadioGroupItem value={level} id={`diff-${level}`} className="sr-only" />
                                  {level}
                               </Label>
                           ))}
                        </RadioGroup>
                    </div>
                     <div>
                        <Label htmlFor="gm-personality" className="text-lg font-bold text-accent">سبک راوی (GM)</Label>
                        <Select defaultValue='روایی و سینمایی' onValueChange={setGmPersonality}>
                            <SelectTrigger id="gm-personality" className="w-full mt-2">
                                <SelectValue placeholder="شخصیت GM را انتخاب کنید" />
                            </SelectTrigger>
                            <SelectContent>
                                {gmPersonalities.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </Step>
            default: return null;
        }
    };
    
    const handleStartGame = () => {
        const customScenario: CustomScenario = {
            title: selectedScenario!.title,
            character: `نام: ${characterName}, کهن‌الگو: ${archetype}, ویژگی‌ها: ${perk}، ${flaw}. توضیحات: ${characterDesc}`,
            initialItems: `بر اساس کهن‌الگوی ${archetype}`,
            storyPrompt: `ژانر: ${genre}. سبک راوی: ${gmPersonality}. سطح دشواری: ${difficulty}. سناریو: ${selectedScenario!.description}`,
        };
        onStartGame(customScenario);
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
            <div className="w-full max-w-4xl">
                <div className="flex justify-between items-center mb-4">
                     <Button onClick={onBack} variant="ghost" size="icon">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <h1 className="text-2xl sm:text-4xl font-headline text-accent">ماجراجویی جدید</h1>
                    <div className="w-10"></div>
                </div>

                <Progress value={(step / TOTAL_STEPS) * 100} className="w-full mb-8" />
                
                <div className="min-h-[400px]">
                    {renderStep()}
                </div>

                <div className="flex justify-between mt-8">
                    <Button onClick={handlePrev} disabled={step === 1} variant="outline">قبلی</Button>
                    {step < TOTAL_STEPS && <Button onClick={handleNext} disabled={!canProceed()}>بعدی</Button>}
                    {step === TOTAL_STEPS && <Button onClick={handleStartGame} className="bg-accent hover:bg-accent/90 text-accent-foreground">شروع ماجراجویی</Button>}
                </div>
            </div>
        </div>
    );
}

// Sub-components for steps

const Step = ({ title, description, children }: { title: string, description: string, children: React.ReactNode }) => (
    <Card className="border-none shadow-none">
        <CardHeader className="text-center">
            <CardTitle className="text-2xl sm:text-3xl font-bold">{title}</CardTitle>
            <CardDescription className="text-base">{description}</CardDescription>
        </CardHeader>
        <CardContent className="mt-6">
            {children}
        </CardContent>
    </Card>
);

const SelectionGrid = ({ items, selected, onSelect, columns = 3 }: { items: any, selected: string | null, onSelect: (key: string) => void, columns?: number }) => (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${columns} gap-4`}>
        {Object.entries(items).map(([key, value]: [string, any]) => (
            <Card 
                key={key}
                onClick={() => onSelect(key)}
                className={cn(
                    "cursor-pointer transition-all hover:shadow-accent/50 hover:shadow-md hover:-translate-y-1",
                    selected === key ? "ring-2 ring-accent" : "border-primary/20"
                )}
            >
                <CardHeader className="items-center text-center">
                    <div className="p-4 bg-muted rounded-full mb-2">
                        <value.icon className="w-8 h-8 text-accent" />
                    </div>
                    <CardTitle>{key}</CardTitle>
                    {value.description && <CardDescription>{value.description}</CardDescription>}
                </CardHeader>
            </Card>
        ))}
    </div>
);

const FeatureSelection = ({ title, items, selected, onSelect }: { title: string, items: any, selected: string | null, onSelect: (key: string) => void }) => (
    <div>
        <h3 className="text-xl font-bold text-center mb-4 text-accent">{title}</h3>
        <div className="space-y-3">
            {Object.entries(items).map(([key, value]: [string, any]) => (
                <Card 
                    key={key} 
                    onClick={() => onSelect(key)} 
                    className={cn(
                        "cursor-pointer transition-colors", 
                        selected === key ? "bg-accent/20 border-accent" : "hover:bg-muted/50"
                    )}
                >
                    <CardContent className="p-4 flex items-center gap-4">
                        <value.icon className="w-6 h-6 text-accent" />
                        <div>
                            <p className="font-bold">{key}</p>
                            <p className="text-sm text-muted-foreground">{value.description}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
);


const ScenarioSelection = ({ scenarios, selected, onSelect }: { scenarios: any[], selected: any | null, onSelect: (scenario: any) => void }) => (
    <div className="space-y-4">
        {scenarios.map((scenario, index) => (
            <Card 
                key={index}
                onClick={() => onSelect(scenario)}
                className={cn(
                    "cursor-pointer transition-all hover:border-accent",
                    selected?.title === scenario.title ? "ring-2 ring-accent" : "border-primary/20"
                )}
            >
                <CardHeader>
                    <CardTitle>{scenario.title}</CardTitle>
                    <CardDescription>{scenario.description}</CardDescription>
                </CardHeader>
            </Card>
        ))}
    </div>
);

    