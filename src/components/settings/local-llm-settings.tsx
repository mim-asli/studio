
"use client";

import { Server } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useSettingsContext } from "@/context/settings-context";

export function LocalLlmSettings() {
    const { settings, updateSettings } = useSettingsContext();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Server className="w-6 h-6 text-primary"/>هوش مصنوعی محلی (اختیاری)</CardTitle>
                <CardDescription>بازی را به یک مدل زبان در حال اجرا روی سیستم خود (مانند Ollama) متصل کنید.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label htmlFor="local-enabled">فعال‌سازی مدل محلی</Label>
                    <Switch id="local-enabled" checked={settings.localLlm.enabled} onCheckedChange={(checked) => updateSettings(draft => {draft.localLlm.enabled = checked})} />
                </div>
                {settings.localLlm.enabled && (
                    <>
                        <div className="grid sm:grid-cols-3 gap-2 items-center">
                            <Label htmlFor="local-endpoint" className="sm:col-span-1">آدرس Endpoint</Label>
                            <Input id="local-endpoint" placeholder="http://127.0.0.1:11434" className="sm:col-span-2" value={settings.localLlm.endpoint} onChange={(e) => updateSettings(draft => {draft.localLlm.endpoint = e.target.value})} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="local-prioritize">اولویت‌بندی مدل محلی</Label>
                            <Switch id="local-prioritize" checked={settings.localLlm.prioritize} onCheckedChange={(checked) => updateSettings(draft => {draft.localLlm.prioritize = checked})} />
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
