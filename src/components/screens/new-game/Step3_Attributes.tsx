
"use client";

import { Step } from './step';
import { FeatureSelection } from './feature-selection';
import { perks, flaws } from '@/lib/game-data';
import type { perks as PerksType, flaws as FlawsType } from '@/lib/game-data';

interface Step3Props {
    perk: keyof typeof PerksType | null;
    setPerk: (value: keyof typeof PerksType | null) => void;
    flaw: keyof typeof FlawsType | null;
    setFlaw: (value: keyof typeof FlawsType | null) => void;
}

export function Step3_Attributes({ perk, setPerk, flaw, setFlaw }: Step3Props) {
    return (
        <Step title="۳. انتخاب ویژگی‌ها" description="یک نقطه قوت (Perk) و یک نقطه ضعف (Flaw) انتخاب کنید تا به شخصیت خود عمق ببخشید.">
            <div className="grid md:grid-cols-2 gap-8">
                <FeatureSelection 
                    title="نقاط قوت (Perks)" 
                    items={perks} 
                    selected={perk} 
                    onSelect={setPerk as (key: string) => void} 
                    showDescription={true} 
                    layout="list" 
                />
                <FeatureSelection 
                    title="نقاط ضعف (Flaws)" 
                    items={flaws} 
                    selected={flaw} 
                    onSelect={setFlaw as (key: string) => void} 
                    showDescription={true} 
                    layout="list" 
                />
            </div>
        </Step>
    );
}
