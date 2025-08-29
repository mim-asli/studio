
"use client";

import { Step } from './step';
import { Textarea } from '@/components/ui/input';
import { openingScenes, genres } from '@/lib/game-data';
import { cn } from '@/lib/utils';
import { Pencil } from 'lucide-react';

interface Step5Props {
    genre: keyof typeof genres;
    storyPrompt: string;
    setStoryPrompt: (value: string) => void;
    writingCustomScene: boolean;
    setWritingCustomScene: (value: boolean) => void;
}

export function Step5_OpeningScene({
    genre,
    storyPrompt,
    setStoryPrompt,
    writingCustomScene,
    setWritingCustomScene,
}: Step5Props) {
    return (
        <Step title="۵. صحنه افتتاحیه" description="یک نقطه شروع برای داستان انتخاب کنید یا خودتان بنویسید.">
            <div className="space-y-4">
                {openingScenes[genre].map((scene, index) => (
                    <div 
                        key={index} 
                        onClick={() => { setStoryPrompt(scene); setWritingCustomScene(false); }} 
                        className={cn(
                            "cursor-pointer hover:border-primary p-4 rounded-lg border", 
                            storyPrompt === scene && !writingCustomScene ? "border-primary ring-2 ring-primary" : "bg-card"
                        )}
                    >
                       <p className="text-sm text-muted-foreground">{scene}</p>
                    </div>
                ))}
                <div 
                    onClick={() => { setWritingCustomScene(true); setStoryPrompt(''); }} 
                    className={cn(
                        "cursor-pointer hover:border-primary p-4 rounded-lg border flex items-center gap-4", 
                        writingCustomScene ? "border-primary ring-2 ring-primary" : "bg-card"
                    )}
                >
                    <Pencil className="w-6 h-6 text-primary"/>
                    <div>
                        <p className="font-bold">نوشتن سناریوی سفارشی</p>
                        <p className="text-sm text-muted-foreground">داستان خود را با جزئیات دلخواهتان شروع کنید.</p>
                    </div>
                </div>
                {writingCustomScene && (
                    <Textarea 
                        placeholder="شما در یک جنگل تاریک و مه‌آلود به هوش می‌آyید..." 
                        value={storyPrompt} 
                        onChange={e => setStoryPrompt(e.target.value)} 
                        rows={6}
                        className="mt-4" 
                    />
                )}
            </div>
        </Step>
    );
}
