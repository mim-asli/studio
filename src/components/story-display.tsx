
"use client";

import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useRef } from 'react';
import { PLAYER_ACTION_PREFIX } from '@/hooks/use-game-loop';

interface StoryDisplayProps {
  storySegments: string[];
}

const parseSegment = (text: string) => {
    if (!text) return null;

    if (text.startsWith(PLAYER_ACTION_PREFIX)) {
        return (
            <span className="text-player-action font-bold">
                {text}
            </span>
        );
    }
    
    return text;
};


export function StoryDisplay({ storySegments = [] }: StoryDisplayProps) {
  const segments = Array.isArray(storySegments) ? storySegments : [];
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = scrollViewportRef.current;
    if (viewport) {
      setTimeout(() => {
        viewport.scrollTop = viewport.scrollHeight;
      }, 50); 
    }
  }, [segments]);


  if (segments.length === 0) {
    return null;
  }
  
  return (
    <ScrollArea className="h-full w-full relative z-10" viewportRef={scrollViewportRef}>
        <div 
          className="p-4 sm:p-6 font-code text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap min-h-full"
        >
          {segments.map((segment, index) => (
              <p key={index}>
                {parseSegment(segment)}
                {index < segments.length - 1 && <><br/><br/></>}
              </p>
           ))}
        </div>
    </ScrollArea>
  );
}
