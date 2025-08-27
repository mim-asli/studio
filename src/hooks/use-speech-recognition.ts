"use client"

import { useState, useEffect, useRef } from 'react';

interface SpeechRecognitionHook {
  transcript: string;
  listening: boolean;
  isUnsupported: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
}

// Add SpeechRecognition types to window
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function useSpeechRecognition(): SpeechRecognitionHook {
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [isUnsupported, setIsUnsupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsUnsupported(true);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Changed to false for better control
    recognition.interimResults = true;
    recognition.lang = 'fa-IR';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscript || interimTranscript);
    };

    recognition.onerror = (event: any) => {
      setError(event.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };
    
    recognitionRef.current = recognition;

    return () => {
      if(recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !listening) {
      setTranscript('');
      setError(null);
      try {
        recognitionRef.current.start();
        setListening(true);
      } catch (e) {
        if (e instanceof Error && e.name === 'InvalidStateError') {
          // This can happen if start() is called while it's already starting.
          // We can safely ignore it.
        } else {
            setError('Speech recognition could not be started.');
            setListening(false);
        }
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  return { transcript, listening, startListening, stopListening, isUnsupported, error };
}
