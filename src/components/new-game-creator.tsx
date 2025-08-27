"use client";

import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";

interface NewGameCreatorProps {
    onBack: () => void;
}

export function NewGameCreator({ onBack }: NewGameCreatorProps) {
    // This will be a multi-step wizard
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
            <h1 className="text-4xl font-headline text-accent mb-8">ساخت ماجراجویی جدید</h1>
            {/* Wizard content goes here */}
            <p className="text-muted-foreground mb-8">
                به زودی: یک جادوگر چند مرحله‌ای برای ساخت شخصیت شما.
            </p>
            <Button onClick={onBack}>
                <ArrowLeft className="ml-2" />
                بازگشت
            </Button>
        </div>
    );
}
