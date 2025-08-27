"use client";

import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";

interface CustomScenarioCreatorProps {
    onBack: () => void;
}

export function CustomScenarioCreator({ onBack }: CustomScenarioCreatorProps) {
    return (
         <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
            <h1 className="text-4xl font-headline text-accent mb-8">خالق سناریوی سفارشی</h1>
            <p className="text-muted-foreground mb-8">
                به زودی: ابزاری برای ساخت دنیاها، شخصیت‌ها و داستان‌های خودتان.
            </p>
            <Button onClick={onBack}>
                <ArrowLeft className="ml-2" />
                بازگشت
            </Button>
        </div>
    );
}
