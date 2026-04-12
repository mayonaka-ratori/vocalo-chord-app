/**
 * FloatingPlayer – Mobile bottom playback bar with MIDI export button.
 */
"use client";
import React, { useState, useEffect, useCallback } from 'react';

import { useStore } from '@/lib/store';
import { usePlayback } from '@/hooks/use-playback';
import { chordPresets } from '@/data/presets';
import { downloadMidi } from '@/lib/midi/download';
import { INSTRUMENT_PRESETS } from '@/types/music';

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

/** Mobile-only floating playback bar fixed to the bottom of the screen. */
export const FloatingPlayer = () => {
  const {
    isPlaying, tempo, selectedPresetId, randomize, currentBar, chords,
    key, drumPatternId, bassPatternId, isStructureMode, activeSectionIndex, sections,
    playbackMode, setPlaybackMode, melodyPhrases, activeMelodyPatternId, activeInstrumentId
  } = useStore();
  const { toggle, stop, globalBar } = usePlayback();

  const [toast, setToast] = useState<ToastState | null>(null);

  const presetName = selectedPresetId
    ? chordPresets.find(p => p.id === selectedPresetId)?.name ?? 'カスタム進行'
    : 'カスタム進行';

  const activeInstrument = INSTRUMENT_PRESETS.find(p => p.id === activeInstrumentId);

  const displayLabel = isStructureMode && sections[activeSectionIndex]
    ? `${sections[activeSectionIndex].label}`
    : presetName;

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleMidiExport = useCallback(() => {
    const activeMelody = melodyPhrases.find(p => p.patternId === activeMelodyPatternId);
    const melodyNotes = activeMelody?.notes;

    downloadMidi(
      isStructureMode && playbackMode === 'song'
        ? { mode: 'song', sections, tempo, melodyNotes }
        : { mode: 'section', chords, tempo, drumPatternId, bassPatternId, melodyNotes },
      key,
      setToast
    );
  }, [chords, tempo, key, drumPatternId, bassPatternId, isStructureMode, playbackMode, sections, melodyPhrases, activeMelodyPatternId]);

  const handleModeToggle = () => {
    if (isStructureMode) {
      setPlaybackMode(playbackMode === 'section' ? 'song' : 'section');
    }
  };

  // Calculate song mode progress
  const totalBarsInSong = isStructureMode ? sections.reduce((acc, sec) => acc + (sec.bars * sec.repeat), 0) : 0;
  const songProgressPct = totalBarsInSong > 0 ? (globalBar / totalBarsInSong) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-voca-bg-card/95 backdrop-blur-xl border-t border-voca-border-subtle pb-[max(env(safe-area-inset-bottom),16px)] shadow-[0_-12px_24px_rgba(0,0,0,0.6)]">
      {/* Toast notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`
            mx-4 mt-3 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider text-center border-2
            ${toast.type === 'success'
              ? 'bg-voca-bg-card text-voca-semantic-success border-voca-semantic-success shadow-glow-cyan/10'
              : 'bg-voca-bg-card text-voca-semantic-error border-voca-semantic-error shadow-glow-magenta/10'
            }
          `}
        >
          {toast.type === 'success' ? '✓ ' : '✕ '}{toast.message}
        </div>
      )}

      {/* Progress representation */}
      {isStructureMode && playbackMode === 'song' ? (
        <div className="h-1.5 w-full bg-voca-bg-elevated/50">
          <div 
            className="h-full bg-gradient-hero transition-all duration-300 ease-linear shadow-glow-cyan"
            style={{ width: `${Math.min(100, songProgressPct)}%` }}
          />
        </div>
      ) : (
        <div className="h-1 w-full flex space-x-0.5 bg-voca-bg-elevated/50 px-0.5 pt-0.5">
          {chords.map((_, idx) => (
            <div
              key={idx}
              className={`flex-1 h-full rounded-full transition-all duration-200 ${
                currentBar === idx ? 'bg-voca-accent-cyan shadow-glow-cyan' : 'bg-voca-bg-section/50'
              }`}
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between px-4 pt-4">
        <button
          type="button"
          onClick={handleModeToggle}
          disabled={!isStructureMode}
          aria-label={isStructureMode ? `再生モード切替（現在: ${playbackMode === 'song' ? 'ソング' : 'セクション'}）` : undefined}
          className={`flex flex-col truncate pr-2 max-w-[45%] text-left ${isStructureMode ? 'cursor-pointer active:scale-95 transition-transform' : 'cursor-default'}`}
        >
          <div className="flex items-center gap-1.5 text-sm font-black text-voca-text truncate uppercase tracking-tight">
            {isStructureMode && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded-sm font-black tracking-widest ${playbackMode === 'song' ? 'bg-voca-accent-magenta/20 text-voca-accent-magenta' : 'bg-voca-bg-elevated text-voca-text-muted border border-voca-border-subtle'}`}>
                {playbackMode === 'song' ? 'SONG' : 'SEC'}
              </span>
            )}
            <span className="truncate">{displayLabel}</span>
          </div>
          <div className="text-[10px] text-voca-text-muted font-black mt-1 pl-[1px] tracking-widest uppercase opacity-70 truncate">
            BPM {tempo} • {key} {activeInstrument && ` • ${activeInstrument.icon} ${activeInstrument.labelJa}`}
          </div>
        </button>

        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={handleMidiExport}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-voca-bg-elevated text-voca-semantic-success border border-voca-border-subtle hover:bg-voca-bg-section active:scale-90 transition-all outline-none shadow-sm"
            aria-label="MIDI書き出し"
          >
            <span className="text-base leading-none">📥</span>
          </button>

          <button
            onClick={randomize}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-voca-bg-elevated text-voca-accent-cyan border border-voca-border-subtle hover:bg-voca-bg-section active:scale-90 transition-all outline-none shadow-sm"
            aria-label="ランダム生成"
          >
            <span className="text-xl leading-none">🎲</span>
          </button>

          <button
            onClick={toggle}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-hero text-white shadow-glow-cyan active:scale-90 transition-all outline-none border border-white/20"
            aria-label={isPlaying ? '一時停止' : '再生'}
          >
            <span className={`text-2xl leading-none ${isPlaying ? 'translate-x-0' : 'translate-x-0.5'}`}>
              {isPlaying ? '⏸' : '▶'}
            </span>
          </button>

          <button
            onClick={stop}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-voca-bg-elevated text-voca-text-sub border border-voca-border-subtle hover:bg-voca-bg-section active:scale-90 transition-all outline-none shadow-sm"
            aria-label="停止"
          >
            <span className="text-xl leading-none">⏹</span>
          </button>
        </div>
      </div>
    </div>
  );
};
