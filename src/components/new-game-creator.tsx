"use client";

import { useState } from 'react';
import { Button } from "./ui/button";
import { ArrowLeft, Wand, Rocket, Skull, Fingerprint, Bot, Landmark, Swords, Ghost, FlaskConical, ShieldCheck, Crosshair } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { cn } from '@/lib/utils';
import type { CustomScenario } from '@/lib/types';
import { Label } from './ui/label';

const TOTAL_STEPS = 3;

const genres = {
    'فانتزی': { icon: Wand, description: "شمشیر، جادو و ماجراجویی‌های حماسی در سرزمین‌های ناشناخته.", scenarios: [
        { title: "آخرین نگهبان فانوس دریایی", prompt: "شما تنها نگهبان یک فانوس دریایی باستانی هستید که بر روی صخره‌ای در میان دریایی طوفانی قرار دارد. گفته می‌شود نور این فانوس، هیولاهای اعماق را دور نگه می‌دارد. امشب، نور فانوس برای اولین بار در هزار سال گذشته، خاموش شده است." },
        { title: "بازار نیمه‌شب", prompt: "شما به طور اتفاقی وارد یک بازار مخفی می‌شوید که فقط در نیمه‌شب‌های مهتابی ظاهر می‌شود. در این بازار، ارواح، اجنه و موجودات جادویی، رویاها، خاطرات و سال‌های عمر را معامله می‌کنند." },
        { title: "قلب جنگل سنگ‌شده", prompt: "در مرکز یک جنگل باستانی، تمام موجودات زنده به سنگ تبدیل شده‌اند. شما تنها کسی هستید که از این نفرین جان سالم به در برده‌اید. باید به قلب جنگل سفر کنید تا منبع این جادوی تاریک را پیدا کنید." },
    ]},
    'علمی-تخیلی': { icon: Rocket, description: "سفر در فضا، شهرهای سایبرپانک و تکنولوژی‌های آینده.", scenarios: [
        { title: "پیام‌آور ستاره‌ها", prompt: "شما یک هوش مصنوعی هستید که در یک کاوشگر فضایی تنها، در حال سفر به سمت یک سیگنال ناشناخته از اعماق فضا هستید. خدمه انسانی شما قرن‌ها پیش از بین رفته‌اند." },
        { title: "شهر نئونی گمشده", prompt: "شما یک کارآگاه خصوصی در یک کلان‌شهر سایبرپانکی هستید. یک دانشمند برجسته در زمینه حافظه دیجیتال ناپدید شده است. تحقیقات شما را به لایه‌های زیرین شهر می‌کشاند." },
        { title: "کشتی نسل‌ها", prompt: "شما در یک کشتی فضایی غول‌پیکر به دنیا آمده‌اید که صدها سال است در حال سفر به یک سیاره جدید است. ناگهان، سیستم‌های حیاتی کشتی دچار نقص فنی می‌شوند." },
    ]},
    'ترسناک': { icon: Skull, description: "مواجهه با ناشناخته‌ها و تلاش برای بقا در دنیایی ترسناک.", scenarios: [
        { title: "خوابگرد شهر متروکه", prompt: "شما در شهری از خواب بیدار می‌شوید که در آن زمان متوقف شده است. همه ساکنان در جای خود خشک شده‌اند و تنها شما می‌توانید حرکت کنید. یک صدای نجواگونه به دنبال شماست." },
        { title: "خانه عروسک‌ها", prompt: "شما برای تعطیلات به یک خانه روستایی قدیمی می‌روید. در اتاق زیر شیروانی، یک خانه عروسکی پیدا می‌کنید که دقیقاً مشابه خانه واقعی است. هر تغییری که در خانه عروسکی ایجاد می‌کنید، در دنیای واقعی نیز اتفاق می‌افتد." },
        { title: "ایستگاه رادیویی شماره صفر", prompt: "شما یک نگهبان شب در یک ایستگاه رادیویی دورافتاده هستید. در نیمه‌های شب، یک سیگنال عجیب از یک فرکانس مرده پخش می‌شود که وقایع وحشتناکی را که قرار است تا چند دقیقه دیگر رخ دهد، پیش‌بینی می‌کند." },
    ]},
    'معمایی': { icon: Fingerprint, description: "حل کردن جنایت‌ها و کشف اسرار پیچیده.", scenarios: [
        { title: "قتل در کتابخانه بی‌نهایت", prompt: "در کتابخانه‌ای که گفته می‌شود تمام کتاب‌های نوشته شده و نانوشته جهان را در خود جای داده، کتابدار اعظم به قتل رسیده است. شما باید قاتل را پیدا کنید." },
        { title: "ساعت‌ساز نابینا", prompt: "یک ساعت‌ساز نابینا که می‌توانست پیچیده‌ترین ساعت‌های جهان را بسازد، به قتل رسیده است. او قبل از مرگش، یک ساعت نیمه‌کاره از خود به جای گذاشته که به نظر می‌رسد زمان را به عقب نشان می‌دهد." },
        { title: "قطار سریع‌السیر اورینت", prompt: "شما در یک قطار لوکس در حال سفر هستید که به دلیل طوفان برف متوقف می‌شود. صبح روز بعد، یکی از مسافران در کوپه قفل‌شده خود به قتل رسیده است." },
    ]},
    'پسا-آخرالزمانی': { icon: Bot, description: "تلاش برای بقا در دنیایی ویران پس از یک فاجعه.", scenarios: [
        { title: "باغبان آخرین باغ", prompt: "در دنیایی که توسط غبار خاکستری پوشانده شده، شما از آخرین باغ زمین که در یک گنبد شیشه‌ای محافظت می‌شود، نگهداری می‌کنید. منابع گنبد رو به اتمام است." },
        { title: "پیک رادیویی", prompt: "در دنیایی که شهرها از هم جدا افتاده‌اند، شما یک پیک هستید که پیام‌های رادیویی ضبط شده را بین سکونتگاه‌ها حمل می‌کنید. یک نوار مرموز به دست شما می‌رسد که می‌تواند سرنوشت بشریت را تغییر دهد." },
        { title: "شکارچی ماشین‌ها", prompt: "در آینده‌ای که ماشین‌های هوشمند علیه انسان‌ها شورش کرده‌اند، شما یک شکارچی هستید که ربات‌های سرکش را برای قطعاتشان شکار می‌کنید." },
    ]},
    'کلاسیک': { icon: Landmark, description: "ماجراجویی در دوران‌های تاریخی مانند دزدان دریایی یا ژاپن فئودال.", scenarios: [
        { title: "دزدان دریایی کارائیب", prompt: "شما کاپیتان یک کشتی دزدان دریایی هستید. نقشه‌ای به دست شما افتاده که محل گنج یک دزد دریایی افسانه‌ای را نشان می‌دهد. اما این نقشه نفرین شده است." },
        { title: "سامورایی بی‌ارباب (رونین)", prompt: "در دوره فئودالی ژاپن، ارباب شما به ناحق متهم به خیانت شده و مجبور به خودکشی شده است. شما به عنوان یک رونین، قسم خورده‌اید که انتقام او را بگیرید." },
        { title: "جاده ابریشم", prompt: "شما یک تاجر در مسیر جاده ابریشم هستید. کاروان شما حامل یک محموله بسیار با ارزش و سری است که توسط امپراتور چین به خلیفه بغداد فرستاده شده." },
    ]}
};

const archetypes = {
    'جنگجو': { icon: Swords, description: "استاد نبردهای تن به تن.", items: "شمشیر بلند و زره زنجیری" },
    'جادوگر': { icon: Wand, description: "کنترل‌کننده نیروهای جادویی.", items: "عصای چوبی و کتاب طلسم" },
    'مخفی‌کار': { icon: Ghost, description: "قاتلی خاموش در سایه‌ها.", items: "خنجر و لباس تیره" },
    'دانشمند': { icon: FlaskConical, description: "متخصص فناوری و گجت‌ها.", items: "آچار فرانسه و عینک محافظ" },
    'پهلوان': { icon: ShieldCheck, description: "مبارزی مقدس و مدافع.", items: "پتک و سپر مقدس" },
    'کماندار': { icon: Crosshair, description: "استاد تیراندازی از راه دور.", items: "کمان بلند و یک ترکش تیر" },
};


interface NewGameCreatorProps {
    onBack: () => void;
    onStartGame: (scenario: CustomScenario, characterName: string) => void;
}

export function NewGameCreator({ onBack, onStartGame }: NewGameCreatorProps) {
    const [step, setStep] = useState(1);
    
    // State for all selections
    const [genre, setGenre] = useState<keyof typeof genres>('فانتزی');
    const [archetype, setArchetype] = useState<keyof typeof archetypes>('جنگجو');
    const [characterName, setCharacterName] = useState('');
    const [selectedScenario, setSelectedScenario] = useState(genres['فانتزی'].scenarios[0]);

    const handleNext = () => setStep(s => Math.min(s + 1, TOTAL_STEPS));
    const handlePrev = () => setStep(s => Math.max(s - 1, 1));
    
    const canProceed = () => {
        switch(step) {
            case 1: return !!genre;
            case 2: return !!archetype && characterName.trim().length > 0;
            case 3: return !!selectedScenario;
            default: return false;
        }
    }
    
    const handleStartGame = () => {
        if (!characterName || !archetype || !selectedScenario) return;

        const fullStoryPrompt = `
        عنوان سناریو: ${selectedScenario.title}
        ژانر: ${genre}. 
        شخصیت:
        - نام: ${characterName}
        - کهن الگو: ${archetype}
        
        تجهیزات اولیه: 
        ${archetypes[archetype].items}

        صحنه شروع:
        ${selectedScenario.prompt}
        `;

        const customScenario: CustomScenario = {
            title: selectedScenario.title,
            character: `نام: ${characterName}, کهن‌الگو: ${archetype}`,
            initialItems: archetypes[archetype].items,
            storyPrompt: fullStoryPrompt,
        };
        onStartGame(customScenario, characterName);
    }

    const renderStep = () => {
        switch (step) {
            case 1: return <Step title="۱. انتخاب ژانر" description="سبک و دنیای کلی ماجراجویی خود را مشخص کنید.">
                <SelectionGrid 
                    items={genres} 
                    selected={genre} 
                    onSelect={(key) => { 
                        const newGenre = key as keyof typeof genres;
                        setGenre(newGenre); 
                        // Reset scenario when genre changes
                        setSelectedScenario(genres[newGenre].scenarios[0]);
                    }} 
                    columns="3" 
                />
            </Step>
            case 2: return <Step title="۲. انتخاب شخصیت" description="کلاس و نام قهرمان خود را انتخاب کنید.">
                <div className="space-y-8">
                     <Input 
                        placeholder="نام شخصیت" 
                        value={characterName} 
                        onChange={e => setCharacterName(e.target.value)} 
                        className="text-center text-lg max-w-sm mx-auto" 
                    />
                    <SelectionGrid 
                        items={archetypes} 
                        selected={archetype} 
                        onSelect={(key) => setArchetype(key as keyof typeof archetypes)} 
                        columns="3" 
                    />
                </div>
            </Step>
            case 3: return <Step title="۳. انتخاب سناریو" description="نقطه شروع ماجراجویی خود را از بین گزینه‌های زیر انتخاب کنید.">
                <ScenarioSelection 
                    scenarios={genres[genre].scenarios} 
                    selected={selectedScenario} 
                    onSelect={setSelectedScenario} 
                />
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
                
                <div className="min-h-[400px]">
                    {renderStep()}
                </div>

                <div className="flex justify-between mt-8">
                    <Button onClick={handlePrev} disabled={step === 1} variant="outline">قبلی</Button>
                    {step < TOTAL_STEPS && <Button onClick={handleNext} disabled={!canProceed()}>بعدی</Button>}
                    {step === TOTAL_STEPS && <Button onClick={handleStartGame} disabled={!canProceed()} className="bg-primary hover:bg-primary/90">شروع ماجراجویی</Button>}
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

const SelectionGrid = ({ items, selected, onSelect, columns = "3" }: { items: any, selected: string | null, onSelect: (key: string) => void, columns?: "2" | "3" | "4" }) => {
    const columnClasses: Record<string, string> = {
        "2": "grid-cols-2",
        "3": "grid-cols-2 md:grid-cols-3",
        "4": "grid-cols-2 md:grid-cols-4",
    };
    
    return (
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
                    <CardDescription className="text-xs text-center">{value.description}</CardDescription>
                </CardHeader>
            </Card>
        ))}
    </div>
    )
};

const ScenarioSelection = ({ scenarios, selected, onSelect }: { scenarios: any[], selected: any | null, onSelect: (scenario: any) => void }) => (
    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
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
                    <CardDescription>{scenario.prompt}</CardDescription>
                </CardHeader>
            </Card>
        ))}
    </div>
);

    