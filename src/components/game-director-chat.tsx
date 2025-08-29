
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Bot, User, Send } from "lucide-react";
import type { DirectorMessage, GameState } from "@/lib/types";
import { queryGameDirector } from '@/ai/flows/query-game-director';

interface GameDirectorChatProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState | null;
}

export function GameDirectorChat({ isOpen, onClose, gameState }: GameDirectorChatProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<DirectorMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  
  // Effect to add initial director message only once when a game starts
  useEffect(() => {
    if(gameState && messages.length === 0) {
        setMessages([
            { role: 'model', content: "سلام! من کارگردان بازی هستم. هر سوالی در مورد دنیای بازی، شخصیت‌ها، یا سناریوهای 'چه می‌شد اگر...' دارید، از من بپرسید. من اینجا هستم تا به شما کمک کنم داستان خود را عمیق‌تر کشف کنید." },
        ]);
    }
    if (!gameState) {
        setMessages([]);
    }
  }, [gameState, messages.length]);


  useEffect(() => {
    const viewport = scrollViewportRef.current;
    if (viewport) {
      setTimeout(() => {
        viewport.scrollTop = viewport.scrollHeight;
      }, 50);
    }
  }, [messages]);

  const handleSend = useCallback(async (query: string) => {
    if (!query.trim() || isLoading || !gameState) return;

    const userMessage: DirectorMessage = { role: 'user', content: query };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
        const gameStateString = JSON.stringify(gameState, null, 2);
        const conversationHistory = newMessages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        const response = await queryGameDirector({
            playerQuery: query,
            gameState: gameStateString,
            conversationHistory: conversationHistory
        });

        const directorMessage: DirectorMessage = { role: 'model', content: response.directorResponse };
        setMessages(prev => [...prev, directorMessage]);

    } catch (error) {
        console.error("Error querying game director:", error);
        const errorMessage: DirectorMessage = { role: 'model', content: "متاسفانه در حال حاضر نمی‌توانم پاسخ دهم. لطفاً بعداً دوباره تلاش کنید." };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  }, [isLoading, gameState, messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    handleSend(input);
    setInput('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] h-[70vh] flex flex-col bg-background">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Bot /> گفتگو با کارگردان بازی</DialogTitle>
          <DialogDescription>
            از هوش مصنوعی در مورد دنیای بازی، شخصیت‌ها یا احتمالات سوال بپرسید.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-grow border rounded-md p-4 bg-muted/50" viewportRef={scrollViewportRef}>
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'model' && <Bot className="w-6 h-6 text-primary shrink-0 mt-1" />}
                <div className={`p-3 rounded-lg max-w-[85%] ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
                 {msg.role === 'user' && <User className="w-6 h-6 text-muted-foreground shrink-0 mt-1" />}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-3">
                 <Bot className="w-6 h-6 text-primary shrink-0" />
                 <div className="p-3 rounded-lg bg-background">
                    <Loader2 className="w-5 h-5 animate-spin" />
                 </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="سوال خود را تایپ کنید..."
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading} size="icon">
              <Send />
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
