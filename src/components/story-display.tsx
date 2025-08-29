
"use client";

import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useRef, useState, useMemo } from 'react';
import { PLAYER_ACTION_PREFIX } from '@/hooks/use-game-loop';
import { useTypewriter } from '@/hooks/use-typewriter';

interface StorySegmentProps {
  segment: string;
  onFinished: () => void;
  isLastSegment: boolean;
}

const StorySegment = ({ segment, onFinished, isLastSegment }: StorySegmentProps) => {
  const { displayText, isDone, skip } = useTypewriter(segment, 20);

  useEffect(() => {
    if (isDone) {
      onFinished();
    }
  }, [isDone, onFinished]);
  
  const handleClick = () => {
      if (!isDone) {
          skip();
      }
  }

  const content = useMemo(() => {
    if (!displayText) return null;
    if (displayText.startsWith(PLAYER_ACTION_PREFIX)) {
        return <span className="text-player-action font-bold">{displayText}</span>
    }
    return displayText;
  },[displayText]);

  return <p onClick={isLastSegment ? handleClick : undefined} className={isLastSegment ? 'cursor-pointer' : ''}>{content}</p>;
};

export function StoryDisplay({ storySegments = [] }: StoryDisplayProps) {
  const segments = Array.isArray(storySegments) ? storySegments : [];
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const [finishedSegments, setFinishedSegments] = useState<boolean[]>([]);

  useEffect(() => {
    setFinishedSegments(new Array(segments.length).fill(false));
  }, [segments.length]);

  const handleSegmentFinished = (index: number) => {
    setFinishedSegments(prev => {
        const newFinished = [...prev];
        newFinished[index] = true;
        return newFinished;
    });
  }

  useEffect(() => {
    const viewport = scrollViewportRef.current;
    if (viewport) {
      setTimeout(() => {
        viewport.scrollTop = viewport.scrollHeight;
      }, 50); 
    }
  }, [segments, finishedSegments, scrollViewportRef]);


  if (segments.length === 0) {
    return null;
  }
  
  const lastSegmentIndex = segments.length - 1;
  
  return (
    <ScrollArea className="h-full w-full relative z-10" viewportRef={scrollViewportRef}>
        <div 
          className="p-4 sm:p-6 font-code text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap min-h-full"
        >
          {segments.map((segment, index) => (
             <div key={index}>
                 { (index === 0 || finishedSegments[index - 1]) && 
                    <StorySegment 
                        segment={segment} 
                        onFinished={() => handleSegmentFinished(index)}
                        isLastSegment={index === lastSegmentIndex}
                    />
                 }
                 { index < lastSegmentIndex && finishedSegments[index] && <><br/></> }
             </div>
           ))}
        </div>
    </ScrollArea>
  );
}
