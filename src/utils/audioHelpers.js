import { SOUND_MODES, SPEECH_CONFIG } from '../constants';

export const speakKanaReading = (char, rate, onComplete) => {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported');
    if (onComplete) onComplete();
    return;
  }

  speechSynthesis.cancel(); // cancel any ongoing speech

  const utterance = new SpeechSynthesisUtterance(char);
  utterance.lang = SPEECH_CONFIG.JAPANESE.lang;
  utterance.rate = rate || SPEECH_CONFIG.JAPANESE.rate;
  utterance.pitch = SPEECH_CONFIG.JAPANESE.pitch;
  utterance.volume = SPEECH_CONFIG.JAPANESE.volume;

  if (onComplete) {
    utterance.onend = onComplete;
    utterance.onerror = onComplete;
  }

  speechSynthesis.speak(utterance);
};

export const playFeedbackSound = (type, soundMode) => {
  if (soundMode === SOUND_MODES.BOTH) {
    try {
      new Audio(`/sounds/${type}.mp3`).play();
    } catch (error) {
      console.warn('Could not play audio:', error);
    }
  }
};
