"use client";

import { useTypewriter } from '@/hooks/use-typewriter';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useRef } from 'react';

interface StoryDisplayProps {
  storySegments: string[];
}

// Helper function to parse text and highlight the word "داستان"
const highlightWord = (text: string, word: string) => {
    if (!text) return [];
    const parts = text.split(new RegExp(`(${word})`, 'g'));
    return parts.map((part, index) => 
        part === word ? (
            <span key={index} className="text-primary">{word}</span>
        ) : (
            part
        )
    );
};

export function StoryDisplay({ storySegments = [] }: StoryDisplayProps) {
  const segments = Array.isArray(storySegments) ? storySegments : [];
  
  const lastSegment = segments.length > 0 ? segments[segments.length - 1] : '';
  const typedStory = useTypewriter(lastSegment, 15);
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  const previousSegments = segments.slice(0, -1);

  useEffect(() => {
    const viewport = scrollViewportRef.current;
    if (viewport) {
      setTimeout(() => {
        viewport.scrollTop = viewport.scrollHeight;
      }, 50);
    }
  }, [typedStory, previousSegments]);

  if (segments.length === 0) {
    return null;
  }

  return (
    <ScrollArea className="h-full w-full" viewportRef={scrollViewportRef}>
        <div className="p-4 sm:p-6 font-code text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap">
          {previousSegments.map((segment, index) => (
            <p key={index}>
              {highlightWord(segment, 'داستان')}
              <br/><br/>
            </p>
          ))}
          {lastSegment && <p>{highlightWord(typedStory, 'داستان')}</p>}
        </div>
    </ScrollArea>
  );
}
