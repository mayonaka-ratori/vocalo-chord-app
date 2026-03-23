"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';

export function VariationPanel() {
  const {
    showVariations, variations, dismissVariations,
    previewVariation, applyVariation, previewChords, clearPreview
  } = useStore();
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 1500);
    return () => clearTimeout(timer);
  }, [toast]);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (previewChords) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        clearPreview();
      }, 5000);
    } else {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [previewChords, clearPreview]);

  if (!showVariations) return null;

  const handleApply = (id: string) => {
    applyVariation(id);
    setToast('✅ アレンジを適用しました！');
  };

  const handleClose = () => {
    dismissVariations();
    clearPreview();
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 md:static md:z-auto bg-voca-bg-card/95 backdrop-blur-xl md:bg-voca-bg-card/40 border-t border-voca-border-subtle md:border md:border-voca-border-subtle shadow-[0_-12px_32px_rgba(0,0,0,0.6)] md:shadow-none rounded-t-3xl md:rounded-2xl animate-in slide-in-from-bottom-full md:slide-in-from-bottom-4 duration-300 pb-[max(env(safe-area-inset-bottom),80px)] md:pb-6 md:mt-6 overflow-hidden">
      <div className="p-5 md:p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-black flex items-center gap-2 text-voca-text uppercase tracking-wider">
              <span className="text-voca-accent-cyan text-2xl">✨</span>
              アレンジ提案
            </h3>
            <p className="text-xs text-voca-text-muted mt-1 font-bold">
              コードを少し変えるだけで雰囲気がガラッと変わります
            </p>
          </div>
          <button 
            onClick={handleClose} 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-voca-bg-elevated text-voca-text-sub hover:text-voca-text hover:bg-voca-bg-section transition-all border border-voca-border-subtle/50 active:scale-90"
          >
            ✕
          </button>
        </div>

        {variations.length === 0 ? (
          <div className="text-voca-text-muted text-xs font-bold text-center py-12 uppercase tracking-widest bg-voca-bg-elevated/30 rounded-2xl border border-dashed border-voca-border-subtle">
            No suggestions for this progression.
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-5 overflow-x-auto snap-x snap-mandatory md:pb-4 max-h-[50vh] min-h-[40vh] md:min-h-0 md:max-h-none overflow-y-auto md:overflow-y-visible pr-1">
            {variations.map(variation => (
              <div 
                key={variation.id} 
                className="snap-start shrink-0 w-full md:w-[280px] md:max-w-[320px] bg-voca-bg-elevated/80 border-2 border-voca-border-subtle rounded-2xl p-5 md:hover:border-voca-accent-cyan md:hover:shadow-glow-cyan/20 transition-all flex flex-col group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 rounded-xl bg-voca-bg-card shadow-inner opacity-90 group-hover:scale-110 transition-transform">{variation.icon}</span>
                    <span className="font-black text-voca-text uppercase tracking-wider">{variation.name}</span>
                  </div>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-voca-accent-magenta/10 text-voca-accent-magenta border border-voca-accent-magenta/30 shrink-0 uppercase tracking-widest shadow-sm">
                    {variation.moodShift}
                  </span>
                </div>

                {/* コードDiff可視化 */}
                <div className="flex gap-1.5 mb-4 bg-voca-bg-card/50 p-2.5 rounded-xl overflow-x-auto border border-voca-border-subtle/30 shadow-inner relative z-10">
                  {variation.modifiedChords.map((chord, i) => {
                    const isChanged = variation.changedIndices.includes(i);
                    return (
                      <div 
                        key={i} 
                        className={`flex-1 shrink-0 min-w-[3.5rem] text-center rounded-lg flex flex-col items-center justify-center py-2 border transition-all ${
                          isChanged ? 'bg-voca-accent-cyan/10 border-voca-accent-cyan text-voca-accent-cyan shadow-glow-cyan/20' : 'bg-voca-bg-elevated/50 border-voca-border-subtle/50 text-voca-text-muted opacity-70'
                        }`}
                      >
                        <span className="text-sm font-black font-mono">{chord}</span>
                        {isChanged && (
                          <span className="text-[8px] text-voca-accent-cyan/80 font-black font-mono mt-1 px-1 border-t border-voca-accent-cyan/20 w-full truncate text-center">
                            WAS {variation.originalChords[i]}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <p className="text-[11px] text-voca-text-muted mb-5 h-auto md:h-10 overflow-hidden leading-relaxed font-bold grow relative z-10">
                  {variation.description}
                </p>

                <div className="flex gap-2.5 mt-auto relative z-10">
                  <button 
                    onClick={() => previewVariation(variation.id)}
                    className="flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl border-2 border-voca-border-subtle bg-voca-bg-card text-voca-text-sub hover:bg-voca-bg-section hover:text-voca-text hover:border-voca-text-sub active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <span>🎵</span> 試聴
                  </button>
                  <button 
                    onClick={() => handleApply(variation.id)}
                    className="flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl bg-gradient-hero text-white border-none shadow-glow-purple hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <span>✅</span> これにする
                  </button>
                </div>

                {/* Background highlihgt */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-voca-accent-cyan/5 rounded-full blur-3xl group-hover:bg-voca-accent-cyan/10 transition-colors" />
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] bg-voca-bg-card border-2 border-voca-semantic-success text-voca-semantic-success px-8 py-4 rounded-3xl font-black uppercase tracking-widest shadow-2xl animate-in fade-in zoom-in duration-300 shadow-voca-semantic-success/20">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
