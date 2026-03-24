"use client";

import { useRef, useEffect } from "react";
import { useStore } from "@/lib/store";
import { parseChord, getNoteIndex } from "@/lib/music/chords";
import { getChordFunction } from "@/lib/music/keys";
import { DegreeName, NoteName } from "@/types/music";

/**
 * 現在のキーに対するコードの相対度数（簡易版）を取得する内部ヘルパー
 */
function getRelativeDegree(chordName: string, keyName: string): DegreeName {
  if (!chordName || chordName === 'N.C.') return 'Other';

  const { root } = parseChord(chordName);
  const rootKey = keyName.split('/')[0] as NoteName;
  const semitones = (getNoteIndex(root) - getNoteIndex(rootKey) + 12) % 12;
  switch (semitones) {
    case 0: return 'I';
    case 2: return 'IIm';
    case 4: return 'IIIm';
    case 5: return 'IV';
    case 7: return 'V';
    case 9: return 'VIm';
    case 11: return 'VII';
    default: return 'Other';
  }
}

/** コード機能に応じたスタイル情報を返す */
function getFuncStyle(func: string): {
  borderClass: string;
  badgeClass: string;
  badgeLabel: string;
} {
  switch (func) {
    case 'Tonic':
      return {
        borderClass: 'border-b-voca-semantic-success',
        badgeClass: 'bg-voca-semantic-success/20 text-voca-semantic-success border-voca-semantic-success/40',
        badgeLabel: 'T',
      };
    case 'Subdominant':
      return {
        borderClass: 'border-b-voca-semantic-warning',
        badgeClass: 'bg-voca-semantic-warning/20 text-voca-semantic-warning border-voca-semantic-warning/40',
        badgeLabel: 'SD',
      };
    case 'Dominant':
      return {
        borderClass: 'border-b-voca-tone-blue',
        badgeClass: 'bg-voca-tone-blue/20 text-voca-tone-blue border-voca-tone-blue/40',
        badgeLabel: 'D',
      };
    default:
      return {
        borderClass: 'border-b-voca-border-subtle',
        badgeClass: 'bg-voca-bg-card text-voca-text-muted border-voca-border-subtle',
        badgeLabel: '…',
      };
  }
}

/**
 * コード進行タイムラインコンポーネント
 * - コード機能（T/SD/D）に応じた下枠色・バッジ表示
 * - 再生中の小節をハイライト＆モバイルでは自動スクロール
 */
export default function ChordTimeline() {
  const { 
    chords, currentBar, openChordEditor,
    isStructureMode, activeSectionIndex, sections, key,
    previewChords, previewChangedIndices, clearPreview, generateVariationSuggestions,
    showMelodyGuide, toggleMelodyGuide, chordToneInfos, includeBlueNotes
  } = useStore();

  const activeSection = isStructureMode ? sections[activeSectionIndex] : null;
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // 再生中の小節をモバイルで自動スクロール
  useEffect(() => {
    if (currentBar === null || currentBar < 0) return;
    const el = buttonRefs.current[currentBar];
    if (!el || !containerRef.current) return;

    // モバイル幅 (768px) のみスクロールで追従
    if (window.innerWidth < 768) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [currentBar]);

  // 小節数によってグリッド列数を変更
  const colsClass = chords.length === 4 
    ? "grid-cols-4" 
    : "grid-cols-4 md:grid-cols-8";

  const displayChords = previewChords || chords;
  const isPreviewing = previewChords !== null;

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2 text-voca-text">
          <span className="text-voca-accent-magenta">✧</span>
          コード進行
          {isPreviewing && (
            <span className="ml-2 text-[10px] md:text-xs bg-voca-semantic-warning/20 text-voca-semantic-warning border border-voca-semantic-warning/50 px-2 py-0.5 rounded-full animate-[pulse_2s_ease-in-out_infinite]">
              プレビュー中...
            </span>
          )}
        </h2>
        {isStructureMode && activeSection && (
          <div className="text-sm font-bold bg-voca-bg-card px-3 py-1 rounded-full text-voca-text border border-voca-border-subtle">
            {activeSection.label} ({activeSection.bars}小節)
          </div>
        )}
      </div>

      {/* タイムライングリッド */}
      <div
        ref={containerRef}
        className={`grid ${colsClass} gap-3 md:gap-4 mb-4 overflow-x-auto p-4 rounded-2xl border transition-colors duration-300 ${
          isPreviewing ? 'bg-voca-semantic-warning/5 border-voca-semantic-warning/30' : 'bg-voca-bg-card/40 border-voca-border-subtle'
        }`}
      >
        {displayChords.map((chord, i) => {
          const isActivePlay = currentBar === i;
          const isPreviewChanged = isPreviewing && previewChangedIndices?.includes(i);
          
          // コード機能による色分け
          const degree = getRelativeDegree(chord, key as NoteName);
          const func = getChordFunction(degree);
          const { borderClass, badgeClass, badgeLabel } = getFuncStyle(func);

          // カスタムスタイル
          let buttonClass = `relative aspect-square md:aspect-auto md:w-[88px] md:h-[88px] flex flex-col items-center justify-center rounded-xl border-2 transition-all bg-voca-bg-elevated group ${borderClass} `;
          
          if (isPreviewChanged) {
             buttonClass += 'border-voca-semantic-warning bg-voca-semantic-warning/10 shadow-glow-magenta animate-[pulse_2s_ease-in-out_infinite] md:scale-105';
          } else if (isActivePlay) {
             buttonClass += 'border-voca-accent-cyan bg-voca-accent-cyan/10 shadow-glow-cyan animate-pulseGlow md:scale-105';
          } else {
             buttonClass += 'hover:bg-voca-bg-section hover:border-voca-text-sub active:scale-95';
          }

          return (
            <button
              key={`${i}-${chord}`}
              ref={el => { buttonRefs.current[i] = el; }}
              onClick={() => isPreviewing ? clearPreview() : openChordEditor(i)}
              className={buttonClass}
            >
              {/* 小節番号 */}
              <span className="absolute top-1 left-2 text-[10px] text-voca-text-muted font-bold">
                {i + 1}
              </span>
              
              {/* コード名 */}
              <span className={`font-mono font-bold text-lg md:text-xl
                ${isActivePlay ? 'text-voca-accent-cyan' : 'text-voca-text'}
              `}>
                {chord}
              </span>

              {/* T/SD/D バッジ（色覚多様性対応） */}
              {func !== 'Other' && chord !== 'N.C.' && (
                <span className={`mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-black border ${badgeClass}`}>
                  {badgeLabel}
                </span>
              )}

              {/* メロディガイド用ドット表示 */}
              {showMelodyGuide && chordToneInfos[i] && (
                <div className="absolute bottom-1.5 flex gap-1 px-1 overflow-hidden max-w-full justify-center">
                  {chordToneInfos[i].tones.map((_, idx) => (
                    <div 
                      key={`tone-${idx}`} 
                      className="w-1.5 h-1.5 rounded-full bg-voca-tone-pink shadow-glow-magenta" 
                      title={chordToneInfos[i].toneNames[idx]}
                    />
                  ))}
                  {includeBlueNotes && chordToneInfos[i].blueNotes.map((_, idx) => (
                    <div 
                      key={`blue-${idx}`} 
                      className="w-1.5 h-1.5 rounded-full bg-voca-tone-blue shadow-glow-blue border border-white/20" 
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
      {/* 操作ボタンエリア */}
      {chords.length > 0 && chords.some(c => c !== 'N.C.') && (
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <button
            onClick={() => isPreviewing ? clearPreview() : generateVariationSuggestions()}
            className={`w-full md:w-auto px-5 py-2.5 rounded-full border transition-all active:scale-95 group flex items-center justify-center gap-2 ${
              isPreviewing
                ? 'bg-voca-bg-card border-voca-text-sub text-voca-text-sub'
                : 'bg-voca-bg-card border-voca-accent-magenta/30 text-voca-text-sub hover:border-voca-accent-magenta hover:text-voca-accent-magenta shadow-glow-magenta/5'
            }`}
          >
            {isPreviewing ? (
              <>
                <span className="text-voca-text-sub group-hover:text-voca-text">↩️</span>
                <span className="text-sm font-bold">元に戻す</span>
              </>
            ) : (
              <>
                <span className="text-voca-accent-magenta group-hover:scale-110 transition-transform">✨</span>
                <span className="text-sm font-bold">
                  {isStructureMode && activeSection ? `${activeSection.label} のアレンジ提案` : 'アレンジ提案'}
                </span>
              </>
            )}
          </button>

          <button
            onClick={() => toggleMelodyGuide()}
            className={`w-full md:w-auto px-5 py-2.5 rounded-full border transition-all active:scale-95 flex items-center justify-center gap-2 ${
              showMelodyGuide 
                ? 'bg-gradient-hero border-transparent shadow-glow-cyan text-white' 
                : 'bg-voca-bg-card border-voca-border-subtle text-voca-text-sub hover:bg-voca-bg-section hover:text-voca-text hover:border-voca-accent-cyan'
            }`}
          >
            <span className={showMelodyGuide ? 'animate-bounce' : ''}>🎵</span>
            <span className="text-sm font-bold">
              {isStructureMode && activeSection ? `${activeSection.label} のメロディガイド` : 'メロディガイド'}
            </span>
          </button>
        </div>
      )}

      {/* 凡例 — モバイルは text-xs、デスクトップは text-sm */}
      <div className="flex flex-wrap gap-3 text-xs sm:text-sm font-bold text-voca-text-muted bg-voca-bg-card/50 px-4 py-2 rounded-xl border border-voca-border-subtle w-max">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-voca-semantic-success shrink-0" />
          <span>T <span className="font-medium opacity-50">安定</span></span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-voca-semantic-warning shrink-0" />
          <span>SD <span className="font-medium opacity-50">展開</span></span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-voca-tone-blue shrink-0" />
          <span>D <span className="font-medium opacity-50">緊張</span></span>
        </span>
      </div>
    </div>
  );
}
