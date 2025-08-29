
"use client";

import { Step } from './step';
import { Input, Textarea } from '@/components/ui/input';
import { FeatureSelection } from './feature-selection';
import { archetypes } from '@/lib/game-data';
import type { archetypes as ArchetypesType } from '@/lib/game-data';

interface Step2Props {
    characterName: string;
    setCharacterName: (value: string) => void;
    characterDesc: string;
    setCharacterDesc: (value: string) => void;
    customArchetype: string;
    setCustomArchetype: (value: string) => void;
    selectedArchetype: keyof typeof ArchetypesType | null;
    setSelectedArchetype: (value: keyof typeof ArchetypesType | null) => void;
}

export function Step2_CharacterProfile({
    characterName,
    setCharacterName,
    characterDesc,
    setCharacterDesc,
    customArchetype,
    setCustomArchetype,
    selectedArchetype,
    setSelectedArchetype,
}: Step2Props) {
    return (
        <Step title="۲. پروفایل شخصیت" description="به قهرمان خود یک نام، یک کلاس و یک پیشینه (اختیاری) بدهید.">
            <div className="space-y-6">
                <Input 
                    placeholder="نام شخصیت" 
                    value={characterName} 
                    onChange={e => setCharacterName(e.target.value)} 
                    className="text-center text-lg" 
                />
                <div>
                    <FeatureSelection 
                        items={archetypes} 
                        selected={selectedArchetype} 
                        onSelect={(key) => {
                            setSelectedArchetype(key as keyof typeof ArchetypesType);
                            setCustomArchetype(''); 
                        }} 
                        columns="4"
                        title="کهن الگو (Archetype)"
                        showDescription={true}
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
                <Textarea 
                    placeholder="توضیحات و پیشینه شخصیت (اختیاری)" 
                    value={characterDesc} 
                    onChange={e => setCharacterDesc(e.target.value)} 
                    rows={4} 
                />
            </div>
        </Step>
    );
}
