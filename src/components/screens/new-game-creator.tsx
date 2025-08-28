
"use client";

import { useState } from 'react';
import { Button } from "../ui/button";
import { ArrowLeft, Pencil, MinusCircle, PlusCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';
import type { CustomScenario } from '@/lib/types';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
    genres, 
    archetypes, 
    perks, 
    flaws, 
    gmPersonalities, 
    startingEquipment, 
    difficultyPoints, 
    openingScenes 
} from '@/lib/game-data';

const TOTAL_STEPS = 6;

interface NewGameCreatorProps {
    onBack: () => void;
    onStartGame: (scenario: CustomScenario, characterName: string) => void;
}

export function NewGameCreator({ onBack, onStartGame }: NewGameCreatorProps) {
    const [step, setStep] = useState(1);
    
    const [characterName, setCharacterName] = useState('');
    const [characterDesc, setCharacterDesc] = useState('');
    const [customArchetype, setCustomArchetype] = useState('');
    const [selectedArchetype, setSelectedArchetype] = useState<keyof typeof archetypes | null>(null);
    const [perk, setPerk] = useState<keyof typeof perks | null>(null);
    const [flaw, setFlaw] = useState<keyof typeof flaws | null>(null);
    const [initialItems, setInitialItems] = useState<Record<string, number>>({});
    const [storyPrompt, setStoryPrompt] = useState('');
    const [scenarioTitle, setScenarioTitle] = useState('');
    
    const [genre, setGenre] = useState<keyof typeof genres>('فانتزی');
    const [difficulty, setDifficulty] = useState<'آسان'|'معمولی'|'سخت'>('معمولی');
    const [gmPersonality, setGmPersonality] = useState('روایی و سینمایی');
    const [writingCustomScene, setWritingCustomScene] = useState(false);

    const totalPoints = difficultyPoints[difficulty];
    const usedPoints = Object.entries(initialItems).reduce((acc, [item, count]) => {
        const itemCost = startingEquipment[item as keyof typeof startingEquipment]?.cost || 0;
        return acc + (itemCost * count);
    }, 0);
    const remainingPoints = totalPoints - usedPoints;

    const handleAddItem = (item: keyof typeof startingEquipment) => {
        if (remainingPoints >= startingEquipment[item].cost) {
            setInitialItems(prev => ({...prev, [item]: (prev[item] || 0) + 1 }));
        }
    }
    
    const handleRemoveItem = (item: keyof typeof startingEquipment) => {
        if (initialItems[item] > 0) {
            setInitialItems(prev => {
                const newItems = {...prev};
                if (newItems[item] > 1) {
                    newItems[item]--;
                } else {
                    delete newItems[item];
                }
                return newItems;
            });
        }
    }

    const handleNext = () => setStep(s => Math.min(s + 1, TOTAL_STEPS));
    const handlePrev = () => setStep(s => Math.max(s - 1, 1));
    
    const canProceed = () => {
        switch(step) {
            case 1: return !!genre && !!difficulty && !!gmPersonality && scenarioTitle.trim().length > 0;
            case 2: return characterName.trim().length > 0 && (customArchetype.trim().length > 0 || !!selectedArchetype) ;
            case 3: return !!perk && !!flaw;
            case 4: return Object.keys(initialItems).length > 0;
            case 5: return storyPrompt.trim().length > 0;
            case 6: return true;
            default: return false;
        }
    }
    
    const handleStartGame = () => {
        const finalArchetype = customArchetype.trim() || selectedArchetype;
        const finalItemsList = Object.entries(initialItems).map(([item, count]) => count > 1 ? `${item} (x${count})` : item);

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

        تجهیزات اولیه: ${finalItemsList.join(', ')}

        صحنه شروع:
        ${storyPrompt}
        `;

        const customScenario: CustomScenario = {
            title: scenarioTitle,
            character: [
                `نام: ${characterName}`, 
                `کهن‌الگو: ${finalArchetype}`, 
                `ویژگی‌ها: ${perk}, ${flaw}`,
                `توضیحات: ${characterDesc}`
            ],
            initialItems: finalItemsList,
            storyPrompt: fullStoryPrompt,
            difficulty: difficulty,
            gmPersonality: gmPersonality,
        };
        onStartGame(customScenario, characterName);
    }
    
    const finalItemsListForReview = Object.entries(initialItems).map(([item, count]) => count > 1 ? `${item} (x${count})` : item);

    const renderStep = () => {
        switch (step) {
            case 1: return <Step title="۱. مبانی جهان" description="قوانین و حال و هوای کلی دنیای خود را مشخص کنید.">
                 <div className="space-y-6">
                    <Input placeholder="عنوان سناریو (مثلا: انتقام جادوگر تاریکی)" value={scenarioTitle} onChange={e => setScenarioTitle(e.target.value)} className="text-center text-lg" />
                     <SelectionGrid items={genres} selected={genre} onSelect={(key) => setGenre(key as keyof typeof genres)} columns="3" title="ژانر" />
                    <div>
                        <Label className="text-lg font-bold text-primary mb-2 block">سطح دشواری</Label>
                        <RadioGroup value={difficulty} className="mt-2 grid grid-cols-3 gap-4" onValueChange={value => setDifficulty(value as 'آسان'|'معمولی'|'سخت')}>
                           {(['آسان', 'معمولی', 'سخت'] as const).map(level => (
                               <Label key={level} htmlFor={`diff-${level}`} className={cn("flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer", difficulty === level && "border-primary ring-2 ring-primary")}>
                                  <RadioGroupItem value={level} id={`diff-${level}`} className="sr-only" />
                                  {level}
                                  <span className="text-xs text-muted-foreground mt-1">({difficultyPoints[level]} امتیاز)</span>
                               </Label>
                           ))}
                        </RadioGroup>
                    </div>
                     <div>
                        <Label htmlFor="gm-personality" className="text-lg font-bold text-primary mb-2 block">سبک راوی (GM)</Label>
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
                        <Label className="text-lg font-bold text-primary mb-2 block">کهن الگو (Archetype)</Label>
                        <SelectionGrid 
                            items={archetypes} 
                            selected={selectedArchetype} 
                            onSelect={(key) => {
                                setSelectedArchetype(key as keyof typeof archetypes);
                                setCustomArchetype(''); 
                            }} 
                            columns="4"
                        />
                        <div className="flex items-center gap-4 my-4">
                            <hr className="flex-grow border-border/50"/>
                            <span className="text-muted-foreground">یا</span>
                            <hr className="flex-grow border-border/50"/>
                        </div>
                        <Input 
                            placeholder="... یک کهن‌الگوی سفارشی بسازید" 
                            value={customArchetype} 
                            onChange={e => {
                                setCustomArchetype(e.target.value)
                                setSelectedArchetype(null); 
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
            case 4: return <Step title="۴. تجهیزات اولیه" description="با استفاده از امتیازهای خود، تجهیزات شروع ماجراجویی را انتخاب کنید.">
                 <div className="grid md:grid-cols-2 gap-6">
                     {/* Available Items Column */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>آیتم‌های موجود</CardTitle>
                                <CardDescription>امتیاز باقی‌مانده: <span className="font-bold text-primary">{remainingPoints} / {totalPoints}</span></CardDescription>
                            </CardHeader>
                            <CardContent className="max-h-80 overflow-y-auto pr-2 space-y-2">
                                {Object.entries(startingEquipment).map(([name, data]) => (
                                    <div key={name} className="flex items-center justify-between p-2 rounded-md bg-muted/50 border">
                                        <div>
                                            <p className="font-semibold">{name} <span className="text-xs text-primary">({data.cost} امتیاز)</span></p>
                                            <p className="text-xs text-muted-foreground">{data.description}</p>
                                        </div>
                                        <Button size="icon" variant="ghost" onClick={() => handleAddItem(name as keyof typeof startingEquipment)} disabled={remainingPoints < data.cost}>
                                            <PlusCircle className="text-green-500"/>
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Selected Items Column */}
                    <div>
                        <Card>
                             <CardHeader>
                                <CardTitle>کوله پشتی شما</CardTitle>
                                <CardDescription>آیتم‌هایی که انتخاب کرده‌اید.</CardDescription>
                            </CardHeader>
                            <CardContent className="max-h-80 overflow-y-auto pr-2 space-y-2">
                                {Object.keys(initialItems).length > 0 ? Object.entries(initialItems).map(([name, count]) => (
                                     <div key={name} className="flex items-center justify-between p-2 rounded-md bg-muted/50 border">
                                        <div>
                                            <p className="font-semibold">{name} <span className="text-muted-foreground">x{count}</span></p>
                                        </div>
                                        <Button size="icon" variant="ghost" onClick={() => handleRemoveItem(name as keyof typeof startingEquipment)}>
                                            <MinusCircle className="text-red-500"/>
                                        </Button>
                                    </div>
                                )) : (
                                    <p className="text-center text-muted-foreground py-10">کوله پشتی شما خالی است.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                 </div>
            </Step>
            case 5: return <Step title="۵. صحنه افتتاحیه" description="یک نقطه شروع برای داستان انتخاب کنید یا خودتان بنویسید.">
                <div className="space-y-4">
                    {openingScenes[genre].map((scene, index) => (
                        <Card key={index} onClick={() => { setStoryPrompt(scene); setWritingCustomScene(false); }} className={cn("cursor-pointer hover:border-primary", storyPrompt === scene && !writingCustomScene && "border-primary ring-2 ring-primary")}>
                            <CardContent className="p-4">
                                <p className="text-sm text-muted-foreground">{scene}</p>
                            </CardContent>
                        </Card>
                    ))}
                     <Card onClick={() => { setWritingCustomScene(true); setStoryPrompt(''); }} className={cn("cursor-pointer hover:border-primary", writingCustomScene && "border-primary ring-2 ring-primary")}>
                        <CardContent className="p-4 flex items-center gap-4">
                            <Pencil className="w-6 h-6 text-primary"/>
                            <div>
                                <p className="font-bold">نوشتن سناریوی سفارشی</p>
                                <p className="text-sm text-muted-foreground">داستان خود را با جزئیات دلخواهتان شروع کنید.</p>
                            </div>
                        </CardContent>
                    </Card>
                    {writingCustomScene && (
                        <Textarea 
                            placeholder="شما در یک جنگل تاریک و مه‌آلود به هوش می‌آیید..." 
                            value={storyPrompt} 
                            onChange={e => setStoryPrompt(e.target.value)} 
                            rows={6}
                            className="mt-4" 
                        />
                    )}
                </div>
            </Step>
            case 6: return <Step title="۶. بازبینی و شروع" description="خلاصه‌ای از دنیایی که خلق کرده‌اید. اگر همه چیز درست است، ماجراجویی را آغاز کنید.">
                <Card className="max-h-96 overflow-y-auto">
                    <CardContent className="p-6 space-y-4 text-sm">
                        <div><strong className="text-primary">عنوان:</strong> {scenarioTitle}</div>
                        <div><strong className="text-primary">ژانر:</strong> {genre}</div>
                        <div><strong className="text-primary">دشواری:</strong> {difficulty}</div>
                        <div><strong className="text-primary">سبک راوی:</strong> {gmPersonality}</div>
                        <hr className="border-border/50"/>
                        <div><strong className="text-primary">نام شخصیت:</strong> {characterName}</div>
                        <div><strong className="text-primary">کهن الگو:</strong> {customArchetype.trim() || selectedArchetype}</div>
                        <div><strong className="text-primary">نقطه قوت:</strong> {perk}</div>
                        <div><strong className="text-primary">نقطه ضعف:</strong> {flaw}</div>
                        <hr className="border-border/50"/>
                        <div><strong className="text-primary">تجهیزات:</strong> <pre className="whitespace-pre-wrap font-body">{finalItemsListForReview.join('\n')}</pre></div>
                         <hr className="border-border/50"/>
                        <div><strong className="text-primary">شروع داستان:</strong> <p className="mt-1">{storyPrompt}</p></div>
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
                    <h1 className="text-2xl sm:text-4xl font-headline text-primary">ماجراجویی جدید</h1>
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
        "3": "grid-cols-2 md:grid-cols-3",
        "4": "grid-cols-2 md:grid-cols-4",
    };
    
    return (
    <div>
        {title && <Label className="text-lg font-bold text-primary mb-2 block">{title}</Label>}
        <div className={cn("grid gap-4", columnClasses[columns])}>
            {Object.entries(items).map(([key, value]: [string, any]) => (
                <Card 
                    key={key}
                    onClick={() => onSelect(key)}
                    className={cn(
                        "cursor-pointer transition-all hover:shadow-primary/50 hover:shadow-md hover:-translate-y-1",
                        selected === key ? "ring-2 ring-primary" : "border-primary/20"
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
        <h3 className="text-xl font-bold text-center mb-4 text-primary">{title}</h3>
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {Object.entries(items).map(([key, value]: [string, any]) => (
                <Card 
                    key={key} 
                    onClick={() => onSelect(key)} 
                    className={cn(
                        "cursor-pointer transition-colors", 
                        selected === key ? "bg-primary/20 border-primary" : "hover:bg-muted/50"
                    )}
                >
                    <CardContent className="p-4 flex items-center gap-4">
                        <value.icon className="w-6 h-6 text-primary" />
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
