"use client";

import { useState, useEffect, useCallback } from 'react';
import type { AppSettings, ApiKey, HuggingFaceSettings, LocalLlmSettings, AudioSettings } from '@/lib/types';
import { produce } from 'immer';

const SETTINGS_KEY = 'dastan-settings';

export const defaultSettings: AppSettings = {
  theme: 'dark',
  geminiApiKeys: [],
  huggingFace: {
    enabled: false,
    apiKey: '',
    modelId: 'mistralai/Mistral-7B-Instruct-v0.2',
    prioritize: false,
  },
  localLlm: {
    enabled: false,
    endpoint: 'http://127.0.0.1:11434',
    prioritize: false,
  },
  audio: {
    master: 80,
    music: 60,
    ambient: 70,
    sfx: 90,
  },
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        // Deep merge to ensure new default fields are applied
        const parsed = JSON.parse(storedSettings);
        const mergedSettings = {
            ...defaultSettings,
            ...parsed,
            huggingFace: {...defaultSettings.huggingFace, ...parsed.huggingFace},
            localLlm: {...defaultSettings.localLlm, ...parsed.localLlm},
            audio: {...defaultSettings.audio, ...parsed.audio},
        }
        setSettings(mergedSettings);
      } else {
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage:", error);
      setSettings(defaultSettings);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        // Apply theme class to HTML element
        if (settings.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (error) {
        console.error("Failed to save settings to localStorage:", error);
      }
    }
  }, [settings, isLoaded]);

  const updateSettings = useCallback((updater: (draft: AppSettings) => void) => {
    setSettings(produce(updater));
  }, []);

  // Specific updaters for convenience
  const setTheme = useCallback((theme: 'dark' | 'light') => {
    updateSettings(draft => { draft.theme = theme; });
  }, [updateSettings]);

  const addGeminiApiKey = useCallback((key: Omit<ApiKey, 'id' | 'status'>) => {
    updateSettings(draft => {
      draft.geminiApiKeys.push({ ...key, id: crypto.randomUUID(), status: 'unchecked' });
    });
  }, [updateSettings]);

  const updateGeminiApiKey = useCallback((id: string, updater: (draft: ApiKey) => void) => {
    updateSettings(draft => {
      const key = draft.geminiApiKeys.find(k => k.id === id);
      if (key) updater(key);
    });
  }, [updateSettings]);

  const removeGeminiApiKey = useCallback((id: string) => {
    updateSettings(draft => {
      draft.geminiApiKeys = draft.geminiApiKeys.filter(k => k.id !== id);
    });
  }, [updateSettings]);

  const setHuggingFaceSettings = useCallback((hfSettings: HuggingFaceSettings) => {
    updateSettings(draft => { draft.huggingFace = hfSettings; });
  }, [updateSettings]);

  const setLocalLlmSettings = useCallback((llmSettings: LocalLlmSettings) => {
    updateSettings(draft => { draft.localLlm = llmSettings; });
  }, [updateSettings]);

  const setAudioSettings = useCallback((audioSettings: AudioSettings) => {
     updateSettings(draft => { draft.audio = audioSettings; });
  }, [updateSettings]);

  const setApiKeyStatus = useCallback((id: string, status: ApiKey['status']) => {
    updateGeminiApiKey(id, draft => {
        draft.status = status;
    });
  }, [updateGeminiApiKey]);


  return {
    settings,
    isLoaded,
    updateSettings,
    setTheme,
    addGeminiApiKey,
    updateGeminiApiKey,
    removeGeminiApiKey,
    setHuggingFaceSettings,
    setLocalLlmSettings,
    setAudioSettings,
    setApiKeyStatus,
  };
}
