"use client";

import { useTypewriter } from '@/hooks/use-typewriter';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useRef } from 'react';
import { PLAYER_ACTION_PREFIX } from './game-client';

interface StoryDisplayProps {
  storySegments: string[];
}

const parseSegment = (text: string) => {
    if (!text) return null;

    const isPlayerAction = text.startsWith(PLAYER_ACTION_PREFIX);
    const contentToParse = isPlayerAction ? text.substring(PLAYER_ACTION_PREFIX.length) : text;

    // A helper function to parse for the keyword "داستان" and other keywords
    const parseForKeywords = (str: string) => {
        // This regex will split the string by the keywords, keeping the keywords.
        const parts = str.split(/(داستان)/g); 
        return parts.map((part, index) => {
            if (part === 'داستان') {
                return <span key={index} className="text-primary font-bold">{part}</span>;
            }
            return part;
        });
    };

    if (isPlayerAction) {
        return (
            <span className="text-player-action font-bold">
                {PLAYER_ACTION_PREFIX}
                {parseForKeywords(contentToParse)}
            </span>
        );
    }
    
    return parseForKeywords(contentToParse);
};


export function StoryDisplay({ storySegments = [] }: StoryDisplayProps) {
  const segments = Array.isArray(storySegments) ? storySegments : [];
  
  const lastSegment = segments.length > 0 ? segments[segments.length - 1] : '';
  const isLastSegmentPlayerAction = lastSegment.startsWith(PLAYER_ACTION_PREFIX);
  
  // Only use typewriter effect for non-player actions
  const typedStory = useTypewriter(isLastSegmentPlayerAction ? '' : lastSegment, 15);
  
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  const previousSegments = segments.slice(0, -1);

  useEffect(() => {
    const viewport = scrollViewportRef.current;
    if (viewport) {
      setTimeout(() => {
        viewport.scrollTop = viewport.scrollHeight;
      }, 50);
    }
  }, [typedStory, segments]); // Depend on `segments` to scroll for player actions too

  if (segments.length === 0) {
    return null;
  }
  
  const finalLastSegment = isLastSegmentPlayerAction ? parseSegment(lastSegment) : parseSegment(typedStory);

  return (
    <ScrollArea className="h-full w-full" viewportRef={scrollViewportRef}>
        <div className="p-4 sm:p-6 font-code text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap">
          {previousSegments.map((segment, index) => (
            <p key={index}>
              {parseSegment(segment)}
              <br/><br/>
            </p>
          ))}
          {lastSegment && <p>{finalLastSegment}</p>}
        </div>
    </ScrollArea>
  );
}
