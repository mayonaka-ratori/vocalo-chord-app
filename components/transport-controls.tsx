/**
 * TransportControls – Desktop playback & MIDI export controls.
 */
"use client";
import React, { useState, useEffect, useCallback } from 'react';

import { useStore } from '@/lib/store';
import { usePlayback } from '@/hooks/use-playback';
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

/** Playback transport and MIDI export bar shown only on desktop (md+). */
export const TransportControls = () => {
  const { isPlaying, randomize, chords, tempo, key, drumPatternId, bassPatternId } = useStore();
  const { toggle, stop } = usePlayback();

  const [toast, setToast] = useState<ToastState | null>(null);

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

      // Sanitize key for filename (e.g. 'F#' -> 'Fs', 'Bb' -> 'Bb')
      const safeKey = key.replace('#', 's');
      const filename = `vocalo-chord-${safeKey}-${tempo}bpm.mid`;

      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      anchor.click();

      // Release object URL after a short delay to ensure download starts
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      setToast({ message: 'MIDIファイルをダウンロードしました！', type: 'success' });
    } catch (err) {
      console.error('MIDI export failed:', err);
      setToast({ message: 'MIDI書き出しに失敗しました', type: 'error' });
    }
  }, [chords, tempo, key, drumPatternId, bassPatternId]);

  return (
    <div className="hidden md:flex flex-col items-center my-8">
      {/* Control bar */}
      <div className="flex justify-center items-center space-x-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800 shadow-inner shadow-black/20 w-full">
        <button
          id="transport-play-pause"
          onClick={toggle}
          className="px-8 py-3 rounded-xl font-bold transition-all bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white shadow-lg shadow-pink-500/25 flex items-center justify-center space-x-2"
        >
          <span>{isPlaying ? '⏸ 一時停止' : '▶ 再生'}</span>
        </button>

        <button
          id="transport-stop"
          onClick={stop}
          className="px-6 py-3 rounded-xl font-bold transition-all bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 flex items-center space-x-2 shadow-sm"
        >
          <span>⏹ 停止</span>
        </button>

        <button
          id="transport-randomize"
          onClick={randomize}
          className="px-6 py-3 rounded-xl font-bold transition-all border border-cyan-500/50 hover:bg-cyan-500/10 text-cyan-400 flex items-center space-x-2"
        >
          <span>🎲 ランダム生成</span>
        </button>

        <button
          id="transport-midi-export"
          onClick={handleMidiExport}
          className="px-6 py-3 rounded-xl font-bold transition-all border border-green-500/50 hover:bg-green-500/10 text-green-400 flex items-center space-x-2 active:scale-95"
        >
          <span>📥 MIDI書き出し</span>
        </button>
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`
            mt-3 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg
            animate-fade-in-down transition-opacity
            ${toast.type === 'success'
              ? 'bg-green-500/20 text-green-300 border border-green-500/40'
              : 'bg-red-500/20 text-red-300 border border-red-500/40'
            }
          `}
        >
          {toast.type === 'success' ? '✅ ' : '❌ '}{toast.message}
        </div>
      )}
    </div>
  );
};
