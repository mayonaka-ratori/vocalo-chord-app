'use client';

import { useStore } from '@/lib/store';
import { calculateTotalBars } from '@/lib/music/section-utils';
import { usePlayback } from '@/hooks/use-playback';

export function SectionOverview() {
  const { sections, activeSectionIndex, setActiveSection, tempo, isPlaying, playbackMode } = useStore();
  const { globalBar } = usePlayback();

  const totalBars = calculateTotalBars(sections);
  
  // Estimate time: duration (min) = (totalBars * 4) / bpm
  const totalMinutes = (totalBars * 4) / tempo;
  const mins = Math.floor(totalMinutes);
  const secs = Math.floor((totalMinutes - mins) * 60);

  // Helper for colors
  const getSectionColor = (type: string) => {
    switch (true) {
      case type.includes('intro') || type.includes('outro'): return 'bg-voca-text-muted/40';
      case type.includes('verse1'): return 'bg-voca-tone-blue';
      case type.includes('verse2'): return 'bg-voca-accent-purple';
      case type.includes('chorus'): return 'bg-voca-tone-pink';
      case type.includes('bridge'): return 'bg-voca-accent-magenta';
      default: return 'bg-voca-bg-elevated';
    }
  };

  return (
    <div className="hidden md:block bg-voca-bg-card/50 backdrop-blur-sm rounded-2xl p-5 border border-voca-border-subtle mb-6 shadow-xl">
      <div className="flex justify-between items-end mb-4">
        <h3 className="text-[11px] font-black text-voca-text-sub uppercase tracking-[0.2em]">SONG STRUCTURE MAP</h3>
        <span className="text-[10px] text-voca-text-muted font-black tracking-widest uppercase">
          {totalBars} BARS ≈ {mins}:{secs.toString().padStart(2, '0')} (BPM {tempo})
        </span>
      </div>

      <div className="relative flex w-full h-10 rounded-xl overflow-hidden border border-voca-border-subtle bg-voca-bg-elevated/30 p-1 shadow-inner">
        {/* Playback Progress Cursor */}
        {isPlaying && playbackMode === 'song' && (
          <div 
            className="absolute top-1 bottom-1 left-1 bg-white/30 transition-all duration-300 ease-linear pointer-events-none mix-blend-overlay z-10 border-r-2 border-voca-accent-cyan shadow-glow-cyan"
            style={{ width: `calc(${Math.min(100, (globalBar / totalBars) * 100)}% - 8px)` }}
          />
        )}
        
        {sections.map((section, idx) => {
          const isActive = idx === activeSectionIndex;
          const widthPercent = (section.bars / totalBars) * 100;
          const colorClass = getSectionColor(section.type);

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(idx)}
              style={{ width: `${widthPercent}%` }}
              className={`h-full group relative flex items-center justify-center transition-all box-border border-r border-voca-bg/30 last:border-none rounded-lg mx-[1px]
                ${colorClass} ${isActive ? 'opacity-100 shadow-[inset_0_0_0_2px_rgba(255,255,255,0.4)] scale-[1.02] z-20' : 'opacity-40 hover:opacity-70'}
              `}
              title={`${section.label} (${section.bars}小節)`}
              aria-label={`${section.label}（${section.bars}小節）${isActive ? '、選択中' : ''}`}
            >
              <span className={`text-[9px] font-black text-white whitespace-nowrap overflow-hidden px-1.5 uppercase tracking-tighter ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                {section.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
