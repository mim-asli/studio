
"use client";

import Link from "next/link";
import { ArrowLeft, Cog, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettingsContext } from "@/context/settings-context";
import { ThemeSettings } from "@/components/settings/theme-settings";
import { ImageGenerationSettings } from "@/components/settings/image-generation-settings";
import { GeminiApiKeys } from "@/components/settings/gemini-api-keys";
import { HuggingFaceSettings } from "@/components/settings/huggingface-settings";
import { LocalLlmSettings } from "@/components/settings/local-llm-settings";

export function SettingsPage() {
  const { isLoaded } = useSettingsContext();

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
        <Loader2 className="w-16 h-16 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">در حال بارگذاری تنظیمات...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center min-h-screen bg-muted/20 text-foreground p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl">
        <header className="flex justify-between items-center mb-6">
          <Link href="/" passHref>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-headline text-primary flex items-center gap-3">
            <Cog className="w-8 h-8"/>
            تنظیمات
          </h1>
          <div className="w-10"></div>
        </header>

        <main className="space-y-8">
          <ThemeSettings />
          <ImageGenerationSettings />
          <GeminiApiKeys />
          <HuggingFaceSettings />
          <LocalLlmSettings />
        </main>
      </div>
    </div>
  );
}
