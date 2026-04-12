"use client";

import { useState, useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { getDiatonicChords, getChordFunction } from "@/lib/music/keys";
import { getNoteIndex } from "@/lib/music/chords";
import { transposeProgression } from "@/lib/music/transpose";
import { DegreeName, NoteName } from "@/types/music";
import { useFocusTrap } from "@/hooks/use-focus-trap";

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
      cardClass: 'border-l-voca-accent-cyan bg-voca-accent-cyan/10 text-voca-accent-cyan',
      badgeClass: 'bg-voca-accent-cyan/20 text-voca-accent-cyan border border-voca-accent-cyan/50 shadow-glow-cyan/20',
      badgeLabel: 'T',
      badgeDesc: '安定',
    };
  }
  if (func === 'Subdominant') {
    return {
      cardClass: 'border-l-voca-accent-magenta bg-voca-accent-magenta/10 text-voca-accent-magenta',
      badgeClass: 'bg-voca-accent-magenta/20 text-voca-accent-magenta border border-voca-accent-magenta/50 shadow-glow-magenta/20',
      badgeLabel: 'SD',
      badgeDesc: '展開',
    };
  }
  if (func === 'Dominant') {
    return {
      cardClass: 'border-l-voca-accent-purple bg-voca-accent-purple/10 text-voca-accent-purple',
      badgeClass: 'bg-voca-accent-purple/20 text-voca-accent-purple border border-voca-accent-purple/50 shadow-glow-purple/20',
      badgeLabel: 'D',
      badgeDesc: '緊張',
    };
  }
  return {
    cardClass: 'border-l-voca-text-muted bg-voca-bg-section text-voca-text-sub',
    badgeClass: 'bg-voca-bg-elevated text-voca-text-muted border border-voca-border-subtle',
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
      className={`flex flex-col items-start p-4 rounded-xl border-l-[6px] border border-voca-border-subtle active:scale-95 transition-all text-left shadow-lg group ${cardClass}`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="font-mono font-black text-lg md:text-xl leading-none uppercase tracking-tighter group-hover:scale-110 transition-transform origin-left">{name}</span>
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${badgeClass}`}>
          {badgeLabel}
        </span>
      </div>
      {advancedLabel ? (
        <span className="text-[10px] font-black opacity-60 uppercase tracking-widest">{advancedLabel}</span>
      ) : (
        <span className="text-[10px] font-black opacity-70 uppercase tracking-widest">{badgeDesc}</span>
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
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, editingBarIndex !== null, closeChordEditor);

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
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-md"
      onClick={closeChordEditor}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chord-edit-modal-title"
        className="bg-voca-bg-card w-full max-w-2xl md:rounded-3xl rounded-t-3xl border border-voca-border-subtle max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up md:animate-fade-in ring-1 ring-white/10"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag Handle Cosmetic */}
        <div className="w-full flex justify-center pt-4 pb-1 md:hidden">
          <div className="w-12 h-1.5 bg-voca-bg-elevated rounded-full" />
        </div>

        {/* Header */}
        <div className="px-8 py-5 border-b border-voca-border-subtle flex justify-between items-center bg-voca-bg-card/90 top-0 z-10 sticky backdrop-blur-sm">
          <h2 id="chord-edit-modal-title" className="text-xl font-black text-voca-text uppercase tracking-widest flex items-center gap-2">
            <span className="text-voca-accent-cyan">✏️</span> BAR {editingBarIndex + 1}
          </h2>
          <button
            type="button"
            onClick={closeChordEditor}
            aria-label="閉じる"
            className="w-10 h-10 rounded-full bg-voca-bg-elevated text-voca-text-sub hover:text-voca-text flex items-center justify-center font-bold border border-white/5 active:scale-90 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="px-8 pt-6 flex flex-wrap items-center gap-4">
          <span className="text-[10px] font-black text-voca-text-muted uppercase tracking-[0.2em]">DISPLAY MODE:</span>
          <div className="flex rounded-xl overflow-hidden border-2 border-voca-border-subtle bg-voca-bg-elevated p-1">
            <button
              type="button"
              onClick={() => handleModeToggle(true)}
              aria-pressed={isSimple}
              className={`px-5 py-1.5 text-xs font-black uppercase tracking-widest transition-all rounded-lg ${
                isSimple
                  ? 'bg-gradient-hero text-white shadow-glow-cyan/20'
                  : 'text-voca-text-muted hover:text-voca-text-sub'
              }`}
            >
              SIMPLE
            </button>
            <button
              type="button"
              onClick={() => handleModeToggle(false)}
              aria-pressed={!isSimple}
              className={`px-5 py-1.5 text-xs font-black uppercase tracking-widest transition-all rounded-lg ${
                !isSimple
                  ? 'bg-gradient-hero text-white shadow-glow-cyan/20'
                  : 'text-voca-text-muted hover:text-voca-text-sub'
              }`}
            >
              EXPERT
            </button>
          </div>
          {isSimple && (
            <span className="text-[10px] text-voca-text-muted font-bold ml-2">Roles are color-coded for intuitive editing</span>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="p-8 overflow-y-auto space-y-10">

          {isSimple ? (
            /* ===== かんたんモード ===== */
            <>
              <section>
                <h3 className="text-[10px] font-black text-voca-text-muted uppercase tracking-[0.2em] mb-4 px-1">
                  Choose a chord
                </h3>
                {/* 凡例 */}
                <div className="flex flex-wrap gap-4 mb-6 text-[10px] font-black uppercase tracking-wider">
                  <span className="flex items-center gap-2 text-voca-accent-cyan">
                    <span className="w-2.5 h-2.5 rounded-full bg-voca-accent-cyan shadow-glow-cyan" />
                    TONIC (T) — Stable
                  </span>
                  <span className="flex items-center gap-2 text-voca-accent-magenta">
                    <span className="w-2.5 h-2.5 rounded-full bg-voca-accent-magenta shadow-glow-magenta" />
                    SUBDOM (SD) — Moving
                  </span>
                  <span className="flex items-center gap-2 text-voca-accent-purple">
                    <span className="w-2.5 h-2.5 rounded-full bg-voca-accent-purple shadow-glow-purple" />
                    DOMINANT (D) — Tension
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
                <h3 className="text-[10px] font-black text-voca-text-muted uppercase tracking-[0.2em] mb-4 px-1">Others</h3>
                <button
                  onClick={() => handleSelect('N.C.')}
                  className="px-8 py-4 rounded-xl border-2 border-voca-border-subtle bg-voca-bg-elevated text-voca-text-sub font-black uppercase tracking-widest hover:bg-voca-bg-section hover:text-voca-text hover:border-voca-accent-cyan active:scale-95 transition-all w-full md:w-auto shadow-md"
                >
                  <span className="mr-2">🔇</span> No Chord (N.C.)
                </button>
              </section>
            </>
          ) : (
            /* ===== くわしいモード ===== */
            <>
              <section>
                <h3 className="text-[10px] font-black text-voca-text-muted uppercase tracking-[0.2em] mb-4 px-1">Basic Triads</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
                <h3 className="text-[10px] font-black text-voca-text-muted uppercase tracking-[0.2em] mb-4 px-1">7th Chords</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
                <h3 className="text-[10px] font-black text-voca-text-muted uppercase tracking-[0.2em] mb-4 px-1">Borrowed Chords</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
                <h3 className="text-[10px] font-black text-voca-text-muted uppercase tracking-[0.2em] mb-4 px-1">Others</h3>
                <button
                  onClick={() => handleSelect('N.C.')}
                  className="px-8 py-4 rounded-xl border-2 border-voca-border-subtle bg-voca-bg-elevated text-voca-text-sub font-black uppercase tracking-widest hover:bg-voca-bg-section hover:text-voca-text hover:border-voca-accent-cyan active:scale-95 transition-all w-full md:w-auto shadow-md"
                >
                  <span className="mr-2">🔇</span> No Chord (N.C.)
                </button>
              </section>
            </>
          )}

        </div>

        {/* Mobile Close Button */}
        <div className="p-6 border-t border-voca-border-subtle bg-voca-bg-card md:hidden pb-safe-offset-4">
          <button
            onClick={closeChordEditor}
            className="w-full py-4 bg-voca-bg-elevated rounded-2xl text-voca-text font-black uppercase tracking-[0.2em] border-2 border-voca-border-subtle active:scale-95 transition-all"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
