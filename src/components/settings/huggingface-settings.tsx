
"use client";

import { BrainCircuit } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useSettingsContext } from "@/context/settings-context";

export function HuggingFaceSettings() {
    const { settings, updateSettings } = useSettingsContext();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BrainCircuit className="w-6 h-6 text-primary"/>هوش مصنوعی Hugging Face (اختیاری)</CardTitle>
                <CardDescription>از مدل‌های زبان هاگینگ فیس به عنوان جایگزین یا پشتیبان استفاده کنید.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label htmlFor="hf-enabled">فعال‌سازی Hugging Face</Label>
                    <Switch id="hf-enabled" checked={settings.huggingFace.enabled} onCheckedChange={(checked) => updateSettings(draft => {draft.huggingFace.enabled = checked})} />
                </div>
                {settings.huggingFace.enabled && (
                    <>
                        <div className="grid sm:grid-cols-3 gap-2 items-center">
                            <Label htmlFor="hf-api-key" className="sm:col-span-1">کلید API</Label>
                            <Input id="hf-api-key" type="password" placeholder="کلید API هاگینگ فیس" className="sm:col-span-2" value={settings.huggingFace.apiKey} onChange={(e) => updateSettings(draft => {draft.huggingFace.apiKey = e.target.value})} />
                        </div>
                        <div className="grid sm:grid-cols-3 gap-2 items-center">
                            <Label htmlFor="hf-model-id" className="sm:col-span-1">شناسه مدل</Label>
                            <Input id="hf-model-id" placeholder="mistralai/Mistral-7B-Instruct-v0.2" className="sm:col-span-2" value={settings.huggingFace.modelId} onChange={(e) => updateSettings(draft => {draft.huggingFace.modelId = e.target.value})} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="hf-prioritize">اولویت‌بندی Hugging Face</Label>
                            <Switch id="hf-prioritize" checked={settings.huggingFace.prioritize} onCheckedChange={(checked) => updateSettings(draft => {draft.huggingFace.prioritize = checked})} />
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
