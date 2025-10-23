import { createContext, useContext, useState } from 'react';
import { usePreferences } from './PreferencesContext';
import { useDataKanji } from '../hooks';
import { KANJI_STEPS } from '../constants';
import {
  getFirstStepForKanji,
  getNextStepForKanji,
  getReadingGroupsForDisplay,
} from '../utils';


const GameContextKanji = createContext();

export const KanjiGameProvider = ({ children }) => {
  const { kanjiLists, loading: kanjiLoading } = useDataKanji();
  const { kanjiMode } = usePreferences();

  // Step management for multi-step kanji validation
  const [currentStep, setCurrentStep] = useState(KANJI_STEPS.KUN_READINGS);
  const [stepData, setStepData] = useState({
    kunReadings: [],
    onReadings: []
  });

  // Kanji-specific selections
  const [kanjiSelectedLists, setKanjiSelectedLists] = useState([]);
  const [currentKanjiList, setCurrentKanjiList] = useState([]);


  // Reset steps when moving to a new kanji
  const resetSteps = (currentKanji = null) => {
    if (!currentKanji) {
      setCurrentStep(KANJI_STEPS.KUN_READINGS);
      setStepData({ readingGroups: [] });
      return;
    }

    const firstStep = getFirstStepForKanji(currentKanji.readings, kanjiMode);

    if (firstStep === KANJI_STEPS.MEANINGS) {
      const readingGroups = getReadingGroupsForDisplay(currentKanji.readings);
      setStepData({ readingGroups });
    } else {
      setStepData({ readingGroups: [] });
    }

    setCurrentStep(firstStep);
  };

  const proceedToNextStep = (currentKanji) => {
    const nextStep = getNextStepForKanji(currentStep, currentKanji.readings, kanjiMode);

    // Store complete reading groups ONLY when transitioning to meanings step
    if (nextStep === KANJI_STEPS.MEANINGS) {
      const readingGroups = getReadingGroupsForDisplay(currentKanji.readings);
      setStepData({ readingGroups });
    }

    setCurrentStep(nextStep);
  };

  const value = {
    // Data
    kanjiLists,
    kanjiLoading,

    // Step state
    currentStep,
    setCurrentStep,
    stepData,
    setStepData,

    // Kanji selection
    kanjiSelectedLists,
    setKanjiSelectedLists,
    currentKanjiList,
    setCurrentKanjiList,

    // Step actions
    resetSteps,
    proceedToNextStep,
  };

  return (
    <GameContextKanji.Provider value={value}>
      {children}
    </GameContextKanji.Provider>
  );
};

export const useGameContextKanji = () => {
  const context = useContext(GameContextKanji);
  if (!context) {
    throw new Error('useGameContextKanji must be used within KanjiGameProvider');
  }
  return context;
};
