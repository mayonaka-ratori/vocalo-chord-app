/**
 * FloatingPlayer – Mobile bottom playback bar with MIDI export button.
 */
"use client";
import React, { useState, useEffect, useCallback } from 'react';

import { useStore } from '@/lib/store';
import { usePlayback } from '@/hooks/use-playback';
import { chordPresets } from '@/data/presets';
import { exportToMidi } from '@/lib/midi/exporter';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/** Mobile-only floating playback bar fixed to the bottom of the screen. */
export const FloatingPlayer = () => {
  const {
    isPlaying, tempo, selectedPresetId, randomize, currentBar, chords,
    key, drumPatternId, bassPatternId
  } = useStore();
  const { toggle, stop } = usePlayback();

  const [toast, setToast] = useState<ToastState | null>(null);

  const presetName = selectedPresetId
    ? chordPresets.find(p => p.id === selectedPresetId)?.name ?? 'カスタム進行'
    : 'カスタム進行';

  // Auto-clear toast after 2 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  /** Triggers MIDI file download from current state. */
  const handleMidiExport = useCallback(() => {
    try {
      const blob = exportToMidi({ chords, tempo, drumPatternId, bassPatternId });
      const url = URL.createObjectURL(blob);

      const safeKey = key.replace('#', 's');
      const filename = `vocalo-chord-${safeKey}-${tempo}bpm.mid`;

      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      anchor.click();

      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setToast({ message: 'MIDIをダウンロードしました！', type: 'success' });
    } catch (err) {
      console.error('MIDI export failed:', err);
      setToast({ message: 'MIDI書き出しに失敗しました', type: 'error' });
    }
  }, [chords, tempo, key, drumPatternId, bassPatternId]);

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

      {/* Progress bar (dots representing current bar) */}
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

      <div className="flex items-center justify-between px-5 pt-3">
        <div className="flex flex-col truncate pr-4 max-w-[45%]">
          <div className="text-sm font-bold text-slate-100 truncate">{presetName}</div>
          <div className="text-xs text-slate-400 font-mono mt-0.5">BPM {tempo}</div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {/* MIDI export button */}
          <button
            id="floating-midi-export"
            onClick={handleMidiExport}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-800 text-green-400 border border-slate-700/80 hover:bg-slate-700 active:scale-95 transition-all outline-none"
            aria-label="MIDI書き出し"
            title="MIDI書き出し"
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
