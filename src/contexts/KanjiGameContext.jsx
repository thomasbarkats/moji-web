import { createContext, useContext, useState } from 'react';
import { KANJI_STEPS } from '../constants';


const KanjiGameContext = createContext();

export const KanjiGameProvider = ({ children }) => {
  // Step management for multi-step kanji validation
  const [currentStep, setCurrentStep] = useState(KANJI_STEPS.KUN_READINGS);
  const [stepData, setStepData] = useState({
    kunReadings: [],
    onReadings: []
  });

  // Kanji-specific selections
  const [selectedLists, setSelectedLists] = useState([]);
  const [currentKanjiList, setCurrentKanjiList] = useState([]);


  // Reset steps when moving to a new kanji
  const resetSteps = () => {
    setCurrentStep(KANJI_STEPS.KUN_READINGS);
    setStepData({ kunReadings: [], onReadings: [] });
  };

  // Proceed to next step and store validated answer
  const proceedToNextStep = (validatedAnswer, currentKanji) => {
    if (currentStep === KANJI_STEPS.KUN_READINGS) {
      // Store kun readings with null preservation for alignment
      const kunReadings = currentKanji.readings.map(r => r.kun || null);
      setStepData(prev => ({ ...prev, kunReadings }));
      setCurrentStep(KANJI_STEPS.ON_READINGS);
    } else if (currentStep === KANJI_STEPS.ON_READINGS) {
      // Store on readings with null preservation for alignment
      const onReadings = currentKanji.readings.map(r => r.on || null);
      setStepData(prev => ({ ...prev, onReadings }));
      setCurrentStep(KANJI_STEPS.MEANINGS);
    }
  };

  const value = {
    // Step state
    currentStep,
    setCurrentStep,
    stepData,
    setStepData,

    // Kanji selection
    selectedLists,
    setSelectedLists,
    currentKanjiList,
    setCurrentKanjiList,

    // Step actions
    resetSteps,
    proceedToNextStep,
  };

  return (
    <KanjiGameContext.Provider value={value}>
      {children}
    </KanjiGameContext.Provider>
  );
};

export const useKanjiGameContext = () => {
  const context = useContext(KanjiGameContext);
  if (!context) {
    throw new Error('useKanjiGameContext must be used within KanjiGameProvider');
  }
  return context;
};
