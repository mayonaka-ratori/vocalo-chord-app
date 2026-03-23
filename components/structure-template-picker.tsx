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
      <div className="absolute bottom-0 left-0 right-0 md:relative md:max-w-2xl md:w-full md:mx-auto bg-voca-bg-card md:border md:border-voca-border-subtle md:rounded-3xl rounded-t-3xl max-h-[85vh] overflow-y-auto animate-slide-up shadow-2xl safe-area-inset-bottom ring-1 ring-white/10 uppercase tracking-tight">
        <div className="md:hidden flex justify-center pt-4 pb-2" onClick={onClose}>
          <div className="w-12 h-1.5 bg-voca-bg-elevated rounded-full" />
        </div>

        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-black text-voca-text tracking-[0.1em] flex items-center gap-3">
              <span className="text-voca-accent-cyan text-2xl">⚡</span> 曲の構成テンプレート
            </h2>
            <button onClick={onClose} className="text-voca-text-sub hover:text-voca-text w-10 h-10 rounded-full bg-voca-bg-elevated flex items-center justify-center transition-all border border-voca-border-subtle/50 active:scale-90">
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STRUCTURE_TEMPLATES.map(template => (
              <button
                key={template.id}
                onClick={() => handleApplyTemplate(template.id)}
                className="bg-voca-bg-elevated hover:bg-voca-bg-section active:scale-95 transition-all text-left p-5 rounded-2xl border-2 border-voca-border-subtle flex flex-col gap-4 group hover:border-voca-accent-cyan shadow-lg"
              >
                <span className="flex items-center gap-3">
                  <span className="text-3xl p-3 rounded-2xl bg-voca-bg-card shadow-inner group-hover:scale-110 transition-transform">{template.icon}</span>
                  <span className="flex flex-col">
                    <span className="font-black text-voca-text group-hover:text-voca-accent-cyan transition-colors uppercase tracking-wider">
                      {template.name}
                    </span>
                    <span className="text-[11px] text-voca-text-muted font-bold leading-tight">{template.description}</span>
                  </span>
                </span>
                
                {/* 構成マップ */}
                <span className="flex items-center gap-1 flex-wrap bg-voca-bg-card/50 p-3 rounded-xl border border-voca-border-subtle/30">
                  {template.sectionSequence.map((seq, i) => (
                    <span key={i} className="flex items-center">
                      <span className="text-sm" title={`${getSectionIcon(seq.type)} (${seq.bars}小節)`}>
                        {getSectionIcon(seq.type)}
                      </span>
                      {i < template.sectionSequence.length - 1 && (
                        <span className="text-voca-text-muted/30 text-[10px] mx-1">|</span>
                      )}
                    </span>
                  ))}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-8 border-t border-voca-border-subtle pt-8">
            <button
              onClick={handleCustom}
              className="w-full p-6 rounded-2xl border-2 border-dashed border-voca-border-subtle hover:border-voca-text-sub hover:bg-voca-bg-section active:scale-95 transition-all flex items-center justify-center gap-4 group"
            >
              <span className="w-10 h-10 rounded-full bg-voca-bg-elevated group-hover:bg-voca-text-sub group-hover:text-voca-bg-card flex items-center justify-center text-voca-text-muted font-black transition-colors">＋</span>
              <span className="text-left flex flex-col">
                <span className="font-black text-voca-text uppercase tracking-widest">CUSTOM STRUCTURE</span>
                <span className="text-[11px] text-voca-text-muted font-bold mt-0.5">1つのAメロから空で作る</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
