
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Progress } from '../ui/progress';
import type { CustomScenario } from '@/lib/types';
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
import { useGameContext } from '@/context/game-context';
import Link from 'next/link';

import { Step1_WorldBasics } from './new-game/Step1_WorldBasics';
import { Step2_CharacterProfile } from './new-game/Step2_CharacterProfile';
import { Step3_Attributes } from './new-game/Step3_Attributes';
import { Step4_Equipment } from './new-game/Step4_Equipment';
import { Step5_OpeningScene } from './new-game/Step5_OpeningScene';
import { Step6_Review } from './new-game/Step6_Review';


const TOTAL_STEPS = 6;

export function NewGameCreator() {
    const { startGame } = useGameContext();
    const [step, setStep] = useState(1);
    
    // State for all steps
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
    
    const handleStartGameClick = () => {
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
        startGame(customScenario, characterName);
    }
    
    const renderStep = () => {
        switch (step) {
            case 1: return <Step1_WorldBasics 
                scenarioTitle={scenarioTitle}
                setScenarioTitle={setScenarioTitle}
                genre={genre}
                setGenre={setGenre}
                difficulty={difficulty}
                setDifficulty={setDifficulty}
                gmPersonality={gmPersonality}
                setGmPersonality={setGmPersonality}
            />;
            case 2: return <Step2_CharacterProfile
                characterName={characterName}
                setCharacterName={setCharacterName}
                characterDesc={characterDesc}
                setCharacterDesc={setCharacterDesc}
                customArchetype={customArchetype}
                setCustomArchetype={setCustomArchetype}
                selectedArchetype={selectedArchetype}
                setSelectedArchetype={setSelectedArchetype}
            />;
            case 3: return <Step3_Attributes
                perk={perk}
                setPerk={setPerk}
                flaw={flaw}
                setFlaw={setFlaw}
            />;
            case 4: return <Step4_Equipment
                difficulty={difficulty}
                initialItems={initialItems}
                setInitialItems={setInitialItems}
            />;
            case 5: return <Step5_OpeningScene
                genre={genre}
                storyPrompt={storyPrompt}
                setStoryPrompt={setStoryPrompt}
                writingCustomScene={writingCustomScene}
                setWritingCustomScene={setWritingCustomScene}
            />;
            case 6: return <Step6_Review
                data={{
                    scenarioTitle,
                    genre,
                    difficulty,
                    gmPersonality,
                    characterName,
                    archetype: customArchetype.trim() || selectedArchetype,
                    perk,
                    flaw,
                    items: Object.entries(initialItems).map(([item, count]) => count > 1 ? `${item} (x${count})` : item),
                    storyPrompt,
                }}
            />;
            default: return null;
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
            <div className="w-full max-w-4xl">
                <div className="flex justify-between items-center mb-4">
                     <Link href="/" passHref>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                     </Link>
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
                    {step === TOTAL_STEPS && <Button onClick={handleStartGameClick} className="bg-primary hover:bg-primary/90">شروع ماجراجویی</Button>}
                </div>
            </div>
        </div>
    );
}
