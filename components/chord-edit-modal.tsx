"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { getDiatonicChords, getChordFunction } from "@/lib/music/keys";
import { getNoteIndex } from "@/lib/music/chords";
import { transposeProgression } from "@/lib/music/transpose";
import { DegreeName, NoteName } from "@/types/music";

const MODAL_MODE_KEY = 'vocalo-modal-mode';

/** コード機能から左ボーダー色・バッジスタイルを導出 */
function determineStyle(func: string): {
  cardClass: string;
  badgeClass: string;
  badgeLabel: string;
  badgeDesc: string;
} {
  if (func === 'Tonic') {
    return {
      cardClass: 'border-l-emerald-500 bg-emerald-900/10 text-emerald-100',
      badgeClass: 'bg-emerald-900/60 text-emerald-300 border border-emerald-700',
      badgeLabel: 'T',
      badgeDesc: '安定',
    };
  }
  if (func === 'Subdominant') {
    return {
      cardClass: 'border-l-amber-500 bg-amber-900/10 text-amber-100',
      badgeClass: 'bg-amber-900/60 text-amber-300 border border-amber-700',
      badgeLabel: 'SD',
      badgeDesc: '展開',
    };
  }
  if (func === 'Dominant') {
    return {
      cardClass: 'border-l-blue-500 bg-blue-900/10 text-blue-100',
      badgeClass: 'bg-blue-900/60 text-blue-300 border border-blue-700',
      badgeLabel: 'D',
      badgeDesc: '緊張',
    };
  }
  return {
    cardClass: 'border-l-slate-600 bg-slate-800 text-slate-100',
    badgeClass: 'bg-slate-700 text-slate-400 border border-slate-600',
    badgeLabel: '…',
    badgeDesc: 'その他',
  };
}

function degreeToTriadQuality(degreeCode: string) {
  if (degreeCode.includes('m7b5')) return 'dim';
  if (degreeCode.includes('m7')) return 'm';
  return '';
}

interface ChordButtonProps {
  name: string;
  func: string;
  /** くわしいモード用: ローマ字度数表記 */
  advancedLabel?: string;
  onClick: (name: string) => void;
}

/** 個別コードボタン（かんたん/くわしい 共通） */
function ChordButton({ name, func, advancedLabel, onClick }: ChordButtonProps) {
  const { cardClass, badgeClass, badgeLabel, badgeDesc } = determineStyle(func);
  return (
    <button
      onClick={() => onClick(name)}
      className={`flex flex-col items-start p-3 rounded-lg border-l-4 border-t border-r border-b border-slate-700 hover:brightness-125 transition-all text-left ${cardClass}`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="font-mono font-bold text-lg leading-none">{name}</span>
        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${badgeClass}`}>
          {badgeLabel}
        </span>
      </div>
      {advancedLabel ? (
        <span className="text-[10px] font-bold opacity-60">{advancedLabel}</span>
      ) : (
        <span className="text-[10px] font-bold opacity-70">{badgeDesc}</span>
      )}
    </button>
  );
}

/**
 * コード編集モーダル
 * - かんたんモード: 基本三和音 + 日本語機能ラベル
 * - くわしいモード: 7thコード・借用コードも表示
 * - モード選択は localStorage に永続化
 */
export default function ChordEditModal() {
  const { editingBarIndex, key, setChordAtBar, closeChordEditor } = useStore();
  const [isSimple, setIsSimple] = useState(true);

  // localStorage からモードを復元
  useEffect(() => {
    try {
      const saved = localStorage.getItem(MODAL_MODE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved === 'advanced') setIsSimple(false);
    } catch {
      // SSR or storage blocked — keep default
    }
  }, []);

  const handleModeToggle = (simple: boolean) => {
    setIsSimple(simple);
    try {
      localStorage.setItem(MODAL_MODE_KEY, simple ? 'simple' : 'advanced');
    } catch {
      // ignore
    }
  };

  if (editingBarIndex === null) return null;

  // ダイアトニック情報を生成
  const diatonicBase = getDiatonicChords({ root: key as NoteName, scale: 'major' });

  // 1. 基本コード (Triads)
  const triads = diatonicBase.map(d => {
    const fn = getChordFunction(d.degree as DegreeName);
    const triadQ = degreeToTriadQuality(d.degree);
    return {
      name: `${d.note}${triadQ}`,
      advancedLabel: d.degree.replace('7', '').replace('M', '').replace('b5', 'dim'),
      func: fn,
    };
  });

  // 2. セブンスコード
  const sevenths = diatonicBase.map(d => {
    const fn = getChordFunction(d.degree as DegreeName);
    const finalQ = d.quality === 'M7' ? 'maj7' : d.quality;
    return {
      name: `${d.note}${finalQ}`,
      advancedLabel: d.degree.replace('M7', 'maj7'),
      func: fn,
    };
  });

  // 3. 借用コード (Secondary Dominants)
  const secDominantsInC = [
    { name: 'A7', label: 'V7/II' },
    { name: 'B7', label: 'V7/III' },
    { name: 'C7', label: 'V7/IV' },
    { name: 'D7', label: 'V7/V' },
    { name: 'E7', label: 'V7/VI' },
  ];
  const semitonesFromC = getNoteIndex(key as NoteName) - getNoteIndex('C');
  const borrowed = secDominantsInC.map(bd => ({
    name: transposeProgression([bd.name], semitonesFromC)[0],
    advancedLabel: bd.label,
    func: 'Dominant',
  }));

  const handleSelect = (chordName: string) => {
    setChordAtBar(editingBarIndex, chordName);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={closeChordEditor}
    >
      <div
        className="bg-slate-900 w-full max-w-2xl md:rounded-2xl rounded-t-3xl border border-slate-700 max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up md:animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag Handle Cosmetic */}
        <div className="w-full flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-12 h-1.5 bg-slate-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/90 top-0 z-10 sticky">
          <h2 className="text-xl font-bold text-slate-100">
            {editingBarIndex + 1}小節目のコードを変更
          </h2>
          <button
            onClick={closeChordEditor}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="px-6 pt-4 flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 mr-1">表示モード:</span>
          <div className="flex rounded-lg overflow-hidden border border-slate-700">
            <button
              onClick={() => handleModeToggle(true)}
              className={`px-4 py-1.5 text-sm font-bold transition-all ${
                isSimple
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              かんたん
            </button>
            <button
              onClick={() => handleModeToggle(false)}
              className={`px-4 py-1.5 text-sm font-bold transition-all ${
                !isSimple
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              くわしい
            </button>
          </div>
          {isSimple && (
            <span className="text-xs text-slate-500 ml-2">色でコードの役割が分かります</span>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-8">

          {isSimple ? (
            /* ===== かんたんモード ===== */
            <>
              <section>
                <h3 className="text-sm font-bold text-slate-400 mb-3 ml-1">
                  コードを選んでください
                </h3>
                {/* 凡例 */}
                <div className="flex flex-wrap gap-3 mb-4 text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-emerald-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    安定（T）— 曲の軸
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    展開（SD）— 動きを出す
                  </span>
                  <span className="flex items-center gap-1.5 text-blue-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    緊張（D）— 解決への力
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {triads.map(t => (
                    <ChordButton
                      key={`simple-${t.name}`}
                      name={t.name}
                      func={t.func}
                      onClick={handleSelect}
                    />
                  ))}
                </div>
              </section>

              {/* 休符 */}
              <section>
                <h3 className="text-sm font-bold text-slate-400 mb-3 ml-1">その他</h3>
                <button
                  onClick={() => handleSelect('N.C.')}
                  className="px-6 py-3 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 hover:text-white transition-all w-full md:w-auto"
                >
                  休符にする (N.C.)
                </button>
              </section>
            </>
          ) : (
            /* ===== くわしいモード ===== */
            <>
              <section>
                <h3 className="text-sm font-bold text-slate-400 mb-3 ml-1">基本コード (3和音)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {triads.map(t => (
                    <ChordButton
                      key={`triad-${t.name}`}
                      name={t.name}
                      func={t.func}
                      advancedLabel={t.advancedLabel}
                      onClick={handleSelect}
                    />
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-sm font-bold text-slate-400 mb-3 ml-1">セブンスコード (4和音)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {sevenths.map(t => (
                    <ChordButton
                      key={`7th-${t.name}`}
                      name={t.name}
                      func={t.func}
                      advancedLabel={t.advancedLabel}
                      onClick={handleSelect}
                    />
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-sm font-bold text-slate-400 mb-3 ml-1">借用コード（エモいスパイス）</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {borrowed.map(t => (
                    <ChordButton
                      key={`borrow-${t.name}`}
                      name={t.name}
                      func={t.func}
                      advancedLabel={t.advancedLabel}
                      onClick={handleSelect}
                    />
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-sm font-bold text-slate-400 mb-3 ml-1">その他</h3>
                <button
                  onClick={() => handleSelect('N.C.')}
                  className="px-6 py-3 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 hover:text-white transition-all w-full md:w-auto"
                >
                  休符にする (N.C.)
                </button>
              </section>
            </>
          )}

        </div>

        {/* Mobile Close Button */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 md:hidden pb-safe">
          <button
            onClick={closeChordEditor}
            className="w-full py-3 bg-slate-800 rounded-lg text-slate-300 font-bold"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
