"use client";
import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { drumPatterns } from '@/data/drum-patterns';
import { bassPatterns } from '@/data/bass-patterns';
import { backingPatterns } from '@/data/backing-patterns';

export const RhythmSelector: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'drum' | 'bass' | 'backing'>('drum');
  const { 
    drumPatternId, setDrumPattern, 
    bassPatternId, setBassPattern, 
    backingPatternId, setBackingPattern,
    isStructureMode
  } = useStore();

  const renderCards = (
    patterns: { id: string; name: string; description?: string }[], 
    selectedId: string, 
    onSelect: (id: string) => void
  ) => {
    return patterns.map(p => (
      <button
        key={p.id}
        onClick={() => onSelect(p.id)}
        className={`w-full text-left p-4 rounded-xl border text-sm transition-all duration-200 active:scale-[0.98] ${
          selectedId === p.id 
            ? 'border-voca-accent-cyan bg-voca-accent-cyan/10 shadow-glow-cyan' 
            : 'border-voca-border-subtle bg-voca-bg-elevated hover:bg-voca-bg-section hover:border-voca-accent-cyan/30'
        }`}
      >
        <div className={`font-bold ${selectedId === p.id ? 'text-voca-accent-cyan' : 'text-voca-text'}`}>{p.name}</div>
        <div className="text-[11px] text-voca-text-muted mt-1 leading-tight">{p.description}</div>
      </button>
    ));
  };

  return (
    <div className="mb-8">
      <div className="flex items-end justify-between mb-4">
        <h2 className="text-sm font-black text-voca-text-sub uppercase tracking-widest flex items-center gap-2">
          <span className="text-voca-accent-cyan text-lg">✧</span>
          リズム・伴奏の設定
        </h2>
        {isStructureMode && (
          <div className="text-[10px] text-voca-text-muted font-bold px-2 py-0.5 bg-voca-bg-elevated rounded border border-voca-border-subtle hidden md:block">
            IN SECTION
          </div>
        )}
      </div>

      <section className="bg-voca-bg-card border border-voca-border-subtle rounded-2xl overflow-hidden shadow-xl">
        {/* Mobile Tabs */}
        <div
          role="tablist"
          aria-label="リズム・伴奏カテゴリ"
          className="flex md:hidden border-b border-voca-border-subtle bg-voca-bg-elevated/50"
        >
          {[
            { id: 'drum', label: '🥁 ドラム', panelId: 'rhythm-panel-drum' },
            { id: 'bass', label: '🎸 ベース', panelId: 'rhythm-panel-bass' },
            { id: 'backing', label: '🎹 伴奏', panelId: 'rhythm-panel-backing' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`rhythm-tab-${tab.id}`}
              aria-selected={activeTab === tab.id}
              aria-controls={tab.panelId}
              tabIndex={activeTab === tab.id ? 0 : -1}
              onClick={() => setActiveTab(tab.id as 'drum'|'bass'|'backing')}
              className={`flex-1 py-3.5 text-xs font-black transition-all border-b-2 uppercase tracking-tight ${
                activeTab === tab.id
                  ? 'text-voca-accent-cyan border-voca-accent-cyan bg-voca-accent-cyan/5 shadow-[inset_0_-4px_8px_rgba(0,229,255,0.05)]'
                  : 'text-voca-text-muted border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Mobile View: Single Category */}
          <div className="md:hidden">
            <div
              id="rhythm-panel-drum"
              role="tabpanel"
              aria-labelledby="rhythm-tab-drum"
              hidden={activeTab !== 'drum'}
              className="space-y-3"
            >
              {renderCards(drumPatterns, drumPatternId, setDrumPattern)}
            </div>
            <div
              id="rhythm-panel-bass"
              role="tabpanel"
              aria-labelledby="rhythm-tab-bass"
              hidden={activeTab !== 'bass'}
              className="space-y-3"
            >
              {renderCards(bassPatterns, bassPatternId, setBassPattern)}
            </div>
            <div
              id="rhythm-panel-backing"
              role="tabpanel"
              aria-labelledby="rhythm-tab-backing"
              hidden={activeTab !== 'backing'}
              className="space-y-3"
            >
              {renderCards(backingPatterns, backingPatternId, setBackingPattern)}
            </div>
          </div>

          {/* Desktop View: 3 Columns Grid */}
          <div className="hidden md:grid grid-cols-3 gap-6">
            <div>
              <h3 className="text-[10px] font-black text-voca-text-muted mb-4 uppercase tracking-widest px-1">🥁 DRUM PATTERN</h3>
              <div className="grid grid-cols-1 gap-2.5">
                {renderCards(drumPatterns, drumPatternId, setDrumPattern)}
              </div>
            </div>
            <div>
              <h3 className="text-[10px] font-black text-voca-text-muted mb-4 uppercase tracking-widest px-1">🎸 BASS PATTERN</h3>
              <div className="grid grid-cols-1 gap-2.5">
                {renderCards(bassPatterns, bassPatternId, setBassPattern)}
              </div>
            </div>
            <div>
              <h3 className="text-[10px] font-black text-voca-text-muted mb-4 uppercase tracking-widest px-1">🎹 BACKING PATTERN</h3>
              <div className="grid grid-cols-1 gap-2.5">
                {renderCards(backingPatterns, backingPatternId, setBackingPattern)}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
