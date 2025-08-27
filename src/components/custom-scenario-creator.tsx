"use client";

import { useState } from 'react';
import { Button } from "./ui/button";
import { ArrowLeft, Dna, Landmark, Wand, FlaskConical, Swords, User, Shield, HeartCrack, Rocket, Bot, Fingerprint, Ghost, Sun, Moon, Drama, Skull, ShieldCheck, Crosshair, Leaf, HandHeart, Hammer, Gem, Telescope, Briefcase, Handshake, Rabbit, Brain, Eye, Speaker, Anchor, Angry, Shell, Puzzle, Drama as DramaIcon, Hand, Footprints, Ear, Wind } from "lucide-react";
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
    'فانتزی': { icon: Wand },
    'علمی-تخیلی': { icon: Rocket },
    'ترسناک': { icon: Skull },
    'معمایی': { icon: Fingerprint },
    'پسا-آخرالزمانی': { icon: Bot },
    'کلاسیک': { icon: Landmark },
};

const archetypes = {
    'جنگجو': { icon: Swords, description: "استاد نبردهای تن به تن با قدرت بدنی بالا." },
    'جادوگر': { icon: Wand, description: "دانای اسرار کهن و کنترل‌کننده نیروهای جادویی." },
    'مخفی‌کار': { icon: Ghost, description: "قاتلی خاموش که در سایه‌ها حرکت می‌کند." },
    'دانشمند': { icon: FlaskConical, description: "متخصص فناوری و گجت‌های پیشرفته در دنیای آینده." },
    'پهلوان': { icon: ShieldCheck, description: "مبارزی مقدس که از بی‌گناهان دفاع می‌کند." },
    'کماندار': { icon: Crosshair, description: "متخصص استفاده از تیر و کمان و استاد بقا در طبیعت." },
};

const perks = {
    'کاریزماتیک': { icon: User, description: "توانایی بالا در متقاعد کردن دیگران و نفوذ اجتماعی." },
    'مقاوم': { icon: Shield, description: "بدنی سرسخت که در برابر آسیب‌ها و بیماری‌ها مقاوم‌تر است." },
    'تیزهوش': { icon: Fingerprint, description: "ذهنی خلاق و سریع برای حل معماها و یافتن راه‌حل‌های غیرمنتظره." },
    'چابک': { icon: Rabbit, description: "حرکت سریع و بی‌صدا، استاد فرار و جاخالی دادن." },
    'حافظه قوی': { icon: Brain, description: "جزئیات و اطلاعات مهم را به راحتی به خاطر می‌سپارد." },
    'چشمان تیزبین': { icon: Eye, description: "قابلیت دیدن جزئیات پنهان و پیدا کردن سرنخ‌ها." },
};

const flaws = {
    'ترسو': { icon: HeartCrack, description: "در موقعیت‌های خطرناک دچار استرس و وحشت می‌شود." },
    'بدشانس': { icon: Moon, description: "همیشه بدترین اتفاق ممکن برایش رخ می‌دهد." },
    'مغرور': { icon: Sun, description: "اعتماد به نفس بیش از حد، گاهی کار دستش می‌دهد." },
    'کله‌شق': { icon: Angry, description: "به سختی نظرش را عوض می‌کند و اغلب راه اشتباه را می‌رود." },
    'زودباور': { icon: Shell, description: "به راحتی حرف دیگران را باور می‌کند و فریب می‌خورد." },
    'طمع‌کار': { icon: Gem, description: "عشق به ثروت و اشیاء قیمتی او را به دردسر می‌اندازد." },
};

const gmPersonalities = ['جدی و تاریک', 'شوخ و سرگرم‌کننده', 'روایی و سینمایی', 'واقع‌گرا و بی‌رحم', 'مینیمالیست و سریع'];

interface CustomScenarioCreatorProps {
    onBack: () => void;
    onStartGame: (scenario: CustomScenario, characterName: string) => void;
}

export function CustomScenarioCreator({ onBack, onStartGame }: CustomScenarioCreatorProps) {
    const [step, setStep] = useState(1);
    
    // State for all selections
    const [characterName, setCharacterName] = useState('');
    const [characterDesc, setCharacterDesc] = useState('');
    const [archetype, setArchetype] = useState('');
    const [selectedArchetype, setSelectedArchetype] = useState<keyof typeof archetypes | null>(null);
    const [perk, setPerk] = useState<keyof typeof perks | null>(null);
    const [flaw, setFlaw] = useState<keyof typeof flaws | null>(null);
    const [initialItems, setInitialItems] = useState('');
    const [storyPrompt, setStoryPrompt] = useState('');
    const [scenarioTitle, setScenarioTitle] = useState('');
    
    const [genre, setGenre] = useState<keyof typeof genres>('فانتزی');
    const [difficulty, setDifficulty] = useState('معمولی');
    const [gmPersonality, setGmPersonality] = useState('روایی و سینمایی');


    const handleNext = () => setStep(s => Math.min(s + 1, TOTAL_STEPS));
    const handlePrev = () => setStep(s => Math.max(s - 1, 1));
    
    const canProceed = () => {
        switch(step) {
            case 1: return !!genre && !!difficulty && !!gmPersonality && scenarioTitle.trim().length > 0;
            case 2: return characterName.trim().length > 0 && (archetype.trim().length > 0 || !!selectedArchetype) ;
            case 3: return !!perk && !!flaw;
            case 4: return initialItems.trim().length > 0;
            case 5: return storyPrompt.trim().length > 0;
            case 6: return true;
            default: return false;
        }
    }
    
    const handleStartGame = () => {
        const finalArchetype = archetype.trim() || selectedArchetype;

        const fullStoryPrompt = `
        عنوان سناریو: ${scenarioTitle}
        ژانر: ${genre}. 
        سبک راوی: ${gmPersonality}. 
        سطح دشواری: ${difficulty}. 
        
        شخصیت:
        - نام: ${characterName}
        - کهن الگو: ${finalArchetype}
        - توضیحات: ${characterDesc}
        - نقطه قوت: ${perk}
        - نقطه ضعف: ${flaw}

        تجهیزات اولیه: ${initialItems}

        صحنه شروع:
        ${storyPrompt}
        `;

        const customScenario: CustomScenario = {
            title: scenarioTitle,
            character: `نام: ${characterName}, کهن‌الگو: ${finalArchetype}, ویژگی‌ها: ${perk}, ${flaw}. توضیحات: ${characterDesc}`,
            initialItems: initialItems,
            storyPrompt: fullStoryPrompt,
        };
        onStartGame(customScenario, characterName);
    }

    const renderStep = () => {
        switch (step) {
            case 1: return <Step title="۱. مبانی جهان" description="قوانین و حال و هوای کلی دنیای خود را مشخص کنید.">
                 <div className="space-y-6">
                    <Input placeholder="عنوان سناریو (مثلا: انتقام جادوگر تاریکی)" value={scenarioTitle} onChange={e => setScenarioTitle(e.target.value)} className="text-center text-lg" />
                     <SelectionGrid items={genres} selected={genre} onSelect={(key) => setGenre(key as keyof typeof genres)} columns="3" title="ژانر" />
                    <div>
                        <Label className="text-lg font-bold text-accent">سطح دشواری</Label>
                        <RadioGroup value={difficulty} className="mt-2 grid grid-cols-3 gap-4" onValueChange={setDifficulty}>
                           {['آسان', 'معمولی', 'سخت'].map(level => (
                               <Label key={level} htmlFor={`diff-${level}`} className={cn("flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer", difficulty === level && "border-accent ring-2 ring-accent")}>
                                  <RadioGroupItem value={level} id={`diff-${level}`} className="sr-only" />
                                  {level}
                               </Label>
                           ))}
                        </RadioGroup>
                    </div>
                     <div>
                        <Label htmlFor="gm-personality" className="text-lg font-bold text-accent">سبک راوی (GM)</Label>
                        <Select value={gmPersonality} onValueChange={setGmPersonality}>
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
            case 2: return <Step title="۲. پروفایل شخصیت" description="به قهرمان خود یک نام، یک کلاس و یک پیشینه (اختیاری) بدهید.">
                <div className="space-y-6">
                    <Input placeholder="نام شخصیت" value={characterName} onChange={e => setCharacterName(e.target.value)} className="text-center text-lg" />
                    <div>
                        <Label className="text-lg font-bold text-accent">کهن الگو (Archetype)</Label>
                        <SelectionGrid 
                            items={archetypes} 
                            selected={selectedArchetype} 
                            onSelect={(key) => {
                                setSelectedArchetype(key as keyof typeof archetypes);
                                setArchetype(''); // Clear custom input
                            }} 
                            columns="3"
                        />
                        <div className="flex items-center gap-4 my-4">
                            <hr className="flex-grow border-border/50"/>
                            <span className="text-muted-foreground">یا</span>
                            <hr className="flex-grow border-border/50"/>
                        </div>
                        <Input 
                            placeholder="... یک کهن‌الگوی سفارشی بسازید" 
                            value={archetype} 
                            onChange={e => {
                                setArchetype(e.target.value)
                                setSelectedArchetype(null); // Clear selection
                            }}
                            className="text-center" 
                        />
                    </div>
                    <Textarea placeholder="توضیحات و پیشینه شخصیت (اختیاری)" value={characterDesc} onChange={e => setCharacterDesc(e.target.value)} rows={4} />
                </div>
            </Step>
            case 3: return <Step title="۳. انتخاب ویژگی‌ها" description="یک نقطه قوت (Perk) و یک نقطه ضعف (Flaw) انتخاب کنید تا به شخصیت خود عمق ببخشید.">
                <div className="grid md:grid-cols-2 gap-8">
                    <FeatureSelection title="نقاط قوت (Perks)" items={perks} selected={perk} onSelect={setPerk} />
                    <FeatureSelection title="نقاط ضعف (Flaws)" items={flaws} selected={flaw} onSelect={setFlaw} />
                </div>
            </Step>
            case 4: return <Step title="۴. تجهیزات اولیه" description="شخصیت شما ماجراجویی را با چه آیتم‌هایی شروع می‌کند؟ (هر آیتم را در یک خط جدید بنویسید)">
                 <Textarea placeholder="شمشیر بلند&#x0a;کوله پشتی چرمی&#x0a;3 سکه طلا" value={initialItems} onChange={e => setInitialItems(e.target.value)} rows={8} />
            </Step>
            case 5: return <Step title="۵. صحنه افتتاحیه" description="متن شروع داستان را بنویسید. هرچه جزئیات بیشتری بدهید، هوش مصنوعی داستان بهتری خلق خواهد کرد.">
                 <Textarea placeholder="شما در یک جنگل تاریک و مه‌آلود به هوش می‌آیید. آخرین چیزی که به یاد دارید، نور کورکننده یک طلسم است. اکنون تنها هستید و صدای زوزه‌ی گرگ‌ها از دور به گوش می‌رسد..." value={storyPrompt} onChange={e => setStoryPrompt(e.target.value)} rows={10} />
            </Step>
            case 6: return <Step title="۶. بازبینی و شروع" description="خلاصه‌ای از دنیایی که خلق کرده‌اید. اگر همه چیز درست است، ماجراجویی را آغاز کنید.">
                <Card className="max-h-96 overflow-y-auto">
                    <CardContent className="p-6 space-y-4 text-sm">
                        <div><strong className="text-accent">عنوان:</strong> {scenarioTitle}</div>
                        <div><strong className="text-accent">ژانر:</strong> {genre}</div>
                        <div><strong className="text-accent">دشواری:</strong> {difficulty}</div>
                        <div><strong className="text-accent">سبک راوی:</strong> {gmPersonality}</div>
                        <hr className="border-border/50"/>
                        <div><strong className="text-accent">نام شخصیت:</strong> {characterName}</div>
                        <div><strong className="text-accent">کهن الگو:</strong> {archetype.trim() || selectedArchetype}</div>
                        <div><strong className="text-accent">نقطه قوت:</strong> {perk}</div>
                        <div><strong className="text-accent">نقطه ضعف:</strong> {flaw}</div>
                        <hr className="border-border/50"/>
                        <div><strong className="text-accent">تجهیزات:</strong> <pre className="whitespace-pre-wrap font-body">{initialItems}</pre></div>
                         <hr className="border-border/50"/>
                        <div><strong className="text-accent">شروع داستان:</strong> <p className="mt-1">{storyPrompt}</p></div>
                    </CardContent>
                </Card>
            </Step>
            default: return null;
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
            <div className="w-full max-w-4xl">
                <div className="flex justify-between items-center mb-4">
                     <Button onClick={onBack} variant="ghost" size="icon">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <h1 className="text-2xl sm:text-4xl font-headline text-primary">خلق سناریوی سفارشی</h1>
                    <div className="w-10"></div>
                </div>

                <Progress value={(step / TOTAL_STEPS) * 100} className="w-full mb-8" />
                
                <div className="min-h-[450px]">
                    {renderStep()}
                </div>

                <div className="flex justify-between mt-8">
                    <Button onClick={handlePrev} disabled={step === 1} variant="outline">قبلی</Button>
                    {step < TOTAL_STEPS && <Button onClick={handleNext} disabled={!canProceed()}>بعدی</Button>}
                    {step === TOTAL_STEPS && <Button onClick={handleStartGame} className="bg-primary hover:bg-primary/90">شروع ماجراجویی</Button>}
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

const SelectionGrid = ({ items, selected, onSelect, columns = "3", title }: { items: any, selected: string | null, onSelect: (key: string) => void, columns?: "2" | "3" | "4", title?: string }) => {
    const columnClasses: Record<string, string> = {
        "2": "grid-cols-2",
        "3": "grid-cols-3",
        "4": "grid-cols-4",
    };
    
    return (
    <div>
        {title && <Label className="text-lg font-bold text-accent mb-2 block">{title}</Label>}
        <div className={cn("grid gap-4", columnClasses[columns])}>
            {Object.entries(items).map(([key, value]: [string, any]) => (
                <Card 
                    key={key}
                    onClick={() => onSelect(key)}
                    className={cn(
                        "cursor-pointer transition-all hover:shadow-accent/50 hover:shadow-md hover:-translate-y-1",
                        selected === key ? "ring-2 ring-accent" : "border-primary/20"
                    )}
                >
                    <CardHeader className="items-center text-center p-4">
                        <div className="p-3 bg-muted rounded-full mb-2">
                            <value.icon className="w-7 h-7 text-foreground" />
                        </div>
                        <CardTitle className="text-base">{key}</CardTitle>
                        {value.description && <CardDescription className="text-xs">{value.description}</CardDescription>}
                    </CardHeader>
                </Card>
            ))}
        </div>
    </div>
    )
};

const FeatureSelection = ({ title, items, selected, onSelect }: { title: string, items: any, selected: string | null, onSelect: (key: string) => void }) => (
    <div>
        <h3 className="text-xl font-bold text-center mb-4 text-accent">{title}</h3>
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
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
