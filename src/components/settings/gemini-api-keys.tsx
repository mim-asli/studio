
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, HelpCircle, KeyRound, Loader2, Plus, Trash2, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import type { ApiKey } from "@/lib/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useSettingsContext } from "@/context/settings-context";

export function GeminiApiKeys() {
    const { settings, updateSettings, setApiKeyStatus } = useSettingsContext();
    const [newApiKey, setNewApiKey] = useState({ name: '', value: '' });
    const [isTesting, setIsTesting] = useState<string | null>(null);

    const handleAddApiKey = () => {
        if (newApiKey.name && newApiKey.value) {
            updateSettings(draft => {
                draft.geminiApiKeys.push({ id: crypto.randomUUID(), ...newApiKey, enabled: true, status: 'unchecked' });
            });
            setNewApiKey({ name: '', value: '' });
        }
    };

    const handleTestKey = async (key: ApiKey) => {
        setIsTesting(key.id);
        // This is a mock test. In a real app, you'd make an API call.
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulate different outcomes for demonstration
        let status: ApiKey['status'] = 'invalid';
        if (key.value.startsWith("valid")) status = 'valid';
        if (key.value.startsWith("quota")) status = 'quota_exceeded';

        setApiKeyStatus(key.id, status);
        setIsTesting(null);
    };

    const handleTestAllKeys = () => {
        settings.geminiApiKeys.forEach(key => {
            if(key.enabled) handleTestKey(key);
        });
    }

    const getStatusIcon = (status: ApiKey['status']) => {
        switch (status) {
            case 'valid': return <CheckCircle className="text-green-500" />;
            case 'invalid': return <XCircle className="text-destructive" />;
            case 'quota_exceeded': return <AlertTriangle className="text-yellow-500" />;
            default: return <HelpCircle className="text-muted-foreground" />;
        }
    };

    const getStatusTooltip = (status: ApiKey['status']) => {
        switch (status) {
            case 'valid': return "کلید معتبر است";
            case 'invalid': return "کلید نامعتبر است";
            case 'quota_exceeded': return "سهمیه کلید تمام شده";
            default: return "وضعیت بررسی نشده";
        }
    }

    return (
        <TooltipProvider>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><KeyRound className="w-6 h-6 text-primary"/>کلیدهای Google Gemini API</CardTitle>
                    <CardDescription>
                        موتور اصلی تولید داستان. می‌توانید چندین کلید برای چرخش خودکار اضافه کنید.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        {settings.geminiApiKeys.map((key) => (
                            <div key={key.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                                <Tooltip>
                                    <TooltipTrigger>{getStatusIcon(key.status)}</TooltipTrigger>
                                    <TooltipContent><p>{getStatusTooltip(key.status)}</p></TooltipContent>
                                </Tooltip>
                                <span className="font-mono text-sm flex-1 truncate">{key.name}</span>
                                <Button size="sm" variant="ghost" onClick={() => handleTestKey(key)} disabled={isTesting === key.id}>
                                    {isTesting === key.id ? <Loader2 className="animate-spin" /> : 'تست'}
                                </Button>
                                <Switch
                                    checked={key.enabled}
                                    onCheckedChange={(checked) => updateSettings(draft => { draft.geminiApiKeys.find(k => k.id === key.id)!.enabled = checked; })}
                                />
                                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => updateSettings(draft => {draft.geminiApiKeys = draft.geminiApiKeys.filter(k => k.id !== key.id);})}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                    <Separator />
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Input placeholder="نام کلید (مثلا: شخصی ۱)" value={newApiKey.name} onChange={(e) => setNewApiKey(s => ({...s, name: e.target.value}))} />
                        <Input placeholder="مقدار کلید API" type="password" value={newApiKey.value} onChange={(e) => setNewApiKey(s => ({...s, value: e.target.value}))} />
                        <Button onClick={handleAddApiKey} className="shrink-0"><Plus className="ml-2"/> افزودن کلید</Button>
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={handleTestAllKeys} variant="secondary" disabled={!!isTesting}>تست همه کلیدهای فعال</Button>
                    </div>
                </CardContent>
            </Card>
        </TooltipProvider>
    );
}
