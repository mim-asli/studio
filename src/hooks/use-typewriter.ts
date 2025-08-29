
"use client";

import { useState, useEffect, useCallback } from 'react';

export function useTypewriter(text: string, speed: number = 30) {
  const [displayText, setDisplayText] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    setDisplayText('');
    setIsDone(false);
    let i = 0;
    
    if (!text) {
        setIsDone(true);
        return;
    };

    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setDisplayText(prev => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(typingInterval);
        setIsDone(true);
      }
    }, speed);

    return () => {
      clearInterval(typingInterval);
    };
  }, [text, speed]);
  
  const skip = useCallback(() => {
      setDisplayText(text);
      setIsDone(true);
  }, [text]);

  return { displayText, isDone, skip };
}
