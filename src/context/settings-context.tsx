
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
    setAndCycleApiKey: (keyToDisableId?: string) => string | undefined;
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
            geminiApiKeys: (parsed.geminiApiKeys || []).map((k: ApiKey) => ({...k, status: k.status === 'valid' ? 'unchecked' : k.status}))
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
  
  const setAndCycleApiKey = useCallback((keyToDisableId?: string): string | undefined => {
    // This function now has two jobs:
    // 1. Mark the specified key (if any) as having a quota issue.
    // 2. Find the *next* valid key to be used for the subsequent attempt.

    // Perform the state update to mark the key as disabled.
    if (keyToDisableId) {
        updateSettings(draft => {
            const keyToUpdate = draft.geminiApiKeys.find(k => k.id === keyToDisableId);
            if (keyToUpdate) {
                keyToUpdate.status = 'quota_exceeded';
            }
        });
    }

    // Return the *current* list of keys, filtered to find the next valid one.
    // This needs to be done on the freshest state.
    // We use a functional update with `setSettings` to get the most recent state.
    let nextKey: ApiKey | undefined;
    setSettings(currentSettings => {
        const availableKeys = currentSettings.geminiApiKeys.filter(
            k => k.enabled && k.status !== 'invalid' && k.status !== 'quota_exceeded'
        );
        nextKey = availableKeys[0];
        return currentSettings; // No change in this update, just for reading latest state.
    });
    
    return nextKey?.value;

  }, [updateSettings]);


  const value = {
      settings,
      isLoaded,
      updateSettings,
      setApiKeyStatus,
      setAndCycleApiKey,
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
