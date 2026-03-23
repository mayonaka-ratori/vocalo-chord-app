'use client';

import { useStore } from '@/lib/store';
import { STRUCTURE_TEMPLATES } from '@/data/structure-templates';
import { SECTION_TYPES } from '@/data/section-types';

interface StructureTemplatePickerProps {
  onClose: () => void;
}

export function StructureTemplatePicker({ onClose }: StructureTemplatePickerProps) {
  const { applyStructureTemplate, enableStructureMode } = useStore();

  const handleApplyTemplate = (id: string) => {
    applyStructureTemplate(id);
    onClose();
  };

  const handleCustom = () => {
    enableStructureMode();
    onClose();
  };

  const getSectionIcon = (type: string) => {
    return SECTION_TYPES.find(s => s.type === type)?.icon || '🎵';
  };

  return (
    <div className="fixed inset-0 z-50 md:flex md:items-center md:justify-center">
      {/* オーバーレイ */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* モーダル本体 */}
      <div className="absolute bottom-0 left-0 right-0 md:relative md:max-w-2xl md:w-full md:mx-auto bg-slate-900 md:border md:border-slate-700 md:rounded-2xl rounded-t-2xl max-h-[85vh] overflow-y-auto animate-slide-up shadow-2xl safe-area-inset-bottom">
        <div className="md:hidden flex justify-center pt-3 pb-2" onClick={onClose}>
          <div className="w-12 h-1.5 bg-slate-600 rounded-full" />
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-100 mb-0">曲の構成テンプレート</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-200 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STRUCTURE_TEMPLATES.map(template => (
              <button
                key={template.id}
                onClick={() => handleApplyTemplate(template.id)}
                className="bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all text-left p-4 rounded-xl border border-slate-700 flex flex-col gap-3 group"
              >
                <span className="flex items-center gap-2">
                  <span className="text-2xl">{template.icon}</span>
                  <span className="flex flex-col">
                    <span className="font-bold text-slate-100 group-hover:text-pink-300 transition-colors">
                      {template.name}
                    </span>
                    <span className="text-xs text-slate-400">{template.description}</span>
                  </span>
                </span>
                
                {/* 構成マップ */}
                <span className="flex items-center gap-1 flex-wrap bg-slate-900/50 p-2 rounded-lg">
                  {template.sectionSequence.map((seq, i) => (
                    <span key={i} className="flex items-center">
                      <span className="text-sm" title={`${getSectionIcon(seq.type)} (${seq.bars}小節)`}>
                        {getSectionIcon(seq.type)}
                      </span>
                      {i < template.sectionSequence.length - 1 && (
                        <span className="text-slate-600 text-[10px] mx-0.5">|</span>
                      )}
                    </span>
                  ))}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-6 border-t border-slate-700 pt-6">
            <button
              onClick={handleCustom}
              className="w-full p-4 rounded-xl border-2 border-dashed border-slate-600 hover:border-slate-500 hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <span className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold">＋</span>
              <span className="text-left flex flex-col">
                <span className="font-bold text-slate-200">カスタム構成</span>
                <span className="text-xs text-slate-400">1つのAメロから空で作る</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
