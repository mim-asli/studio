
"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ScoreboardProps {
    onBack: () => void;
}

export function Scoreboard({ onBack }: ScoreboardProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
            <h1 className="text-4xl font-headline text-accent mb-8">تالار افتخارات</h1>
             <p className="text-muted-foreground mb-8">
                به زودی: جایی برای ثبت دستاوردهای شما.
            </p>
            <Button onClick={onBack}>
                <ArrowLeft className="ml-2" />
                بازگشت
            </Button>
        </div>
    );
}
