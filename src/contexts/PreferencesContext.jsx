import { createContext, useContext, useState, useEffect } from 'react';
import { useTheme, useSound } from '../hooks';
import {
  REQUIRED_SUCCESSES_LIMITS,
  KANA_INCLUSION,
  VOCABULARY_MODES,
  KANJI_MODES,
  LANGUAGES,
  APP_MODES,
} from '../constants';


const PreferencesContext = createContext();

const STORAGE_KEY = 'preferences';

const DEFAULT_PREFERENCES = {
  defaultAppMode: APP_MODES.KANA,
  requiredSuccesses: 3,
  dakutenMode: KANA_INCLUSION.OFF,
  combinationsMode: KANA_INCLUSION.OFF,
  vocabularyMode: VOCABULARY_MODES.FROM_JAPANESE,
  kanjiMode: KANJI_MODES.ALL,
  language: LANGUAGES.EN,
};

export const PreferencesProvider = ({ children }) => {
  const { theme, darkMode, toggleDarkMode } = useTheme();
  const { soundMode, cycleSoundMode, getSoundModeIcon, setSoundModeValue } = useSound();

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

  const handleKanjiModeChange = (value) => {
    updatePreferences({ kanjiMode: value });
  };

  const handleLanguageChange = (value) => {
    updatePreferences({ language: value });
  };

  const value = {
    preferences,
    theme,
    darkMode,
    soundMode,

    // Individual preferences (shortcuts)
    defaultAppMode: preferences.defaultAppMode,
    requiredSuccesses: preferences.requiredSuccesses,
    dakutenMode: preferences.dakutenMode,
    combinationsMode: preferences.combinationsMode,
    vocabularyMode: preferences.vocabularyMode,
    kanjiMode: preferences.kanjiMode,
    language: preferences.language,

    // Handlers
    updatePreferences,
    handleRequiredSuccessesChange,
    handleDakutenModeChange,
    handleCombinationsModeChange,
    handleVocabularyModeChange,
    handleKanjiModeChange,
    handleLanguageChange,
    toggleDarkMode,
    cycleSoundMode,
    setSoundModeValue,
    getSoundModeIcon,
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
