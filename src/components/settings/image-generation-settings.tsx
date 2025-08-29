
"use client";

import { Image } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSettingsContext } from "@/context/settings-context";

export function ImageGenerationSettings() {
    const { settings, updateSettings } = useSettingsContext();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Image className="w-6 h-6 text-primary" /> تولید تصویر با هوش مصنوعی</CardTitle>
                <CardDescription>
                    به‌طور خودکار برای لحظات کلیدی داستان، تصاویر تولید کنید. (ممکن است هزینه اضافی داشته باشد)
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <Label htmlFor="image-gen-enabled">فعال‌سازی تولید تصویر</Label>
                    <Switch 
                        id="image-gen-enabled" 
                        checked={settings.generateImages} 
                        onCheckedChange={(checked) => updateSettings(draft => { draft.generateImages = checked; })} 
                    />
                </div>
            </CardContent>
        </Card>
    );
}
