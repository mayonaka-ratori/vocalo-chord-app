"use client";
import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { drumPatterns } from '@/data/drum-patterns';
import { bassPatterns } from '@/data/bass-patterns';
import { backingPatterns } from '@/data/backing-patterns';

export const RhythmSelector: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'drum' | 'bass' | 'backing'>('drum');
  const { drumPatternId, bassPatternId, backingPatternId, setDrumPattern, setBassPattern, setBackingPattern } = useStore();

  const renderCards = (
    patterns: { id: string; name: string; description?: string }[], 
    selectedId: string, 
    onSelect: (id: string) => void
  ) => {
    return patterns.map(p => (
      <button
        key={p.id}
        onClick={() => onSelect(p.id)}
        className={`w-full text-left p-3 rounded-xl border text-sm transition-colors ${
          selectedId === p.id 
            ? 'border-orange-400 bg-orange-400/10' 
            : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800'
        }`}
      >
        <div className="font-bold text-slate-100">{p.name}</div>
        <div className="text-xs text-slate-400 mt-1">{p.description}</div>
      </button>
    ));
  };

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      {/* Mobile Tabs */}
      <div className="flex md:hidden border-b border-slate-800">
        {[
          { id: 'drum', label: '🥁 ドラム' },
          { id: 'bass', label: '🎸 ベース' },
          { id: 'backing', label: '🎹 バッキング' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'drum'|'bass'|'backing')}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${
              activeTab === tab.id
                ? 'text-orange-400 border-b-2 border-orange-400'
                : 'text-slate-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Mobile View: Single Category */}
        <div className="md:hidden space-y-2">
          {activeTab === 'drum' && renderCards(drumPatterns, drumPatternId, setDrumPattern)}
          {activeTab === 'bass' && renderCards(bassPatterns, bassPatternId, setBassPattern)}
          {activeTab === 'backing' && renderCards(backingPatterns, backingPatternId, setBackingPattern)}
        </div>

        {/* Desktop View: 3 Columns Grid */}
        <div className="hidden md:grid grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-bold text-slate-300 mb-3">🥁 ドラムパターン</h3>
            <div className="grid grid-cols-1 gap-2">
              {renderCards(drumPatterns, drumPatternId, setDrumPattern)}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-300 mb-3">🎸 ベースパターン</h3>
            <div className="grid grid-cols-1 gap-2">
              {renderCards(bassPatterns, bassPatternId, setBassPattern)}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-300 mb-3">🎹 バッキングパターン</h3>
            <div className="grid grid-cols-1 gap-2">
              {renderCards(backingPatterns, backingPatternId, setBackingPattern)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
