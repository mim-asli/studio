
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, HelpCircle, KeyRound, Loader2, Plus, Save, Trash2, XCircle, AlertTriangle, Monitor, Moon, Sun, Server, BrainCircuit, Waves, Music, Volume2, Cog, Image } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/hooks/use-settings";
import type { ApiKey } from "@/lib/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils";

interface SettingsPageProps {
  onBack: () => void;
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  const { settings, updateSettings, isLoaded, setApiKeyStatus } = useSettings();
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
    const random = Math.random();
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

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
        <Loader2 className="w-16 h-16 animate-spin text-accent" />
        <p className="mt-4 text-muted-foreground">در حال بارگذاری تنظیمات...</p>
      </div>
    );
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
    <div className="flex justify-center min-h-screen bg-muted/20 text-foreground p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl">
        <header className="flex justify-between items-center mb-6">
          <Button onClick={onBack} variant="ghost" size="icon">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-3xl sm:text-4xl font-headline text-accent flex items-center gap-3">
            <Cog className="w-8 h-8"/>
            تنظیمات
          </h1>
          <div className="w-10"></div>
        </header>

        <main className="space-y-8">
          {/* --- Theme Settings --- */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Monitor className="text-accent"/>پوسته برنامه</CardTitle>
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

           {/* --- Image Generation --- */}
           <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Image className="text-accent" /> تولید تصویر با هوش مصنوعی</CardTitle>
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

          {/* --- Gemini API Keys --- */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><KeyRound className="text-accent"/>کلیدهای Google Gemini API</CardTitle>
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

          {/* --- Hugging Face --- */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BrainCircuit className="text-accent"/>هوش مصنوعی Hugging Face (اختیاری)</CardTitle>
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

          {/* --- Local LLM --- */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Server className="text-accent"/>هوش مصنوعی محلی (اختیاری)</CardTitle>
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
        </main>
      </div>
    </div>
    </TooltipProvider>
  );
}
