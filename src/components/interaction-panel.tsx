"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, ChevronsLeft, Mic, MicOff } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { cn } from '@/lib/utils';

interface InteractionPanelProps {
  choices: string[];
  onAction: (action: string) => void;
  isLoading: boolean;
}

export function InteractionPanel({ choices, onAction, isLoading }: InteractionPanelProps) {
  const [customInput, setCustomInput] = useState('');
  const {
    transcript,
    listening,
    startListening,
    stopListening,
    isUnsupported,
  } = useSpeechRecognition();

  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (transcript) {
      setCustomInput(transcript);
    }
  }, [transcript]);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim() && !isLoading) {
      onAction(customInput.trim());
      setCustomInput('');
    }
  };

  const handleMicClick = () => {
    if (listening) {
        stopListening();
    } else {
        startListening();
    }
  };
  
  return (
    <Card className="bg-transparent border">
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="font-headline text-2xl tracking-wider">اقدامات</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {choices?.map((choice, index) => (
            <Button
              key={index}
              variant="outline"
              className="justify-start text-right h-auto whitespace-normal py-2"
              onClick={() => onAction(choice)}
              disabled={isLoading}
            >
              <ChevronsLeft className="ml-2 h-4 w-4 shrink-0" />
              {choice}
            </Button>
          ))}
        </div>
        <div className="mt-auto pt-2">
            <form onSubmit={handleCustomSubmit} className="flex gap-2">
                <Input
                    placeholder={listening ? "در حال گوش دادن..." : "چه کار می‌کنی؟"}
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    disabled={isLoading}
                    className="bg-background/50 focus:ring-primary"
                />
                 <Button
                    type="button"
                    size="icon"
                    onClick={handleMicClick}
                    disabled={isLoading || isUnsupported}
                    variant={listening ? "destructive" : "outline"}
                    className={cn(listening && "animate-pulse")}
                >
                    {listening ? <MicOff /> : <Mic />}
                    <span className="sr-only">{listening ? "توقف ضبط" : "شروع ضبط"}</span>
                </Button>
                <Button type="submit" size="icon" disabled={isLoading} variant="default">
                    <Send />
                </Button>
            </form>
             {isUnsupported && <p className="text-xs text-destructive mt-2">مرورگر شما از تشخیص گفتار پشتیبانی نمی‌کند.</p>}
        </div>
      </CardContent>
    </Card>
  );
}
