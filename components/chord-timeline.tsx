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
        borderClass: 'border-b-emerald-500',
        badgeClass: 'bg-emerald-900/60 text-emerald-300 border-emerald-700',
        badgeLabel: 'T',
      };
    case 'Subdominant':
      return {
        borderClass: 'border-b-amber-500',
        badgeClass: 'bg-amber-900/60 text-amber-300 border-amber-700',
        badgeLabel: 'SD',
      };
    case 'Dominant':
      return {
        borderClass: 'border-b-blue-500',
        badgeClass: 'bg-blue-900/60 text-blue-300 border-blue-700',
        badgeLabel: 'D',
      };
    default:
      return {
        borderClass: 'border-b-slate-600',
        badgeClass: 'bg-slate-800 text-slate-500 border-slate-700',
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
    previewChords, previewChangedIndices, clearPreview, generateVariationSuggestions
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
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-100">
          <span className="text-pink-400">✧</span>
          コード進行
          {isPreviewing && (
            <span className="ml-2 text-[10px] md:text-xs bg-amber-500/20 text-amber-400 border border-amber-500/50 px-2 py-0.5 rounded-full animate-[pulse_2s_ease-in-out_infinite]">
              プレビュー中...
            </span>
          )}
        </h2>
        {isStructureMode && activeSection && (
          <div className="text-sm font-bold bg-slate-800 px-3 py-1 rounded-full text-slate-300 border border-slate-700">
            {activeSection.label} ({activeSection.bars}小節)
          </div>
        )}
      </div>

      {/* タイムライングリッド */}
      <div
        ref={containerRef}
        className={`grid ${colsClass} gap-3 md:gap-4 mb-4 overflow-x-auto p-4 rounded-2xl border transition-colors duration-300 ${
          isPreviewing ? 'bg-amber-950/20 border-amber-500/30' : 'bg-slate-900/40 border-slate-800'
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
          let buttonClass = `relative aspect-square md:aspect-auto md:w-[88px] md:h-[88px] flex flex-col items-center justify-center rounded-xl border-2 transition-all bg-slate-900 group ${borderClass} `;
          
          if (isPreviewChanged) {
             buttonClass += 'border-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.4)] animate-[pulse_2s_ease-in-out_infinite] md:scale-105';
          } else if (isActivePlay) {
             buttonClass += 'border-pink-500 bg-pink-500/10 shadow-[0_0_15px_rgba(236,72,153,0.4)] md:scale-105';
          } else {
             buttonClass += 'hover:bg-slate-800 hover:border-slate-500 active:scale-95';
          }

          return (
            <button
              key={`${i}-${chord}`}
              ref={el => { buttonRefs.current[i] = el; }}
              onClick={() => isPreviewing ? clearPreview() : openChordEditor(i)}
              className={buttonClass}
            >
              {/* 小節番号 */}
              <span className="absolute top-1 left-2 text-[10px] text-slate-500 font-bold">
                {i + 1}
              </span>
              
              {/* コード名 */}
              <span className={`font-mono font-bold text-lg md:text-xl
                ${isActivePlay ? 'text-pink-100' : 'text-slate-100'}
              `}>
                {chord}
              </span>

              {/* T/SD/D バッジ（色覚多様性対応） */}
              {func !== 'Other' && chord !== 'N.C.' && (
                <span className={`mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-black border ${badgeClass}`}>
                  {badgeLabel}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* アレンジ提案トリガーボタン */}
      {chords.length > 0 && chords.some(c => c !== 'N.C.') && (
        <div className="flex mb-4">
          <button
            onClick={() => isPreviewing ? clearPreview() : generateVariationSuggestions()}
            className="w-full md:w-auto px-5 py-2.5 rounded-full border border-pink-500/50 bg-slate-900/60 shadow-[0_0_10px_rgba(236,72,153,0.15)] hover:bg-slate-800 hover:border-pink-500 transition-all active:scale-95 group flex items-center justify-center gap-2"
          >
            {isPreviewing ? (
              <>
                <span className="text-slate-400 group-hover:text-slate-200">↩️</span>
                <span className="text-sm font-bold text-slate-300">元に戻す</span>
              </>
            ) : (
              <>
                <span className="text-pink-400 group-hover:scale-110 transition-transform">✨</span>
                <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                  {isStructureMode && activeSection ? `${activeSection.label} のアレンジ提案` : 'アレンジ提案'}
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {/* 凡例 — モバイルは text-xs、デスクトップは text-sm */}
      <div className="flex flex-wrap gap-3 text-xs sm:text-sm font-bold text-slate-400 bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-800 w-max">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
          <span>T <span className="font-medium text-slate-500">安定</span></span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
          <span>SD <span className="font-medium text-slate-500">展開</span></span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
          <span>D <span className="font-medium text-slate-500">緊張</span></span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-slate-600 shrink-0" />
          <span className="font-medium text-slate-500">その他</span>
        </span>
      </div>
    </div>
  );
}
