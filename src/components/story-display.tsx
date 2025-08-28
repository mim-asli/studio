
"use client";

import { useTypewriter } from '@/hooks/use-typewriter';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useRef } from 'react';
import { PLAYER_ACTION_PREFIX } from '@/lib/game-data';

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
  
  const lastSegment = segments.length > 0 ? segments[segments.length - 1] : '';
  const isLastSegmentPlayerAction = lastSegment.startsWith(PLAYER_ACTION_PREFIX);
  
  // The typewriter effect is only applied if the last segment is not a player action.
  const { displayText: typedStory, skip: skipTypewriter, isDone } = useTypewriter(
      isLastSegmentPlayerAction ? '' : lastSegment, 
      20
  );
  
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  const previousSegments = segments.slice(0, -1);

  useEffect(() => {
    const viewport = scrollViewportRef.current;
    if (viewport) {
      setTimeout(() => {
        viewport.scrollTop = viewport.scrollHeight;
      }, 50); // A small delay to allow the DOM to update
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
  
  // Decide what to render for the last segment
  const finalLastSegmentContent = isLastSegmentPlayerAction ? lastSegment : typedStory;

  return (
    <ScrollArea className="h-full w-full" viewportRef={scrollViewportRef}>
        <div 
          className="p-4 sm:p-6 font-code text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap min-h-full cursor-pointer"
          onClick={handleDisplayClick}
        >
          {previousSegments.map((segment, index) => (
              <p key={index}>
                {parseSegment(segment)}
                <br/><br/>
              </p>
           ))}
          {finalLastSegmentContent && <p>{parseSegment(finalLastSegmentContent)}</p>}
        </div>
    </ScrollArea>
  );
}
