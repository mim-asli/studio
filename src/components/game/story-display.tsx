
"use client";

import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useRef, useState } from 'react';
import { PLAYER_ACTION_PREFIX } from '@/hooks/use-game-loop';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { cn } from '@/lib/utils';


interface StoryDisplayProps {
  storySegments?: string[];
  image?: string | null;
  isImageLoading?: boolean;
}

export function StoryDisplay({ storySegments = [], image, isImageLoading }: StoryDisplayProps) {
  const segments = Array.isArray(storySegments) ? storySegments : [];
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const [internalImage, setInternalImage] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (image) {
      setIsAnimating(true);
      setInternalImage(image);
      // Animation duration is 500ms
      setTimeout(() => setIsAnimating(false), 500);
    }
  }, [image]);

  useEffect(() => {
    const viewport = scrollViewportRef.current;
    if (viewport) {
      setTimeout(() => {
        viewport.scrollTop = viewport.scrollHeight;
      }, 50);
    }
  }, [segments, scrollViewportRef]);

  const renderSegment = (segment: string) => {
    if (!segment) return null;
    if (segment.startsWith(PLAYER_ACTION_PREFIX)) {
        return <span className="text-orange-500 font-bold">{segment}</span>
    }
    return segment;
  }

  return (
    <ScrollArea className="h-full w-full relative z-10" viewportRef={scrollViewportRef}>
      <div className="p-4 sm:p-6 font-code text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap min-h-full flex flex-col">
        
        {(isImageLoading || internalImage) && (
          <div className="mb-4 rounded-lg overflow-hidden border shadow-lg w-full max-w-xl mx-auto aspect-video">
            {isImageLoading ? (
              <Skeleton className="w-full h-full" />
            ) : internalImage ? (
               <Image
                src={internalImage}
                alt="AI-generated scene"
                width={1280}
                height={720}
                className={cn(
                  "w-full h-full object-cover transition-opacity duration-500",
                  isAnimating ? "opacity-0" : "opacity-100"
                )}
                onLoadingComplete={() => setIsAnimating(false)}
              />
            ) : null}
          </div>
        )}

        <div className="flex-grow">
          {segments.map((segment, index) => (
            <p key={index}>
              {renderSegment(segment)}
            </p>
          ))}
        </div>

      </div>
    </ScrollArea>
  );
}
