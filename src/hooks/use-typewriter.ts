
"use client";

import { useState, useEffect } from 'react';

export function useTypewriter(text: string, speed = 20) {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    setDisplayText(''); 
    if (text) {
      let i = 0;
      const typingInterval = setInterval(() => {
        if (i < text.length) {
          setDisplayText(prev => prev + text.charAt(i));
          i++;
        } else {
          clearInterval(typingInterval);
        }
      }, speed);

      return () => {
        clearInterval(typingInterval);
      };
    }
  }, [text, speed]);

  return displayText;
}
