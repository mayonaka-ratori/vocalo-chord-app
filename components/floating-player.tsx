/**
 * FloatingPlayer – Mobile bottom playback bar with MIDI export button.
 */
"use client";
import React, { useState, useEffect, useCallback } from 'react';

import { useStore } from '@/lib/store';
import { usePlayback } from '@/hooks/use-playback';
import { chordPresets } from '@/data/presets';
import { downloadMidi } from '@/lib/midi/download';

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

/** Mobile-only floating playback bar fixed to the bottom of the screen. */
export const FloatingPlayer = () => {
  const {
    isPlaying, tempo, selectedPresetId, randomize, currentBar, chords,
    key, drumPatternId, bassPatternId, isStructureMode, activeSectionIndex, sections,
    playbackMode, setPlaybackMode, melodyPhrases, activeMelodyPatternId
  } = useStore();
  const { toggle, stop, globalBar } = usePlayback();

  const [toast, setToast] = useState<ToastState | null>(null);

  const presetName = selectedPresetId
    ? chordPresets.find(p => p.id === selectedPresetId)?.name ?? 'カスタム進行'
    : 'カスタム進行';

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
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/80 pb-[max(env(safe-area-inset-bottom),16px)] shadow-[0_-8px_16px_rgba(0,0,0,0.5)]">
      {/* Toast notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`
            mx-4 mt-2 px-4 py-1.5 rounded-lg text-xs font-semibold text-center
            ${toast.type === 'success'
              ? 'bg-green-500/20 text-green-300 border border-green-500/40'
              : 'bg-red-500/20 text-red-300 border border-red-500/40'
            }
          `}
        >
          {toast.type === 'success' ? '✅ ' : '❌ '}{toast.message}
        </div>
      )}

      {/* Progress representation */}
      {isStructureMode && playbackMode === 'song' ? (
        <div className="h-1.5 w-full bg-slate-950/50">
          <div 
            className="h-full bg-gradient-to-r from-pink-500 to-orange-500 transition-all duration-300 ease-linear"
            style={{ width: `${Math.min(100, songProgressPct)}%` }}
          />
        </div>
      ) : (
        <div className="h-1 w-full flex space-x-0.5 bg-slate-950/50 px-0.5 pt-0.5">
          {chords.map((_, idx) => (
            <div
              key={idx}
              className={`flex-1 h-full rounded-full transition-colors duration-100 ${
                currentBar === idx ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between px-4 pt-3">
        <div 
          className={`flex flex-col truncate pr-2 max-w-[45%] ${isStructureMode ? 'cursor-pointer active:scale-95 transition-transform' : ''}`}
          onClick={handleModeToggle}
        >
          <div className="flex items-center gap-1.5 text-sm font-bold text-slate-100 truncate">
            {isStructureMode && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-sm ${playbackMode === 'song' ? 'bg-pink-500/20 text-pink-300' : 'bg-slate-800 text-slate-400'}`}>
                {playbackMode === 'song' ? '通し' : 'セクション'}
              </span>
            )}
            <span className="truncate">{displayLabel}</span>
          </div>
          <div className="text-xs text-slate-400 font-mono mt-0.5 pl-[2px]">BPM {tempo}</div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleMidiExport}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-800 text-green-400 border border-slate-700/80 hover:bg-slate-700 active:scale-95 transition-all outline-none"
            aria-label="MIDI書き出し"
          >
            <span className="text-base leading-none">📥</span>
          </button>

          <button
            onClick={randomize}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-800 text-cyan-400 border border-slate-700/80 hover:bg-slate-700 active:scale-95 transition-all outline-none"
            aria-label="ランダム生成"
          >
            <span className="text-xl leading-none">🎲</span>
          </button>

          <button
            onClick={toggle}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-tr from-pink-500 to-purple-500 text-white shadow-lg active:scale-95 transition-all outline-none"
            aria-label={isPlaying ? '一時停止' : '再生'}
          >
            <span className={`text-xl leading-none ${isPlaying ? 'translate-x-0' : 'translate-x-0.5'}`}>
              {isPlaying ? '⏸' : '▶'}
            </span>
          </button>

          <button
            onClick={stop}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-800 text-slate-300 border border-slate-700/80 hover:bg-slate-700 active:scale-95 transition-all outline-none"
            aria-label="停止"
          >
            <span className="text-xl leading-none">⏹</span>
          </button>
        </div>
      </div>
    </div>
  );
};
