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
      case type.includes('intro') || type.includes('outro'): return 'bg-slate-600';
      case type.includes('verse1'): return 'bg-sky-500';
      case type.includes('verse2'): return 'bg-violet-500';
      case type.includes('chorus'): return 'bg-rose-500';
      case type.includes('verse3') || type.includes('verse4'): return 'bg-amber-500';
      case type.includes('bridge'): return 'bg-emerald-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="hidden md:block bg-slate-900/50 rounded-xl p-4 border border-slate-800/80 mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-bold text-slate-300">楽曲の全体像</h3>
        <span className="text-xs text-slate-500 font-mono">
          全体: {totalBars} 小節 ≈ {mins}分{secs.toString().padStart(2, '0')}秒 (BPM {tempo})
        </span>
      </div>

      <div className="relative flex w-full h-8 rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
        {/* Playback Progress Cursor */}
        {isPlaying && playbackMode === 'song' && (
          <div 
            className="absolute top-0 bottom-0 left-0 bg-white/20 transition-all duration-300 ease-linear pointer-events-none mix-blend-overlay z-10 border-r border-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
            style={{ width: `${Math.min(100, (globalBar / totalBars) * 100)}%` }}
          />
        )}
        
        {sections.map((section, idx) => {
          const isActive = idx === activeSectionIndex;
          const widthPercent = (section.bars / totalBars) * 100;
          const colorClass = getSectionColor(section.type);

          return (
            <div
              key={section.id}
              onClick={() => setActiveSection(idx)}
              style={{ width: `${widthPercent}%` }}
              className={`h-full group relative cursor-pointer flex items-center justify-center transition-all box-border border-r border-slate-900/50 last:border-none ${colorClass} ${isActive ? 'opacity-100 shadow-[inset_0_0_0_2px_rgba(255,255,255,0.7)] z-0' : 'opacity-60 hover:opacity-80'}`}
              title={`${section.label} (${section.bars}小節)`}
            >
              <span className={`text-[10px] font-bold text-white whitespace-nowrap overflow-hidden px-1 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                {section.label.length <= 4 ? section.label : section.label.substring(0, 3)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
