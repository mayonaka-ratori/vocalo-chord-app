"use client";
import { useCallback, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { drumPatterns } from '@/data/drum-patterns';
import { bassPatterns } from '@/data/bass-patterns';
import { backingPatterns } from '@/data/backing-patterns';

export function usePlayback() {
  const { 
    isPlaying, chords, tempo, drumPatternId, bassPatternId, backingPatternId, 
    setCurrentBar, stop, setAudioInitialized 
  } = useStore();

  const play = useCallback(async () => {
    const { initAudio } = await import('@/lib/audio/engine');
    await initAudio();
    setAudioInitialized(true);

    const { startPlayback, setOnBarChangeCallback } = await import('@/lib/audio/playback-manager');
    
    setOnBarChangeCallback((bar: number) => setCurrentBar(bar));

    startPlayback({
      chords,
      bpm: tempo,
      drumPattern: drumPatterns.find(p => p.id === drumPatternId) || null,
      bassPattern: bassPatterns.find(p => p.id === bassPatternId) || null,
      backingPattern: backingPatterns.find(p => p.id === backingPatternId) || null,
    });
  }, [chords, tempo, drumPatternId, bassPatternId, backingPatternId, setCurrentBar, setAudioInitialized]);

  const stopPlayback = useCallback(async () => {
    const { stopPlayback: stopAudio } = await import('@/lib/audio/playback-manager');
    stopAudio();
    stop();
  }, [stop]);

  // Handle live config updates without restarting the loop
  useEffect(() => {
    if (isPlaying) {
      import('@/lib/audio/playback-manager').then(({ updatePlaybackConfig }) => {
        updatePlaybackConfig({
          chords,
          bpm: tempo,
          drumPattern: drumPatterns.find(p => p.id === drumPatternId) || null,
          bassPattern: bassPatterns.find(p => p.id === bassPatternId) || null,
          backingPattern: backingPatterns.find(p => p.id === backingPatternId) || null,
        });
      });
    }
  }, [isPlaying, chords, tempo, drumPatternId, bassPatternId, backingPatternId]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      import('@/lib/audio/playback-manager').then(({ stopPlayback }) => {
        stopPlayback();
      });
    };
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      stopPlayback();
    } else {
      useStore.setState({ isPlaying: true });
      play();
    }
  }, [isPlaying, play, stopPlayback]);

  return { play, stop: stopPlayback, toggle };
}
