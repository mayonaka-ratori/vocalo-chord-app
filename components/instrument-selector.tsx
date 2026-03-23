'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { INSTRUMENT_PRESETS, SmplrInstrumentId } from '@/types/music';

export function InstrumentSelector() {
  const { 
    activeInstrumentId, 
    isInstrumentLoading, 
    instrumentLoadProgress, 
    instrumentLoadError,
    setActiveInstrument, 
    isStructureMode 
  } = useStore();

  const [isExpanded, setIsExpanded] = useState(false);

  const activePreset = INSTRUMENT_PRESETS.find(p => p.id === activeInstrumentId) || INSTRUMENT_PRESETS[INSTRUMENT_PRESETS.length - 1];

  const handleSelect = async (id: string) => {
    if (isInstrumentLoading) return;
    await setActiveInstrument(id as SmplrInstrumentId);
  };

  return (
    <div className="mb-6">
      {/* Header & Mobile Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black text-voca-text-sub uppercase tracking-widest flex items-center gap-2">
          <span className="text-voca-accent-cyan text-lg">🎹</span> 楽器を選択
        </h3>
        {isStructureMode && (
          <div className="text-[10px] text-voca-text-muted font-bold px-2 py-0.5 bg-voca-bg-elevated rounded border border-voca-border-subtle hidden md:block">
            IN SECTION
          </div>
        )}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="md:hidden flex items-center gap-2 px-3 py-1.5 bg-voca-bg-card border border-voca-border-subtle rounded-full text-xs font-bold text-voca-text-sub"
        >
          {activePreset.icon} {activePreset.labelJa}
          <span className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
        </button>
      </div>

      {/* Grid Container */}
        <div className={`${!isExpanded ? 'hidden md:grid' : 'grid'} grid-cols-2 md:grid-cols-6 gap-3`}>
        {INSTRUMENT_PRESETS.map((preset) => {
          const isActive = preset.id === activeInstrumentId;
          const isLoadingThis = isInstrumentLoading && activeInstrumentId === preset.id;
          const isDisabled = isInstrumentLoading && activeInstrumentId !== preset.id;

          const progressPercent = isActive && instrumentLoadProgress 
            ? Math.round((instrumentLoadProgress.loaded / instrumentLoadProgress.total) * 100) 
            : 0;

          return (
            <button
              key={preset.id}
              onClick={() => handleSelect(preset.id)}
              disabled={isDisabled}
              className={`relative group flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 ${
                isActive && !isInstrumentLoading
                  ? 'bg-voca-bg-section border-voca-accent-cyan shadow-glow-cyan'
                  : isLoadingThis
                  ? 'bg-voca-bg-card border-voca-accent-magenta/50 animate-pulse'
                  : 'bg-voca-bg-card border-voca-border-subtle hover:border-voca-accent-cyan/50'
              } ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {/* Network / Offline Badge */}
              <div className="absolute top-1.5 right-1.5 text-[10px]">
                {preset.requiresNetwork ? (
                  <span className="opacity-40 group-hover:opacity-100 transition-opacity" title="ネットワークが必要">📶</span>
                ) : (
                  <span className="text-voca-accent-cyan opacity-60" title="オフライン対応">✈️</span>
                )}
              </div>

              {/* Icon & Label */}
              <div className={`text-2xl transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                {preset.icon}
              </div>
              <div className="text-center">
                <div className={`text-[11px] font-bold leading-tight ${isActive ? 'text-voca-text' : 'text-voca-text-sub'}`}>
                  {preset.labelJa}
                </div>
              </div>

              {/* Status Indicator / Progress */}
              <div className="mt-1 flex flex-col items-center w-full">
                {isLoadingThis ? (
                  <>
                    <div className="flex items-center gap-1 mb-1">
                      <div className="w-1.5 h-1.5 bg-voca-accent-magenta rounded-full animate-pulse" />
                      <span className="text-[9px] text-voca-accent-magenta font-black">読込中...</span>
                    </div>
                    <div className="w-full h-1 bg-voca-bg-elevated rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-voca-accent-magenta transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </>
                ) : isActive ? (
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-voca-accent-cyan rounded-full" />
                    <span className="text-[9px] text-voca-accent-cyan font-black uppercase tracking-tighter">使用中</span>
                  </div>
                ) : (
                  <span className="text-[9px] text-voca-text-muted font-bold group-hover:text-voca-text-sub transition-colors">タップで選択</span>
                )}
                
                {/* Cache Badge */}
                {isActive && preset.requiresNetwork && (
                  <span className="text-[9px] text-voca-text-muted mt-0.5">
                    {typeof window !== 'undefined' && 'caches' in window && window.location.protocol === 'https:'
                      ? '💾 キャッシュ済'
                      : '📶 オンライン'}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Loading Error Message */}
      {instrumentLoadError && (
        <div className="mt-4 p-3 bg-voca-semantic-error/10 border border-voca-semantic-error/30 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-voca-semantic-error text-xs font-black flex items-center gap-2 tracking-wide text-center justify-center">
            <span className="text-sm">⚠️</span> {instrumentLoadError}
          </p>
        </div>
      )}
    </div>
  );
}
