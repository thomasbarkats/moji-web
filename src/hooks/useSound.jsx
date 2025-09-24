import { useState } from 'react';
import { Speech, Volume2, VolumeX } from 'lucide-react';
import { SOUND_MODES } from '../constants';


export const useSound = () => {
  const [soundMode, setSoundMode] = useState(SOUND_MODES.BOTH);


  const cycleSoundMode = () => {
    switch (soundMode) {
      case SOUND_MODES.BOTH:
        setSoundMode(SOUND_MODES.NONE);
        break;
      case SOUND_MODES.NONE:
        setSoundMode(SOUND_MODES.SPEECH_ONLY);
        break;
      case SOUND_MODES.SPEECH_ONLY:
        setSoundMode(SOUND_MODES.BOTH);
        break;
      default:
        setSoundMode(SOUND_MODES.BOTH);
    }
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
