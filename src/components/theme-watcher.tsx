
'use client';

import { useEffect } from 'react';
import { useSettingsContext } from '@/context/settings-context';
import { useGameContext } from '@/context/game-context';

/**
 * This component watches for settings and game state changes 
 * and applies global side effects, like changing the theme 
 * or adding body classes for visual effects.
 */
export function ThemeWatcher() {
  const { settings } = useSettingsContext();
  const { gameState } = useGameContext();

  // Watch for theme changes
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Watch for low sanity
  useEffect(() => {
    if (gameState && gameState.playerState?.sanity < 30) {
      document.body.classList.add("sanity-glitch");
    } else {
      document.body.classList.remove("sanity-glitch");
    }
  }, [gameState?.playerState?.sanity]);
  
  // Watch for low health
  useEffect(() => {
    if (gameState && gameState.playerState?.health < 30) {
      document.body.classList.add("low-health-pulse");
    } else {
      document.body.classList.remove("low-health-pulse");
    }
  }, [gameState?.playerState?.health]);


  return null; // This component does not render anything
}
