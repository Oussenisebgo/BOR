/**
 * Hands-Free Audio & Speech Synthesis Service
 * Provides crisp read-aloud capabilities for kitchen step-by-step cooking.
 */

let currentAudio: HTMLAudioElement | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;

export interface SpeechState {
  isSpeaking: boolean;
  isPaused: boolean;
}

export class SpeechService {
  private static listeners: ((state: SpeechState) => void)[] = [];
  private static currentState: SpeechState = { isSpeaking: false, isPaused: false };

  static subscribe(listener: (state: SpeechState) => void) {
    this.listeners.push(listener);
    listener(this.currentState);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private static notify(state: Partial<SpeechState>) {
    this.currentState = { ...this.currentState, ...state };
    this.listeners.forEach((l) => l(this.currentState));
  }

  /**
   * Reads text aloud. First attempts high-fidelity Gemini TTS via server,
   * with seamless fallback to browser Web Speech API.
   */
  static async readAloud(text: string, onEnd?: () => void) {
    this.stop();

    // Clean text for speech (remove markdown symbols)
    const cleanText = text.replace(/[*_#`~]/g, '').trim();
    if (!cleanText) return;

    this.notify({ isSpeaking: true, isPaused: false });

    // Try server-side Gemini TTS first
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audioBase64) {
          const audioSrc = `data:audio/wav;base64,${data.audioBase64}`;
          currentAudio = new Audio(audioSrc);
          
          currentAudio.onended = () => {
            this.notify({ isSpeaking: false, isPaused: false });
            currentAudio = null;
            if (onEnd) onEnd();
          };

          currentAudio.onerror = () => {
            this.fallbackBrowserSpeech(cleanText, onEnd);
          };

          await currentAudio.play();
          return;
        }
      }
    } catch {
      // Network or TTS error -> fallback directly to browser speech synthesis
    }

    this.fallbackBrowserSpeech(cleanText, onEnd);
  }

  private static fallbackBrowserSpeech(cleanText: string, onEnd?: () => void) {
    if (!('speechSynthesis' in window)) {
      this.notify({ isSpeaking: false, isPaused: false });
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    currentUtterance = utterance;

    // Pick best natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.rate = 0.95; // Slightly measured pace for kitchen instructions
    utterance.pitch = 1.0;

    utterance.onend = () => {
      this.notify({ isSpeaking: false, isPaused: false });
      currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.notify({ isSpeaking: false, isPaused: false });
      currentUtterance = null;
    };

    window.speechSynthesis.speak(utterance);
  }

  static stop() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    currentUtterance = null;
    this.notify({ isSpeaking: false, isPaused: false });
  }

  static pause() {
    if (currentAudio) {
      currentAudio.pause();
    } else if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
    }
    this.notify({ isPaused: true });
  }

  static resume() {
    if (currentAudio) {
      currentAudio.play();
      this.notify({ isPaused: false });
    } else if ('speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      this.notify({ isPaused: false });
    }
  }

  /**
   * Sound effect chime when a cooking timer finishes
   */
  static playTimerChime() {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.3); // D6

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch {
      // AudioContext not allowed or not supported
    }
  }
}
