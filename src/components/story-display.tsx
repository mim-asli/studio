
"use client";

import { useTypewriter } from '@/hooks/use-typewriter';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useRef, useState } from 'react';
import { PLAYER_ACTION_PREFIX } from './game-client';

interface StoryDisplayProps {
  storySegments: string[];
}

const parseSegment = (text: string, isPlayerAction: boolean) => {
    if (!text) return null;

    if (isPlayerAction) {
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
  
  const lastSegment = segments.length > 0 ? segments[segments.length - 1] : '';
  const isLastSegmentPlayerAction = lastSegment.startsWith(PLAYER_ACTION_PREFIX);
  
  const { displayText: typedStory, skip: skipTypewriter, isDone } = useTypewriter(isLastSegmentPlayerAction ? '' : lastSegment, 15);
  
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  const previousSegments = segments.slice(0, -1);

  useEffect(() => {
    const viewport = scrollViewportRef.current;
    if (viewport) {
      setTimeout(() => {
        viewport.scrollTop = viewport.scrollHeight;
      }, 50);
    }
  }, [typedStory, segments]);

  const handleDisplayClick = () => {
    if (!isDone) {
      skipTypewriter();
    }
  };

  if (segments.length === 0) {
    return null;
  }
  
  const finalLastSegment = isLastSegmentPlayerAction ? parseSegment(lastSegment, true) : parseSegment(typedStory, false);

  return (
    <ScrollArea className="h-full w-full" viewportRef={scrollViewportRef}>
        <div 
          className="p-4 sm:p-6 font-code text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap min-h-full"
          onClick={handleDisplayClick}
        >
          {previousSegments.map((segment, index) => {
            const isPlayer = segment.startsWith(PLAYER_ACTION_PREFIX);
            return (
              <p key={index}>
                {parseSegment(segment, isPlayer)}
                <br/><br/>
              </p>
            )
           })}
          {lastSegment && <p>{finalLastSegment}</p>}
        </div>
    </ScrollArea>
  );
}
