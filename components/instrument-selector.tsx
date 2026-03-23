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
      <div className="flex items-end justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-300">🎹 バッキング音色</h3>
        {isStructureMode && (
          <div className="text-xs text-slate-400 pb-0.5 hidden md:block">
            このセクションの音色
          </div>
        )}
      </div>

      {/* モバイル: 横スクロール */}
      <div className="flex md:hidden overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-3 pb-2 -mx-4 px-4">
        {instrumentPresets.map(preset => {
          const isSelected = preset.id === instrumentPresetId;
          return (
            <button
              key={preset.id}
              onClick={() => handleSelect(preset.id)}
              className={`flex-none w-24 p-3 rounded-xl flex flex-col items-center justify-center gap-2 snap-center transition-all ${
                isSelected 
                  ? 'bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-2 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)]' 
                  : 'bg-slate-800 border-2 border-transparent text-slate-400'
              }`}
            >
              <div className="text-2xl">{preset.icon}</div>
              <div className={`text-xs font-bold whitespace-nowrap ${isSelected ? 'text-pink-100' : ''}`}>
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
              className={`p-4 rounded-xl flex flex-col gap-2 text-left transition-all ${
                isSelected 
                  ? 'bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-2 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)]' 
                  : 'bg-slate-800 border-2 border-transparent text-slate-400 hover:bg-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{preset.icon}</span>
                <span className={`font-bold ${isSelected ? 'text-pink-100' : 'text-slate-200'}`}>
                  {preset.name}
                </span>
              </div>
              <div className="flex gap-1 flex-wrap">
                {preset.tags.map(tag => (
                  <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-900/50 text-slate-300">
                    {tag}
                  </span>
                ))}
              </div>
              <div className={'text-xs truncate ' + (isSelected ? 'text-slate-300' : 'text-slate-500')}>
                代表曲: {preset.exampleSongs.join(', ')}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected details below (Mostly useful for mobile) */}
      {selectedPreset && (
        <div className="bg-slate-800/50 rounded-lg p-3 text-sm md:hidden mt-2">
          <div className="text-slate-300 mb-1">{selectedPreset.description}</div>
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {selectedPreset.tags.map(tag => (
                <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-900 text-slate-400">
                  {tag}
                </span>
              ))}
            </div>
            <div className="text-xs text-slate-500 truncate ml-2">
              🎵 {selectedPreset.exampleSongs.join(', ')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
