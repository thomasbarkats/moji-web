import { useState } from 'react';
import { Speech, Volume2, VolumeX } from 'lucide-react';
import { FEEDBACK_TYPES, SOUND_MODES } from '../constants';
import { speakKanaReading, playFeedbackSound } from '../utils';


const STORAGE_KEY = 'kana-app-sound-mode';

export const useSound = () => {
  const getInitialSoundMode = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && Object.values(SOUND_MODES).includes(saved)
      ? saved
      : SOUND_MODES.BOTH;
  };

  const [soundMode, setSoundMode] = useState(getInitialSoundMode);

  const cycleSoundMode = (fromMenu = false) => {
    setSoundMode(prev => {
      let next;
      switch (prev) {
        case SOUND_MODES.BOTH: next = SOUND_MODES.NONE; break;
        case SOUND_MODES.NONE: next = SOUND_MODES.SPEECH_ONLY; break;
        case SOUND_MODES.SPEECH_ONLY: next = SOUND_MODES.BOTH; break;
        default: next = SOUND_MODES.BOTH;
      }
      if (fromMenu) {
        switch (next) {
          case SOUND_MODES.BOTH:
            setTimeout(() => playFeedbackSound(FEEDBACK_TYPES.SUCCESS, SOUND_MODES.BOTH), 100);
            setTimeout(() => speakKanaReading('か'), 300);
            break;
          case SOUND_MODES.SPEECH_ONLY:
            setTimeout(() => speakKanaReading('か'), 100);
            break;
        }
      }
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  };

  const getSoundModeIcon = () => {
    switch (soundMode) {
      case SOUND_MODES.BOTH:
        return { icon: <Volume2 className="w-5 h-5" />, tooltip: 'Speech + Sound effects' };
      case SOUND_MODES.NONE:
        return { icon: <VolumeX className="w-5 h-5" />, tooltip: 'No audio' };
      case SOUND_MODES.SPEECH_ONLY:
        return { icon: <Speech className="w-5 h-5" />, tooltip: 'Speech only' };
      default:
        return { icon: <Volume2 className="w-5 h-5" />, tooltip: 'Speech + Sound effects' };
    }
  };

  return {
    soundMode,
    cycleSoundMode,
    getSoundModeIcon
  };
};
