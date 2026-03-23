/**
 * TransportControls – Desktop playback & MIDI export controls.
 */
"use client";
import React, { useState, useEffect, useCallback } from 'react';

import { useStore } from '@/lib/store';
import { usePlayback } from '@/hooks/use-playback';
import { downloadMidi } from '@/lib/midi/download';

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

export function TransportControls() {
  const { 
    isPlaying, tempo, randomize, currentBar, chords, drumPatternId, bassPatternId, 
    key, isStructureMode, playbackMode, setPlaybackMode, sections, activeSectionIndex,
    melodyPhrases, activeMelodyPatternId
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

  return (
    <div className="hidden md:flex flex-col items-center my-8">
      {/* Control bar */}
      <div className="flex justify-between items-center bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-inner shadow-black/20 w-full min-w-[700px]">
        
        {/* Left: Randomize */}
        <div className="flex-1 flex justify-start">
          <button
            onClick={randomize}
            className="px-6 py-3 rounded-xl font-bold transition-all border border-cyan-500/50 hover:bg-cyan-500/10 text-cyan-400 flex items-center space-x-2"
          >
            <span>🎲 ランダム生成</span>
          </button>
        </div>

        {/* Center: Play/Stop & Timeline & Mode */}
        <div className="flex-[2] flex flex-col items-center">
          {isStructureMode && (
            <div className="flex bg-slate-900 rounded-full p-1 border border-slate-700 mb-4 scale-90">
              <button 
                onClick={() => setPlaybackMode('section')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${playbackMode === 'section' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              >
                🔁 セクション
              </button>
              <button 
                onClick={() => setPlaybackMode('song')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${playbackMode === 'song' ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              >
                ▶️ 通し再生
              </button>
            </div>
          )}

          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={stop}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95 transition-all outline-none"
              aria-label="停止"
              title="停止 (先頭に戻る)"
            >
              <span className="text-xl">⏹</span>
            </button>
            
            <button
              onClick={toggle}
              className={`w-16 h-16 flex items-center justify-center rounded-full text-white shadow-lg active:scale-95 transition-all outline-none ${
                isPlaying 
                  ? 'bg-gradient-to-tr from-pink-600 to-purple-600' 
                  : 'bg-gradient-to-tr from-pink-500 to-purple-500 hover:scale-105'
              }`}
              aria-label={isPlaying ? '一時停止' : '再生'}
            >
              <span className={`text-3xl ${isPlaying ? 'translate-x-0' : 'translate-x-1'}`}>
                {isPlaying ? '⏸' : '▶'}
              </span>
            </button>
          </div>
          
          {isStructureMode && playbackMode === 'song' && isPlaying ? (
            <div className="text-xs text-pink-300 font-bold bg-pink-500/10 px-3 py-1 rounded-full animate-pulse border border-pink-500/20">
              再生中: セクション {activeSectionIndex + 1}/{sections.length} — {sections[activeSectionIndex]?.label}
            </div>
          ) : (
            <div className="flex w-full max-w-[200px] h-1.5 bg-slate-800 rounded-full overflow-hidden">
              {chords.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`flex-1 transition-all duration-100 ${
                    currentBar === idx 
                      ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]' 
                      : 'bg-transparent'
                  }`} 
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Export */}
        <div className="flex-1 flex justify-end">
          <button
            onClick={handleMidiExport}
            className="px-6 py-3 rounded-xl font-bold transition-all border border-green-500/50 hover:bg-green-500/10 text-green-400 flex items-center space-x-2 active:scale-95"
          >
            <span>📥 MIDI書き出し</span>
          </button>
        </div>

      </div>

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
}
