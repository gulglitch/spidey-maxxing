import { useRef, useCallback, useEffect } from 'react';
import { Howl } from 'howler';
import { 
  playThwipSynth, 
  playImpactSynth, 
  playSwingSynth, 
  playPullSynth 
} from '../utils/audioSynthesis';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface SoundConfig {
  volume?: number;
  loop?: boolean;
  rate?: number;
}

interface AudioHook {
  playThwip: () => void;
  playImpact: () => void;
  playSwing: () => void;
  playPull: () => void;
  stopAll: () => void;
  setMasterVolume: (volume: number) => void;
}

/**
 * Custom hook for managing web shooter sound effects
 * Uses Howler.js for file-based sounds with synthesized fallbacks
 */
export const useAudio = (): AudioHook => {
  const sounds = useRef<{ [key: string]: Howl | null }>({});
  const masterVolume = useRef(0.7);
  const useSynthesized = useRef({
    thwip: true,
    impact: true,
    swing: true,
    pull: true
  });

  // Initialize sounds
  useEffect(() => {
    // Try to load sound files, fall back to synthesized if they don't exist
    
    sounds.current.thwip = new Howl({
      src: ['/sounds/thwip.mp3'],
      volume: 0.6 * masterVolume.current,
      rate: 1.2,
      onload: () => {
        useSynthesized.current.thwip = false;
        console.log('✅ Thwip sound loaded');
      },
      onloaderror: () => {
        console.log('🔊 Using synthesized thwip sound');
        useSynthesized.current.thwip = true;
      }
    });

    sounds.current.impact = new Howl({
      src: ['/sounds/impact.mp3'],
      volume: 0.5 * masterVolume.current,
      rate: 1.0,
      onload: () => {
        useSynthesized.current.impact = false;
        console.log('✅ Impact sound loaded');
      },
      onloaderror: () => {
        console.log('🔊 Using synthesized impact sound');
        useSynthesized.current.impact = true;
      }
    });

    sounds.current.swing = new Howl({
      src: ['/sounds/swing.mp3'],
      volume: 0.4 * masterVolume.current,
      loop: true,
      rate: 1.0,
      onload: () => {
        useSynthesized.current.swing = false;
        console.log('✅ Swing sound loaded');
      },
      onloaderror: () => {
        console.log('🔊 Using synthesized swing sound');
        useSynthesized.current.swing = true;
      }
    });

    sounds.current.pull = new Howl({
      src: ['/sounds/pull.mp3'],
      volume: 0.5 * masterVolume.current,
      rate: 1.1,
      onload: () => {
        useSynthesized.current.pull = false;
        console.log('✅ Pull sound loaded');
      },
      onloaderror: () => {
        console.log('🔊 Using synthesized pull sound');
        useSynthesized.current.pull = true;
      }
    });

    // Cleanup
    return () => {
      Object.values(sounds.current).forEach(sound => {
        if (sound) sound.unload();
      });
    };
  }, []);

  const playThwip = useCallback(() => {
    if (useSynthesized.current.thwip) {
      playThwipSynth(0.6 * masterVolume.current);
    } else if (sounds.current.thwip) {
      sounds.current.thwip.play();
    }
  }, []);

  const playImpact = useCallback(() => {
    if (useSynthesized.current.impact) {
      playImpactSynth(0.5 * masterVolume.current);
    } else if (sounds.current.impact) {
      sounds.current.impact.play();
    }
  }, []);

  const playSwing = useCallback(() => {
    if (useSynthesized.current.swing) {
      playSwingSynth(0.4 * masterVolume.current);
    } else if (sounds.current.swing && !sounds.current.swing.playing()) {
      sounds.current.swing.play();
    }
  }, []);

  const playPull = useCallback(() => {
    if (useSynthesized.current.pull) {
      playPullSynth(0.5 * masterVolume.current);
    } else if (sounds.current.pull) {
      sounds.current.pull.play();
    }
  }, []);

  const stopAll = useCallback(() => {
    Object.values(sounds.current).forEach(sound => {
      if (sound) sound.stop();
    });
  }, []);

  const setMasterVolume = useCallback((volume: number) => {
    masterVolume.current = Math.max(0, Math.min(1, volume));
    Object.entries(sounds.current).forEach(([key, sound]) => {
      if (sound) {
        const baseVolume = key === 'thwip' ? 0.6 : key === 'swing' ? 0.4 : 0.5;
        sound.volume(baseVolume * masterVolume.current);
      }
    });
  }, []);

  return {
    playThwip,
    playImpact,
    playSwing,
    playPull,
    stopAll,
    setMasterVolume
  };
};
