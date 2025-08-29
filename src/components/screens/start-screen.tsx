
"use client";

import { Button } from "@/components/ui/button";
import Link from 'next/link';
import {
  FilePlus,
  Upload,
  Settings,
  Trophy,
  AlertTriangle,
  Github,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface StartScreenProps {
  apiKeyError?: string;
}

export function StartScreen({
  apiKeyError,
}: StartScreenProps) {

  return (
    <TooltipProvider>
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 overflow-hidden">
        
        <div className="absolute top-4 right-4">
          <Tooltip>
            <TooltipTrigger asChild>
                <a href="https://github.com/google/genkit/tree/main/examples/dastan" target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon">
                    <Github />
                  </Button>
                </a>
            </TooltipTrigger>
            <TooltipContent>
              <p>مشاهده پروژه در گیت‌هاب</p>
            </TooltipContent>
          </Tooltip>
        </div>


        <div className="text-center mb-12">
          <h1 className="text-8xl md:text-9xl font-headline text-primary mb-2 tracking-widest">
            داستان
          </h1>
          <p className="text-lg text-muted-foreground font-body">
            یک بازی نقش‌آفرینی بی‌پایان با هوش مصنوعی
          </p>
        </div>

        {apiKeyError && (
          <div className="bg-destructive/20 border border-destructive text-destructive-foreground p-4 rounded-md flex items-center gap-4 max-w-md mx-auto mb-8">
            <AlertTriangle className="h-6 w-6" />
            <div>
              <h3 className="font-bold">خطای پیکربندی</h3>
              <p className="text-sm">{apiKeyError}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Link href="/new" passHref>
            <Button size="lg" variant="default" className="w-full">
              <FilePlus />
              ماجراجویی جدید
            </Button>
          </Link>
          <Link href="/load" passHref>
            <Button size="lg" variant="outline" className="w-full">
              <Upload />
              بارگذاری ماجراجویی
            </Button>
          </Link>
        </div>

        <div className="absolute bottom-4 right-4 flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/settings" passHref>
                    <Button variant="ghost" size="icon">
                      <Settings />
                    </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>تنظیمات</p>
              </TooltipContent>
            </Tooltip>
             <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/scoreboard" passHref>
                    <Button variant="ghost" size="icon">
                      <Trophy />
                    </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>تالار افتخارات</p>
              </TooltipContent>
            </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
