"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, ChevronsLeft } from 'lucide-react';

interface InteractionPanelProps {
  choices: string[];
  onAction: (action: string) => void;
  isLoading: boolean;
}

export function InteractionPanel({ choices, onAction, isLoading }: InteractionPanelProps) {
  const [customInput, setCustomInput] = useState('');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim() && !isLoading) {
      onAction(customInput.trim());
      setCustomInput('');
    }
  };

  return (
    <Card className="border-accent/20 bg-transparent flex flex-col">
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-accent font-headline">اقدامات</CardTitle>
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
                    placeholder="چه کار می‌کنی؟"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    disabled={isLoading}
                    className="bg-background/50 focus:ring-accent"
                />
                <Button type="submit" size="icon" disabled={isLoading} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Send className="w-4 h-4" />
                </Button>
            </form>
        </div>
      </CardContent>
    </Card>
  );
}
