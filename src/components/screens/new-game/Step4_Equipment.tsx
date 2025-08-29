
"use client";

import { Step } from './step';
import { ItemManager } from './item-manager';
import { difficultyPoints } from '@/lib/game-data';

type Difficulty = 'آسان' | 'معمولی' | 'سخت';

interface Step4Props {
    difficulty: Difficulty;
    initialItems: Record<string, number>;
    setInitialItems: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

export function Step4_Equipment({ difficulty, initialItems, setInitialItems }: Step4Props) {
    return (
        <Step title="۴. تجهیزات اولیه" description="با استفاده از امتیازهای خود، تجهیزات شروع ماجراجویی را انتخاب کنید.">
            <ItemManager 
                totalPoints={difficultyPoints[difficulty]}
                items={initialItems}
                setItems={setInitialItems}
            />
        </Step>
    );
}
