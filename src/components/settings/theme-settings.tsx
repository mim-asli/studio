
"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useSettingsContext } from "@/context/settings-context";

export function ThemeSettings() {
    const { settings, updateSettings } = useSettingsContext();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Monitor className="w-6 h-6 text-primary"/>پوسته برنامه</CardTitle>
                <CardDescription>ظاهر کلی برنامه را انتخاب کنید.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4">
                    <button onClick={() => updateSettings(draft => {draft.theme = 'light'})} className={cn("flex flex-col items-center gap-2 p-4 border-2 rounded-lg w-full", settings.theme === 'light' ? 'border-primary' : 'border-transparent hover:border-muted-foreground/20')}>
                        <div className="w-16 h-10 rounded-md bg-gray-200 flex items-center justify-center"><Sun className="text-gray-600"/></div>
                        <span>روشن</span>
                    </button>
                    <button onClick={() => updateSettings(draft => {draft.theme = 'dark'})} className={cn("flex flex-col items-center gap-2 p-4 border-2 rounded-lg w-full", settings.theme === 'dark' ? 'border-primary' : 'border-transparent hover:border-muted-foreground/20')}>
                        <div className="w-16 h-10 rounded-md bg-gray-800 flex items-center justify-center"><Moon className="text-gray-300"/></div>
                        <span>تاریک</span>
                    </button>
                </div>
            </CardContent>
        </Card>
    )
}
