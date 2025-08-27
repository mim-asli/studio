"use client";

import { useTypewriter } from '@/hooks/use-typewriter';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useRef } from 'react';

interface StoryDisplayProps {
  storySegments: string[];
}

export function StoryDisplay({ storySegments = [] }: StoryDisplayProps) {
  // Ensure storySegments is always an array
  const segments = Array.isArray(storySegments) ? storySegments : [];
  
  const lastSegment = segments.length > 0 ? segments[segments.length - 1] : '';
  const typedStory = useTypewriter(lastSegment, 15);
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  const previousSegments = segments.slice(0, -1).join('\n\n');

  useEffect(() => {
    const viewport = scrollViewportRef.current;
    if (viewport) {
      // Delay scrolling to allow new content to render
      setTimeout(() => {
        viewport.scrollTop = viewport.scrollHeight;
      }, 50);
    }
  }, [typedStory, previousSegments]);

  // Don't render anything if there are no story segments yet
  if (segments.length === 0) {
    return null;
  }

  return (
    <ScrollArea className="h-full w-full" viewportRef={scrollViewportRef}>
        <div className="p-4 sm:p-6 font-code text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap">
          {previousSegments && <p>{previousSegments}</p>}
          {previousSegments && lastSegment && <hr className="my-4 border-border/20" />}
          {lastSegment && <p>{typedStory}</p>}
        </div>
    </ScrollArea>
  );
}
