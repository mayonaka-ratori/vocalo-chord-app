/**
 * TransportControls – Desktop playback & MIDI export controls.
 */
"use client";
import React, { useState, useEffect, useCallback } from 'react';

import { useStore } from '@/lib/store';
import { usePlayback } from '@/hooks/use-playback';
import { downloadMidi } from '@/lib/midi/download';
import { INSTRUMENT_PRESETS } from '@/types/music';

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

export function TransportControls() {
  const { 
    isPlaying, tempo, randomize, currentBar, chords, drumPatternId, bassPatternId, 
    key, isStructureMode, playbackMode, setPlaybackMode, sections, activeSectionIndex,
    melodyPhrases, activeMelodyPatternId, activeInstrumentId,
    isMelodyEnabled, toggleMelody
  } = useStore();
  const { toggle, stop } = usePlayback();

  const [toast, setToast] = useState<ToastState | null>(null);

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

  const activeInstrument = INSTRUMENT_PRESETS.find(p => p.id === activeInstrumentId) ?? null;

  return (
    <div className="hidden md:flex flex-col items-center my-8">
      {/* Control bar */}
      <div className="flex justify-between items-center bg-voca-bg-card/95 backdrop-blur-md p-6 rounded-2xl border border-voca-border-subtle shadow-2xl w-full min-w-[700px]">
        
        {/* Left: Randomize */}
        <div className="flex-1 flex justify-start">
          <button
            onClick={randomize}
            className="px-6 py-3 rounded-xl font-bold transition-all border border-voca-accent-cyan/50 hover:bg-voca-accent-cyan/10 text-voca-accent-cyan flex items-center space-x-2 active:scale-95"
          >
            <span>🎲 ランダム生成</span>
          </button>
        </div>

        {/* Center: Play/Stop & Timeline & Mode */}
        <div className="flex-[2] flex flex-col items-center">
          {isStructureMode && (
            <div className="flex bg-voca-bg-elevated rounded-full p-1 border border-voca-border-subtle mb-4 scale-90">
              <button 
                onClick={() => setPlaybackMode('section')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${playbackMode === 'section' ? 'bg-voca-bg-card text-voca-accent-cyan border border-voca-accent-cyan/30 shadow-sm' : 'text-voca-text-muted hover:text-voca-text-sub'}`}
              >
                🔁 セクション
              </button>
              <button 
                onClick={() => setPlaybackMode('song')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${playbackMode === 'song' ? 'bg-gradient-hero text-white shadow-glow-purple border border-white/20' : 'text-voca-text-muted hover:text-voca-text-sub'}`}
              >
                ▶️ 通し再生
              </button>
            </div>
          )}

          {activeInstrument && (
            <div className="text-[11px] text-voca-text-muted font-black mb-3">
              {activeInstrument.labelJa}
            </div>
          )}

          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={stop}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-voca-bg-elevated text-voca-text-sub hover:text-voca-text hover:bg-voca-bg-section active:scale-95 transition-all outline-none border border-voca-border-subtle"
              aria-label="停止"
              title="停止 (先頭に戻る)"
            >
              <span className="text-xl">⏹</span>
            </button>
            
            <button
              onClick={toggle}
              className={`w-16 h-16 flex items-center justify-center rounded-full text-white shadow-lg active:scale-95 transition-all outline-none border border-white/20 ${
                isPlaying 
                  ? 'bg-gradient-hero shadow-glow-cyan' 
                  : 'bg-gradient-hero hover:scale-105 shadow-glow-purple'
              }`}
              aria-label={isPlaying ? '一時停止' : '再生'}
            >
              <span className={`text-3xl ${isPlaying ? 'translate-x-0' : 'translate-x-1'}`}>
                {isPlaying ? '⏸' : '▶'}
              </span>
            </button>
          </div>
          
          {isStructureMode && playbackMode === 'song' && isPlaying ? (
            <div className="text-[10px] text-voca-accent-magenta font-black bg-voca-accent-magenta/10 px-4 py-1.5 rounded-full animate-pulse border border-voca-accent-magenta/30 uppercase tracking-widest">
              Live: Section {activeSectionIndex + 1}/{sections.length} — {sections[activeSectionIndex]?.label}
            </div>
          ) : (
            <div className="flex w-full max-w-[240px] h-1.5 bg-voca-bg-elevated rounded-full overflow-hidden border border-voca-border-subtle/50">
              {chords.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`flex-1 transition-all duration-100 ${
                    currentBar === idx 
                      ? 'bg-voca-accent-cyan shadow-glow-cyan' 
                      : 'bg-transparent'
                  }`} 
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Export + Melody toggle */}
        <div className="flex-1 flex flex-col gap-2 items-end">
          <button
            onClick={handleMidiExport}
            className="px-6 py-3 rounded-xl font-bold transition-all border border-voca-semantic-success/50 hover:bg-voca-semantic-success/10 text-voca-semantic-success flex items-center space-x-2 active:scale-95 shadow-sm"
          >
            <span>📥 MIDI書き出し</span>
          </button>
          <button
            onClick={() => toggleMelody()}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-xs font-bold tracking-wider transition-all duration-300 ${
              isMelodyEnabled
                ? 'border-voca-accent-cyan text-voca-accent-cyan bg-voca-accent-cyan/10 shadow-glow-cyan'
                : 'border-voca-border-subtle text-voca-text-muted hover:border-voca-accent-cyan/50'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isMelodyEnabled ? 'bg-voca-accent-cyan animate-pulse' : 'bg-voca-text-muted'}`} />
            🎵 MELODY {isMelodyEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

      </div>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`
            mt-4 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider shadow-2xl
            animate-fade-in-down transition-opacity border-2
            ${toast.type === 'success'
              ? 'bg-voca-bg-card text-voca-semantic-success border-voca-semantic-success shadow-voca-semantic-success/20'
              : 'bg-voca-bg-card text-voca-semantic-error border-voca-semantic-error shadow-voca-semantic-error/20'
            }
          `}
        >
          {toast.type === 'success' ? '✓ ' : '✕ '}{toast.message}
        </div>
      )}
    </div>
  );
}
