"use client";

import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";

interface LoadGameProps {
    onBack: () => void;
}

export function LoadGame({ onBack }: LoadGameProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
             <h1 className="text-4xl font-headline text-accent mb-8">بارگذاری ماجراجویی</h1>
            <div className="w-full max-w-md p-4 bg-muted/20 rounded-lg">
                <p className="text-muted-foreground text-center">
                    هیچ بازی ذخیره شده‌ای یافت نشد.
                </p>
                 {/* List of saved games will go here */}
            </div>
            <Button onClick={onBack} className="mt-8">
                <ArrowLeft className="ml-2" />
                بازگشت
            </Button>
        </div>
    );
}
