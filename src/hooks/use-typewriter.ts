
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

export function useTypewriter(text: string, speed = 20) {
  const [displayText, setDisplayText] = useState('');
  const isDoneRef = useRef(false);
  
  const animationFrameRef = useRef<number>();
  const lastUpdateTimeRef = useRef<number>(0);
  const textIndexRef = useRef(0);

  const skip = useCallback(() => {
    if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
    }
    setDisplayText(text);
    isDoneRef.current = true;
    textIndexRef.current = text.length;
  }, [text]);

  useEffect(() => {
    setDisplayText('');
    isDoneRef.current = false;
    textIndexRef.current = 0;
    lastUpdateTimeRef.current = 0;
    
    if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (!text) {
        isDoneRef.current = true;
        return;
    }

    const animate = (currentTime: number) => {
      if (!lastUpdateTimeRef.current) {
        lastUpdateTimeRef.current = currentTime;
      }
      
      const deltaTime = currentTime - lastUpdateTimeRef.current;

      if (deltaTime > speed) {
        if (textIndexRef.current < text.length) {
          setDisplayText(prev => prev + text.charAt(textIndexRef.current));
          textIndexRef.current++;
          lastUpdateTimeRef.current = currentTime;
        } else {
          isDoneRef.current = true;
          return;
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [text, speed]);


  return { displayText, isDone: isDoneRef.current, skip };
}
