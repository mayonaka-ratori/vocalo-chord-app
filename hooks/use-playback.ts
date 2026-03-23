"use client";
import { useCallback, useEffect, useState } from 'react';
import { useStore } from '@/lib/store';

export function usePlayback() {
  const { 
    isPlaying, chords, tempo, drumPatternId, bassPatternId, backingPatternId, instrumentPresetId,
    setCurrentBar, stop, setAudioInitialized, playbackMode, sections, isStructureMode, setActiveSection
  } = useStore();

  const [globalBar, setGlobalBar] = useState(0);

  const play = useCallback(async () => {
    const { initAudio } = await import('@/lib/audio/engine');
    await initAudio();
    setAudioInitialized(true);

    const { startPlayback, setPlaybackCallbacks } = await import('@/lib/audio/playback-manager');
    
    setPlaybackCallbacks(
      // onBarChange
      (globalBarNum: number, localBar: number) => {
        setGlobalBar(globalBarNum);
        setCurrentBar(localBar);
      },
      // onSectionChange
      (sectionIndex: number) => {
        if (isStructureMode && sectionIndex >= 0) {
          setActiveSection(sectionIndex);
        }
      },
      // onPlaybackComplete
      () => {
        useStore.setState({ isPlaying: false });
      }
    );

    startPlayback({
      mode: isStructureMode ? playbackMode : 'section',
      bpm: tempo,
      chords,
      drumPatternId,
      bassPatternId,
      backingPatternId,
      instrumentPresetId,
      sections: isStructureMode ? sections : undefined,
      startSectionIndex: 0
    });
  }, [
    chords, tempo, drumPatternId, bassPatternId, backingPatternId, instrumentPresetId, 
    setCurrentBar, setAudioInitialized, playbackMode, sections, isStructureMode, setActiveSection
  ]);

  const stopPlayback = useCallback(async () => {
    const { stopPlayback: stopAudio } = await import('@/lib/audio/playback-manager');
    stopAudio();
    stop();
    setGlobalBar(0);
  }, [stop]);

  // Handle live config updates without restarting the loop
  useEffect(() => {
    if (isPlaying) {
      import('@/lib/audio/playback-manager').then(({ updatePlaybackConfig }) => {
        updatePlaybackConfig({
          mode: isStructureMode ? playbackMode : 'section',
          bpm: tempo,
          chords,
          drumPatternId,
          bassPatternId,
          backingPatternId,
          instrumentPresetId,
          sections: isStructureMode ? sections : undefined
        });
      });
    }
  }, [isPlaying, chords, tempo, drumPatternId, bassPatternId, backingPatternId, instrumentPresetId, playbackMode, isStructureMode, sections]);

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

  return { play, stop: stopPlayback, toggle, globalBar };
}
