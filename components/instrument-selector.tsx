'use client';

import { useStore } from '@/lib/store';
import { instrumentPresets } from '@/data/instrument-presets';
import { useCallback, useEffect } from 'react';

export function InstrumentSelector() {
  const { instrumentPresetId, setInstrumentPreset, isStructureMode } = useStore();

  const selectedPreset = instrumentPresets.find(p => p.id === instrumentPresetId);

  // Sync with Tone.js engine when it changes
  useEffect(() => {
    import('@/lib/audio/engine').then(engine => {
      if (engine.isAudioReady()) {
        engine.switchBackingInstrument(instrumentPresetId);
      }
    });
  }, [instrumentPresetId]);

  const handleSelect = useCallback((id: string) => {
    // Runtime check: only call setter if id is a known valid preset ID
    const preset = instrumentPresets.find(p => p.id === id);
    if (preset) {
      setInstrumentPreset(preset.id);
    }
  }, [setInstrumentPreset]);

  return (
    <div className="mb-8">
      <div className="flex items-end justify-between mb-4">
        <h3 className="text-sm font-black text-voca-text-sub uppercase tracking-widest flex items-center gap-2">
          <span className="text-voca-accent-cyan text-lg">🎹</span> バッキング音色
        </h3>
        {isStructureMode && (
          <div className="text-[10px] text-voca-text-muted font-bold px-2 py-0.5 bg-voca-bg-elevated rounded border border-voca-border-subtle hidden md:block">
            IN SECTION
          </div>
        )}
      </div>

      {/* モバイル: 横スクロール */}
      <div className="flex md:hidden overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-3 pb-3 -mx-4 px-4">
        {instrumentPresets.map(preset => {
          const isSelected = preset.id === instrumentPresetId;
          return (
            <button
              key={preset.id}
              onClick={() => handleSelect(preset.id)}
              className={`flex-none w-28 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 snap-center transition-all border-2 ${
                isSelected 
                  ? 'bg-voca-accent-cyan/10 border-voca-accent-cyan shadow-glow-cyan' 
                  : 'bg-voca-bg-card border-voca-border-subtle text-voca-text-muted opacity-80'
              }`}
            >
              <div className="text-3xl">{preset.icon}</div>
              <div className={`text-[11px] font-black uppercase tracking-tight ${isSelected ? 'text-voca-text' : ''}`}>
                {preset.name}
              </div>
            </button>
          );
        })}
      </div>

      {/* Desktop view: 4x2 Grid */}
      <div className="hidden md:grid grid-cols-4 gap-4 mb-4">
        {instrumentPresets.map(preset => {
          const isSelected = preset.id === instrumentPresetId;
          return (
            <button
              key={preset.id}
              onClick={() => handleSelect(preset.id)}
              className={`p-5 rounded-2xl flex flex-col gap-3 text-left transition-all border-2 active:scale-[0.98] ${
                isSelected 
                  ? 'bg-voca-accent-cyan/10 border-voca-accent-cyan shadow-glow-cyan' 
                  : 'bg-voca-bg-card border-voca-border-subtle text-voca-text-muted hover:bg-voca-bg-section hover:border-voca-text-sub'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{preset.icon}</span>
                <span className={`font-black text-sm uppercase tracking-wider ${isSelected ? 'text-voca-text' : 'text-voca-text-sub'}`}>
                  {preset.name}
                </span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {preset.tags.map(tag => (
                  <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full bg-voca-bg-elevated text-voca-text-muted font-bold uppercase border border-voca-border-subtle/50">
                    {tag}
                  </span>
                ))}
              </div>
              <div className={'text-[10px] truncate leading-tight ' + (isSelected ? 'text-voca-text-sub' : 'text-voca-text-muted')}>
                代表曲: {preset.exampleSongs.join(', ')}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected details below (Mostly useful for mobile) */}
      {selectedPreset && (
        <div className="bg-voca-bg-card/50 backdrop-blur-sm rounded-2xl p-4 text-xs md:hidden mt-3 border border-voca-border-subtle">
          <div className="text-voca-text-sub mb-3 leading-relaxed">{selectedPreset.description}</div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {selectedPreset.tags.map(tag => (
                <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full bg-voca-bg-elevated text-voca-text-muted font-bold uppercase border border-voca-border-subtle/50">
                  {tag}
                </span>
              ))}
            </div>
            <div className="text-[10px] text-voca-text-muted truncate font-medium">
              Representative Songs: {selectedPreset.exampleSongs.join(', ')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
