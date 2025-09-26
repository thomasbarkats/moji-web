import { useState } from 'react';
import { KANA_INCLUSION, VOCABULARY_MODES } from '../constants';


const STORAGE_KEY = 'kana-app-preferences';

export const useUserPreferences = () => {
  const defaultPreferences = {
    requiredSuccesses: 3,
    dakutenMode: KANA_INCLUSION.OFF,
    combinationsMode: KANA_INCLUSION.OFF,
    vocabularyMode: VOCABULARY_MODES.FROM_JAPANESE
  };

  const loadPreferences = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return { ...defaultPreferences, ...JSON.parse(saved) };
      } catch (error) {
        console.error('Error loading preferences:', error);
        return defaultPreferences;
      }
    }
    return defaultPreferences;
  };

  const [preferences, setPreferences] = useState(loadPreferences);

  const updatePreferences = (updates) => {
    setPreferences(prev => {
      const newPrefs = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));
      return newPrefs;
    });
  };

  return {
    preferences,
    updatePreferences
  };
};
