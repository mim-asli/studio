
"use client";

import { Step } from './step';
import { Input } from '@/components/ui/input';
import { FeatureSelection } from './feature-selection';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { genres, gmPersonalities, difficultyPoints } from '@/lib/game-data';
import type { genres as GenresType } from '@/lib/game-data';
import { cn } from '@/lib/utils';

type Difficulty = 'آسان' | 'معمولی' | 'سخت';

interface Step1Props {
    scenarioTitle: string;
    setScenarioTitle: (value: string) => void;
    genre: keyof typeof GenresType;
    setGenre: (value: keyof typeof GenresType) => void;
    difficulty: Difficulty;
    setDifficulty: (value: Difficulty) => void;
    gmPersonality: string;
    setGmPersonality: (value: string) => void;
}

export function Step1_WorldBasics({
    scenarioTitle,
    setScenarioTitle,
    genre,
    setGenre,
    difficulty,
    setDifficulty,
    gmPersonality,
    setGmPersonality
}: Step1Props) {
    return (
        <Step title="۱. مبانی جهان" description="قوانین و حال و هوای کلی دنیای خود را مشخص کنید.">
            <div className="space-y-6">
                <Input 
                    placeholder="عنوان سناریو (مثلا: انتقام جادوگر تاریکی)" 
                    value={scenarioTitle} 
                    onChange={e => setScenarioTitle(e.target.value)} 
                    className="text-center text-lg" 
                />
                <FeatureSelection 
                    items={genres} 
                    selected={genre} 
                    onSelect={(key) => setGenre(key as keyof typeof GenresType)} 
                    columns="3" 
                    title="ژانر" 
                />
                <div>
                    <Label className="text-lg font-bold text-primary mb-2 block">سطح دشواری</Label>
                    <RadioGroup 
                        value={difficulty} 
                        className="mt-2 grid grid-cols-3 gap-4" 
                        onValueChange={value => setDifficulty(value as Difficulty)}
                    >
                        {(['آسان', 'معمولی', 'سخت'] as const).map(level => (
                            <Label 
                                key={level} 
                                htmlFor={`diff-${level}`} 
                                className={cn(
                                    "flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer", 
                                    difficulty === level && "border-primary ring-2 ring-primary"
                                )}
                            >
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
    );
}
