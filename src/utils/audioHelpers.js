import { SPEECH_CONFIG } from '../constants';


export const speakKanaReading = (char) => {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported');
    return;
  }

  // Cancel any ongoing speech
  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(char);
  utterance.lang = SPEECH_CONFIG.JAPANESE.lang;
  utterance.rate = SPEECH_CONFIG.JAPANESE.rate;
  utterance.pitch = SPEECH_CONFIG.JAPANESE.pitch;
  utterance.volume = SPEECH_CONFIG.JAPANESE.volume;

  speechSynthesis.speak(utterance);
};

export const playFeedbackSound = (type, soundMode) => {
  if (soundMode === 'both') {
    try {
      new Audio(`../../assets/sounds/${type}.mp3`).play();
    } catch (error) {
      console.warn('Could not play audio:', error);
    }
  }
};
