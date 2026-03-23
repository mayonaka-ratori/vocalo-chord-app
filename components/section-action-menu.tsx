'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Section } from '@/types/music';

interface SectionActionMenuProps {
  section: Section;
  onClose: () => void;
  anchorRect?: DOMRect | null;
}

export function SectionActionMenu({ section, onClose, anchorRect }: SectionActionMenuProps) {
  const { duplicateSection, updateSectionBars, moveSection, removeSection, sections } = useStore();

  const handleDuplicate = () => {
    duplicateSection(section.id);
    onClose();
  };

  const handleChangeBars = (bars: number) => {
    updateSectionBars(section.id, bars);
    onClose();
  };

  const handleMove = (direction: 'up' | 'down') => {
    moveSection(section.id, direction);
    onClose();
  };

  const handleDelete = () => {
    const hasChords = section.chords.some(c => c !== 'C' && c !== 'N.C.');
    if (hasChords) {
      if (!window.confirm(`${section.label} を削除してもよろしいですか？（変更済みのコード進行が含まれています）`)) {
        return;
      }
    }
    removeSection(section.id);
    onClose();
  };

  // If we have an anchor, position dropdown there (Desktop), otherwise bottom sheet (Mobile)
  const [isDesktop, setIsDesktop] = useState(false);
  
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const content = (
    <div className="flex flex-col gap-1 w-full bg-voca-bg md:bg-voca-bg-card rounded-t-2xl md:rounded-xl shadow-xl overflow-hidden animate-slide-up md:animate-dropdown fade-in p-4 md:p-2 border-t border-voca-border-subtle md:border md:border-voca-border-subtle">
      <div className="md:hidden w-12 h-1 bg-voca-border-subtle rounded-full mx-auto mb-4" />
      
      <div className="font-bold text-voca-text px-4 py-2 border-b border-voca-border-subtle md:hidden mb-2">
        {section.label} の操作
      </div>

      <button onClick={handleDuplicate} className="flex items-center gap-3 px-4 py-3 md:py-2 text-left hover:bg-voca-bg-section active:bg-voca-bg-elevated rounded-lg text-voca-text transition-colors">
        <span className="text-xl md:text-base">📋</span> 複製
      </button>

      <div className="flex items-center justify-between px-4 py-3 md:py-2 text-left hover:bg-voca-bg-section rounded-lg text-voca-text transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-xl md:text-base">📏</span> 長さ変更
        </div>
        <div className="flex bg-voca-bg rounded-full p-1 border border-voca-border-subtle">
          <button 
            onClick={() => handleChangeBars(4)} 
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${section.bars === 4 ? 'bg-voca-accent-purple text-white' : 'text-voca-text-sub hover:text-voca-text'}`}
          >
            4
          </button>
          <button 
            onClick={() => handleChangeBars(8)} 
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${section.bars === 8 ? 'bg-voca-accent-purple text-white' : 'text-voca-text-sub hover:text-voca-text'}`}
          >
            8
          </button>
        </div>
      </div>

      <button onClick={() => handleMove('up')} className="flex items-center gap-3 px-4 py-3 md:py-2 text-left hover:bg-voca-bg-section active:bg-voca-bg-elevated rounded-lg text-voca-text transition-colors">
        <span className="text-xl md:text-base">⬆️</span> {isDesktop ? '左に移動' : '前に移動'}
      </button>

      <button onClick={() => handleMove('down')} className="flex items-center gap-3 px-4 py-3 md:py-2 text-left hover:bg-voca-bg-section active:bg-voca-bg-elevated rounded-lg text-voca-text transition-colors border-b border-voca-border-subtle/50 md:border-none">
        <span className="text-xl md:text-base">⬇️</span> {isDesktop ? '右に移動' : '後に移動'}
      </button>

      {sections.length > 1 && (
        <button onClick={handleDelete} className="flex items-center gap-3 px-4 py-3 md:py-2 text-left hover:bg-red-900/30 active:bg-red-900/50 rounded-lg text-red-400 mt-1 md:mt-0 transition-colors">
          <span className="text-xl md:text-base">🗑️</span> 削除
        </button>
      )}
    </div>
  );

  if (isDesktop && anchorRect) {
    return (
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0" onClick={onClose} />
        <div 
          className="absolute"
          style={{
            top: anchorRect.bottom + 8,
            left: Math.max(16, Math.min(anchorRect.left, window.innerWidth - 240)), // Keep inside screen
            width: 220
          }}
        >
          {content}
        </div>
      </div>
    );
  }

  // Mobile Bottom Sheet
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden safe-area-inset-bottom">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full rounded-t-2xl shadow-2xl">
        {content}
      </div>
    </div>
  );
}
