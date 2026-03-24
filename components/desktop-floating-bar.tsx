/**
 * DesktopFloatingBar – Desktop-only floating playback bar.
 * Appears when TransportControls (#transport-sentinel) scrolls out of view.
 */
'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { usePlayback } from '@/hooks/use-playback';

export function DesktopFloatingBar() {
  const {
    isPlaying,
    currentBar,
    chords,
    tempo,
    key,
    isMelodyEnabled,
    toggleMelody,
  } = useStore();
  const { toggle, stop } = usePlayback();

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sentinel = document.getElementById('transport-sentinel');
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const currentChord = chords?.[currentBar] ?? '—';

  return (
    <div
      className={`
        fixed bottom-6 left-1/2 -translate-x-1/2
        hidden md:flex items-center gap-4
        z-50 px-5 py-3
        min-w-[420px] max-w-[560px]
        bg-voca-bg-card/95 backdrop-blur-xl
        border border-voca-border-subtle rounded-2xl
        shadow-[0_8px_32px_rgba(0,0,0,0.7)]
        transition-all duration-300 ease-out
        ${visible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-y-4 opacity-0 pointer-events-none'}
      `}
    >
      {/* Progress strip at top */}
      <div className="absolute top-0 left-4 right-4 h-[2px] rounded-full bg-voca-border-subtle overflow-hidden">
        <div
          className="h-full bg-voca-accent-cyan transition-all duration-200"
          style={{
            width: chords?.length
              ? `${((currentBar + 1) / chords.length) * 100}%`
              : '0%',
          }}
        />
      </div>

      {/* Left: info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="font-mono text-lg font-bold text-voca-accent-cyan truncate">
          {currentChord}
        </span>
        <span className="text-xs text-voca-text-muted whitespace-nowrap">
          BPM {tempo} • {key}
        </span>
      </div>

      {/* Center: playback controls */}
      <div className="flex items-center gap-2">
        {/* Stop */}
        <button
          onClick={stop}
          className="w-10 h-10 rounded-full flex items-center justify-center
                     bg-voca-bg-elevated hover:bg-voca-bg-section
                     border border-voca-border-subtle
                     text-voca-text-sub hover:text-voca-text
                     transition-all active:scale-90 outline-none shadow-sm"
          aria-label="停止"
          title="停止"
        >
          <span className="text-base leading-none">⏹</span>
        </button>

        {/* Play/Pause */}
        <button
          onClick={toggle}
          className={`w-12 h-12 rounded-full flex items-center justify-center
                     bg-gradient-hero text-white
                     transition-all duration-200 hover:scale-105 active:scale-95 outline-none border border-white/20
                     ${isPlaying ? 'shadow-glow-cyan' : 'shadow-glow-purple'}`}
          aria-label={isPlaying ? '一時停止' : '再生'}
          title={isPlaying ? '一時停止' : '再生'}
        >
          <span className={`text-xl leading-none ${isPlaying ? 'translate-x-0' : 'translate-x-0.5'}`}>
            {isPlaying ? '⏸' : '▶'}
          </span>
        </button>
      </div>

      {/* Right: melody toggle */}
      <button
        onClick={toggleMelody}
        className={`w-10 h-10 rounded-full flex items-center justify-center
                    border transition-all duration-200 active:scale-90 outline-none
                    ${isMelodyEnabled
                      ? 'border-voca-accent-cyan bg-voca-accent-cyan/10 text-voca-accent-cyan shadow-glow-cyan'
                      : 'border-voca-border-subtle text-voca-text-muted hover:border-voca-accent-cyan/50 hover:text-voca-text-sub'}`}
        aria-label={isMelodyEnabled ? 'メロディ OFF' : 'メロディ ON'}
        title={isMelodyEnabled ? 'メロディ OFF' : 'メロディ ON'}
      >
        <span className="text-sm leading-none">🎵</span>
      </button>
    </div>
  );
}
