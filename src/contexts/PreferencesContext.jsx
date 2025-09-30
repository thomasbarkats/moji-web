import { createContext, useContext, useState, useEffect } from 'react';
import { REQUIRED_SUCCESSES_LIMITS, KANA_INCLUSION, VOCABULARY_MODES } from '../constants';


const PreferencesContext = createContext();

const STORAGE_KEY = 'kana-trainer-preferences';

const DEFAULT_PREFERENCES = {
  requiredSuccesses: 3,
  dakutenMode: KANA_INCLUSION.OFF,
  combinationsMode: KANA_INCLUSION.OFF,
  vocabularyMode: VOCABULARY_MODES.FROM_JAPANESE,
};

export const PreferencesProvider = ({ children }) => {
  const [preferences, setPreferences] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) } : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }, [preferences]);

  const updatePreferences = (updates) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  const handleRequiredSuccessesChange = (e) => {
    const value = Math.max(
      REQUIRED_SUCCESSES_LIMITS.MIN,
      Math.min(REQUIRED_SUCCESSES_LIMITS.MAX, Number(e.target.value) || 1)
    );
    updatePreferences({ requiredSuccesses: value });
  };

  const handleDakutenModeChange = (value) => {
    updatePreferences({ dakutenMode: value });
  };

  const handleCombinationsModeChange = (value) => {
    updatePreferences({ combinationsMode: value });
  };

  const handleVocabularyModeChange = (value) => {
    updatePreferences({ vocabularyMode: value });
  };

  const value = {
    preferences,
    updatePreferences,

    // Individual preferences (shortcuts)
    requiredSuccesses: preferences.requiredSuccesses,
    dakutenMode: preferences.dakutenMode,
    combinationsMode: preferences.combinationsMode,
    vocabularyMode: preferences.vocabularyMode,

    // Handlers
    handleRequiredSuccessesChange,
    handleDakutenModeChange,
    handleCombinationsModeChange,
    handleVocabularyModeChange,
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return context;
};
