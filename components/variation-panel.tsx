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
    <div className="fixed inset-x-0 bottom-0 z-40 md:static md:z-auto bg-slate-900/95 backdrop-blur-xl md:bg-transparent border-t border-slate-700/80 md:border-none shadow-[0_-8px_16px_rgba(0,0,0,0.5)] md:shadow-none rounded-t-2xl md:rounded-none animate-in slide-in-from-bottom-full md:slide-in-from-bottom-4 duration-300 pb-[max(env(safe-area-inset-bottom),80px)] md:pb-0 md:mt-4">
      <div className="p-4 md:p-0">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2 text-slate-100">
              <span className="text-pink-400">✨</span>
              アレンジ提案
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              コードを少し変えるだけで雰囲気がガラッと変わります
            </p>
          </div>
          <button 
            onClick={handleClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            ✕
          </button>
        </div>

        {variations.length === 0 ? (
          <div className="text-slate-400 text-sm text-center py-8">
            この進行に対する提案はありません。
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-4 overflow-x-auto snap-x snap-mandatory md:pb-4 max-h-[50vh] min-h-[50vh] md:min-h-0 md:max-h-none overflow-y-auto md:overflow-y-visible">
            {variations.map(variation => (
              <div 
                key={variation.id} 
                className="snap-start shrink-0 w-full md:w-[280px] md:max-w-[320px] bg-slate-800 border border-slate-700 rounded-xl p-4 md:hover:border-slate-500 md:hover:shadow-lg transition-all flex flex-col"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl leading-none">{variation.icon}</span>
                    <span className="font-bold text-slate-200">{variation.name}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0">
                    {variation.moodShift}
                  </span>
                </div>

                {/* コードDiff可視化 */}
                <div className="flex gap-1 mb-3 bg-slate-900/50 p-2 rounded-lg overflow-x-auto">
                  {variation.modifiedChords.map((chord, i) => {
                    const isChanged = variation.changedIndices.includes(i);
                    return (
                      <div 
                        key={i} 
                        className={`flex-1 shrink-0 min-w-[3rem] text-center rounded flex flex-col items-center justify-center py-1.5 border transition-colors ${
                          isChanged ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'bg-slate-700/50 border-slate-600/50 text-slate-300'
                        }`}
                      >
                        <span className="text-sm font-bold font-mono">{chord}</span>
                        {isChanged && (
                          <span className="text-[9px] text-amber-500/80 font-mono mt-0.5 truncate max-w-full">
                            ← {variation.originalChords[i]}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <p className="text-xs text-slate-400 mb-4 h-auto md:h-8 overflow-hidden text-ellipsis md:line-clamp-2 grow">
                  {variation.description}
                </p>

                <div className="flex gap-2 mt-auto">
                  <button 
                    onClick={() => previewVariation(variation.id)}
                    className="flex-1 py-2 text-sm font-bold rounded-lg border border-slate-600 bg-slate-700 text-slate-200 hover:bg-slate-600 active:scale-95 transition-all flex items-center justify-center gap-1"
                  >
                    <span>🎵</span> 試聴
                  </button>
                  <button 
                    onClick={() => handleApply(variation.id)}
                    className="flex-1 py-2 text-sm font-bold rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-400 hover:to-purple-400 shadow-[0_0_10px_rgba(236,72,153,0.3)] hover:shadow-[0_0_15px_rgba(236,72,153,0.5)] active:scale-95 transition-all flex items-center justify-center gap-1"
                  >
                    <span>✅</span> これにする
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] bg-emerald-500/90 text-white px-6 py-3 rounded-full font-bold shadow-2xl border border-emerald-400 animate-in fade-in zoom-in duration-300">
          {toast}
        </div>
      )}
    </div>
  );
}
