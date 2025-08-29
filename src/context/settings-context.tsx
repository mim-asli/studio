
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AppSettings, ApiKey } from '@/lib/types';
import { produce } from 'immer';

const SETTINGS_KEY = 'dastan-settings';

export const defaultSettings: AppSettings = {
  theme: 'dark',
  generateImages: false,
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
};

interface SettingsContextType {
    settings: AppSettings;
    isLoaded: boolean;
    updateSettings: (updater: (draft: AppSettings) => void) => void;
    setApiKeyStatus: (id: string, status: ApiKey['status']) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        const mergedSettings = {
            ...defaultSettings,
            ...parsed,
            huggingFace: {...defaultSettings.huggingFace, ...parsed.huggingFace},
            localLlm: {...defaultSettings.localLlm, ...parsed.localLlm},
        };
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
      } catch (error) {
        console.error("Failed to save settings to localStorage:", error);
      }
    }
  }, [settings, isLoaded]);

  const updateSettings = useCallback((updater: (draft: AppSettings) => void) => {
    setSettings(produce(updater));
  }, []);

  const setApiKeyStatus = useCallback((id: string, status: ApiKey['status']) => {
    updateSettings(draft => {
        const key = draft.geminiApiKeys.find(k => k.id === id);
        if (key) {
            key.status = status;
        }
    });
  }, [updateSettings]);

  const value = {
      settings,
      isLoaded,
      updateSettings,
      setApiKeyStatus,
  }

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettingsContext = (): SettingsContextType => {
    const context = useContext(SettingsContext);
    if(context === undefined) {
        throw new Error('useSettingsContext must be used within a SettingsProvider');
    }
    return context;
}
