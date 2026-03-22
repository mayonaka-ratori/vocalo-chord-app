'use client';

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
  const isDesktop = window.innerWidth >= 768;

  const content = (
    <div className="flex flex-col gap-1 w-full bg-slate-900 md:bg-slate-800 rounded-t-2xl md:rounded-xl shadow-xl overflow-hidden animate-slide-up md:animate-dropdown fade-in p-4 md:p-2 border-t border-slate-700 md:border md:border-slate-600">
      <div className="md:hidden w-12 h-1 bg-slate-600 rounded-full mx-auto mb-4" />
      
      <div className="font-bold text-slate-300 px-4 py-2 border-b border-slate-700 md:hidden mb-2">
        {section.label} の操作
      </div>

      <button onClick={handleDuplicate} className="flex items-center gap-3 px-4 py-3 md:py-2 text-left hover:bg-slate-700 active:bg-slate-600 rounded-lg text-slate-200 transition-colors">
        <span className="text-xl md:text-base">📋</span> 複製
      </button>

      <div className="flex items-center justify-between px-4 py-3 md:py-2 text-left hover:bg-slate-700 rounded-lg text-slate-200 transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-xl md:text-base">📏</span> 長さ変更
        </div>
        <div className="flex bg-slate-900 rounded-full p-1 border border-slate-700">
          <button 
            onClick={() => handleChangeBars(4)} 
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${section.bars === 4 ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            4
          </button>
          <button 
            onClick={() => handleChangeBars(8)} 
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${section.bars === 8 ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            8
          </button>
        </div>
      </div>

      <button onClick={() => handleMove('up')} className="flex items-center gap-3 px-4 py-3 md:py-2 text-left hover:bg-slate-700 active:bg-slate-600 rounded-lg text-slate-200 transition-colors">
        <span className="text-xl md:text-base">⬆️</span> {isDesktop ? '左に移動' : '前に移動'}
      </button>

      <button onClick={() => handleMove('down')} className="flex items-center gap-3 px-4 py-3 md:py-2 text-left hover:bg-slate-700 active:bg-slate-600 rounded-lg text-slate-200 transition-colors border-b border-slate-700/50 md:border-none">
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
