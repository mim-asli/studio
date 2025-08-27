"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface SettingsPageProps {
    onBack: () => void;
}

export function SettingsPage({ onBack }: SettingsPageProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
            <h1 className="text-4xl font-headline text-accent mb-8">تنظیمات</h1>
             <p className="text-muted-foreground mb-8">
                به زودی: پنل کنترل سیستم برای مدیریت کلیدهای API و موارد دیگر.
            </p>
            <Button onClick={onBack}>
                <ArrowLeft className="ml-2" />
                بازگشت
            </Button>
        </div>
    );
}
