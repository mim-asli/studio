"use client";

import { useTypewriter } from '@/hooks/use-typewriter';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useRef } from 'react';

interface StoryDisplayProps {
  storySegments: string[];
}

export function StoryDisplay({ storySegments }: StoryDisplayProps) {
  const lastSegment = storySegments[storySegments.length - 1] || '';
  const typedStory = useTypewriter(lastSegment, 15);
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  const previousSegments = storySegments.slice(0, -1).join('\n\n');

  useEffect(() => {
    const viewport = scrollViewportRef.current;
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [typedStory, previousSegments]);

  return (
    <ScrollArea className="h-full w-full" viewportRef={scrollViewportRef}>
        <div className="p-4 sm:p-6 font-code text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap">
          {previousSegments && <p>{previousSegments}</p>}
          {previousSegments && <hr className="my-4 border-border/20" />}
          <p>{typedStory}</p>
        </div>
    </ScrollArea>
  );
}
