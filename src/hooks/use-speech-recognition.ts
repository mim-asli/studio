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
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'fa-IR';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(prev => prev + finalTranscript);
    };

    recognition.onerror = (event: any) => {
      setError(event.error);
      setListening(false);
    };

    recognition.onend = () => {
      if (listening) {
        // In continuous mode, it can sometimes stop. Restart it if we are still meant to be listening.
        recognition.start();
      } else {
        setListening(false);
      }
    };
    
    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [listening]);

  const startListening = () => {
    if (recognitionRef.current && !listening) {
      setTranscript('');
      setError(null);
      try {
        recognitionRef.current.start();
        setListening(true);
      } catch (e) {
        setError('Speech recognition could not be started.');
        setListening(false);
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
