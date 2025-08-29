
"use client";

import { Step } from './step';

interface ReviewData {
    scenarioTitle: string;
    genre: string;
    difficulty: string;
    gmPersonality: string;
    characterName: string;
    archetype: string | null;
    perk: string | null;
    flaw: string | null;
    items: string[];
    storyPrompt: string;
}

interface Step6Props {
    data: ReviewData;
}

export function Step6_Review({ data }: Step6Props) {
    return (
        <Step title="۶. بازبینی و شروع" description="خلاصه‌ای از دنیایی که خلق کرده‌اید. اگر همه چیز درست است، ماجراجویی را آغاز کنید.">
            <div className="max-h-[50vh] overflow-y-auto p-6 space-y-4 text-sm bg-card rounded-lg border">
                <div><strong className="text-primary">عنوان:</strong> {data.scenarioTitle}</div>
                <div><strong className="text-primary">ژانر:</strong> {data.genre}</div>
                <div><strong className="text-primary">دشواری:</strong> {data.difficulty}</div>
                <div><strong className="text-primary">سبک راوی:</strong> {data.gmPersonality}</div>
                <hr className="border-border/50"/>
                <div><strong className="text-primary">نام شخصیت:</strong> {data.characterName}</div>
                <div><strong className="text-primary">کهن الگو:</strong> {data.archetype}</div>
                <div><strong className="text-primary">نقطه قوت:</strong> {data.perk}</div>
                <div><strong className="text-primary">نقطه ضعف:</strong> {data.flaw}</div>
                <hr className="border-border/50"/>
                <div>
                    <strong className="text-primary">تجهیزات:</strong>
                    <div className="mt-1 space-y-1">
                        {data.items.map(item => <div key={item}>{item}</div>)}
                    </div>
                </div>
                 <hr className="border-border/50"/>
                <div><strong className="text-primary">شروع داستان:</strong> <p className="mt-1">{data.storyPrompt}</p></div>
            </div>
        </Step>
    );
}
