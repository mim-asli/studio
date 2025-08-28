
"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, ChevronsLeft, Bot } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


interface InteractionPanelProps {
  choices: string[];
  onAction: (action: string) => void;
  isLoading: boolean;
  onDirectorChat: () => void;
}

export function InteractionPanel({ choices, onAction, isLoading, onDirectorChat }: InteractionPanelProps) {
  const [customInput, setCustomInput] = useState('');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim() && !isLoading) {
      onAction(customInput.trim());
      setCustomInput('');
    }
  };
  
  return (
    <TooltipProvider>
      <Card className="bg-card/80 backdrop-blur-sm border">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="font-headline text-2xl tracking-wider">اقدامات</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col flex-grow gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {choices?.map((choice, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start text-right h-auto whitespace-normal py-2 bg-background/50 hover:bg-background/80"
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
                  <Tooltip>
                      <TooltipTrigger asChild>
                          <Button
                              type="button"
                              size="icon"
                              onClick={onDirectorChat}
                              disabled={isLoading}
                              variant="outline"
                              className="bg-background/50 hover:bg-background/80"
                          >
                              <Bot />
                              <span className="sr-only">گفتگو با کارگردان</span>
                          </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                          <p>گفتگو با کارگردان بازی</p>
                      </TooltipContent>
                  </Tooltip>
                  <Input
                      placeholder={"چه کار می‌کنی؟"}
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      disabled={isLoading}
                      className="bg-background/50 focus:ring-primary"
                  />
                  <Button type="submit" size="icon" disabled={isLoading} variant="default">
                      <Send />
                  </Button>
              </form>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
