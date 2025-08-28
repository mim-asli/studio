
"use client";

import { useEffect, useRef } from 'react';
import type { GameState } from '@/lib/types';
import { useSettings } from '@/hooks/use-settings';

interface AudioManagerProps {
  gameState: GameState;
}

const audioSources = {
  music: {
    calm: "https://storage.googleapis.com/stet-media/generative-ai/examples/dastan/music/calm.mp3",
    combat: "https://storage.googleapis.com/stet-media/generative-ai/examples/dastan/music/combat.mp3",
    mystery: "https://storage.googleapis.com/stet-media/generative-ai/examples/dastan/music/mystery.mp3",
  },
  ambient: {
    forest: "https://storage.googleapis.com/stet-media/generative-ai/examples/dastan/ambient/forest.mp3",
    city: "https://storage.googleapis.com/stet-media/generative-ai/examples/dastan/ambient/city.mp3",
    cave: "https://storage.googleapis.com/stet-media/generative-ai/examples/dastan/ambient/cave.mp3",
    rain: "https://storage.googleapis.com/stet-media/generative-ai/examples/dastan/ambient/rain.mp3",
  },
  sfx: {
    click: "https://storage.googleapis.com/stet-media/generative-ai/examples/dastan/sfx/click.mp3",
  }
};

const FADE_DURATION = 2000; // 2 seconds

export function AudioManager({ gameState }: AudioManagerProps) {
  const { settings } = useSettings();

  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio elements on component mount
    if (!musicAudioRef.current) {
        musicAudioRef.current = new Audio();
        musicAudioRef.current.loop = true;
    }
    if (!ambientAudioRef.current) {
        ambientAudioRef.current = new Audio();
        ambientAudioRef.current.loop = true;
    }

    const handleInteraction = () => {
        musicAudioRef.current?.play().catch(e => console.error("Music play failed:", e));
        ambientAudioRef.current?.play().catch(e => console.error("Ambient play failed:", e));
        document.removeEventListener('click', handleInteraction);
    }
    document.addEventListener('click', handleInteraction);

    return () => {
        document.removeEventListener('click', handleInteraction);
        musicAudioRef.current?.pause();
        ambientAudioRef.current?.pause();
    };
  }, []);

  const fadeAudio = (audio: HTMLAudioElement, targetVolume: number) => {
    const initialVolume = audio.volume;
    let startTime: number | null = null;
    
    const animateFade = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const fraction = Math.min(progress / FADE_DURATION, 1);
      
      audio.volume = initialVolume + (targetVolume - initialVolume) * fraction;

      if (progress < FADE_DURATION) {
        requestAnimationFrame(animateFade);
      } else {
        if (targetVolume === 0) {
            audio.pause();
        }
      }
    };
    requestAnimationFrame(animateFade);
  };
  
  const switchAudioSource = (audioRef: React.MutableRefObject<HTMLAudioElement | null>, newSrc: string, targetVolume: number) => {
     const audio = audioRef.current;
    if (!audio) return;

    if (audio.src !== newSrc) {
        fadeAudio(audio, 0);
        setTimeout(() => {
            audio.src = newSrc;
            audio.volume = 0; // Start at 0 before playing
            audio.play().catch(e => console.error("Audio play failed:", e));
            setTimeout(() => fadeAudio(audio, targetVolume), 50); // Short delay before fading in
        }, FADE_DURATION);
    } else {
        fadeAudio(audio, targetVolume);
    }
  }

  // --- Music Logic ---
  useEffect(() => {
    const musicVolume = (settings.audio.master / 100) * (settings.audio.music / 100);
    let musicSrc = audioSources.music.calm;

    if (gameState.isCombat) {
      musicSrc = audioSources.music.combat;
    } else if (gameState.currentLocation.toLowerCase().includes('راز') || gameState.currentLocation.toLowerCase().includes('معما')) {
      musicSrc = audioSources.music.mystery;
    }
    
    switchAudioSource(musicAudioRef, musicSrc, musicVolume);

  }, [gameState.isCombat, gameState.currentLocation, settings.audio.master, settings.audio.music]);


  // --- Ambient Sound Logic ---
  useEffect(() => {
    const ambientVolume = (settings.audio.master / 100) * (settings.audio.ambient / 100);
    let ambientSrc = "";

    const locationLower = gameState.currentLocation.toLowerCase();
    const weatherLower = gameState.worldState.weather?.toLowerCase() || "";

    if (weatherLower.includes('باران')) {
      ambientSrc = audioSources.ambient.rain;
    } else if (locationLower.includes('جنگل')) {
      ambientSrc = audioSources.ambient.forest;
    } else if (locationLower.includes('شهر') || locationLower.includes('بازار')) {
      ambientSrc = audioSources.ambient.city;
    } else if (locationLower.includes('غار') || locationLower.includes('زیرزمین')) {
      ambientSrc = audioSources.ambient.cave;
    }
    
    if (ambientSrc) {
        switchAudioSource(ambientAudioRef, ambientSrc, ambientVolume);
    } else if (ambientAudioRef.current?.src) {
         fadeAudio(ambientAudioRef.current, 0);
    }

  }, [gameState.currentLocation, gameState.worldState.weather, settings.audio.master, settings.audio.ambient]);

  return null; // This component does not render anything
}

    