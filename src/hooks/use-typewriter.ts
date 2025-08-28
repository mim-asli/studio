
"use client";

import { useState, useEffect, useCallback } from 'react';

export function useTypewriter(text: string, speed = 20) {
  const [displayText, setDisplayText] = useState('');
  const [isDone, setIsDone] = useState(false);
  const typingIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const clearTimer = () => {
      if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
      }
  }

  useEffect(() => {
    setDisplayText(''); 
    setIsDone(false);
    clearTimer();

    if (text) {
      let i = 0;
      typingIntervalRef.current = setInterval(() => {
        if (i < text.length) {
          setDisplayText(prev => prev + text.charAt(i));
          i++;
        } else {
          clearTimer();
          setIsDone(true);
        }
      }, speed);

      return () => {
        clearTimer();
      };
    } else {
      setIsDone(true);
    }
  }, [text, speed]);

  const skip = useCallback(() => {
    clearTimer();
    setDisplayText(text);
    setIsDone(true);
  }, [text]);

  return { displayText, isDone, skip };
}
