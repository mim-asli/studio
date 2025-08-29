
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Award, Skull, CalendarDays, User } from "lucide-react";
import type { HallOfFameEntry } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import Link from 'next/link';

interface ScoreboardProps {
}

const HALL_OF_FAME_KEY = "dastan-hall-of-fame";

export function Scoreboard({}: ScoreboardProps) {
    const [entries, setEntries] = useState<HallOfFameEntry[]>([]);

    useEffect(() => {
        const storedEntries = localStorage.getItem(HALL_OF_FAME_KEY);
        if (storedEntries) {
            const parsedEntries: HallOfFameEntry[] = JSON.parse(storedEntries);
            parsedEntries.sort((a, b) => b.timestamp - a.timestamp); // Show newest first
            setEntries(parsedEntries);
        }
    }, []);

    return (
        <div className="flex flex-col items-center min-h-screen bg-background text-foreground p-4 sm:p-6">
            <header className="flex justify-between items-center mb-8 w-full max-w-4xl">
                <Link href="/" passHref>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                </Link>
                <h1 className="text-3xl sm:text-4xl font-headline text-primary flex items-center gap-3">
                    <Award className="w-8 h-8"/>
                    تالار افتخارات
                </h1>
                <div className="w-10"></div>
            </header>

            <main className="w-full max-w-4xl">
                 {entries.length > 0 ? (
                    <div className="space-y-4">
                        {entries.map(entry => (
                            <Card key={entry.id} className="bg-card/50 backdrop-blur-sm border-primary/20">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 text-primary">
                                        <User/>
                                        {entry.characterName}
                                    </CardTitle>
                                    <CardDescription>{entry.scenarioTitle}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm">
                                    <div className="flex items-start gap-3 text-muted-foreground">
                                        <Skull className="w-5 h-5 mt-0.5 shrink-0 text-destructive/80"/>
                                        <div>
                                            <p className="font-semibold text-foreground">سرنوشت</p>
                                            <p>{entry.outcome}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <CalendarDays className="w-5 h-5 shrink-0"/>
                                        <p>{entry.daysSurvived} روز زنده ماند.</p>
                                    </div>
                                     <p className="text-xs text-muted-foreground/70 pt-3 text-left border-t border-border/50">
                                        پایان ماجراجویی: {new Date(entry.timestamp).toLocaleString('fa-IR')}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <Award className="w-24 h-24 text-muted-foreground/30 mx-auto mb-4"/>
                        <h2 className="text-2xl font-bold">تالار افتخارات خالی است</h2>
                        <p className="text-muted-foreground mt-2">
                           یک ماجراجویی را به پایان برسانید تا نام خود را در اینجا ثبت کنید.
                        </p>
                    </div>
                )}
                 <div className="text-center mt-10">
                    <Link href="/" passHref>
                        <Button>
                            <ArrowLeft className="ml-2" />
                            بازگشت به منوی اصلی
                        </Button>
                    </Link>
                </div>
            </main>
        </div>
    );
}
