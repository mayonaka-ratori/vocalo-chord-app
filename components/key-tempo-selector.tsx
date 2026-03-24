"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";

const KEY_OPTIONS = [
  { value: "C", label: "C/Am" },
  { value: "G", label: "G/Em" },
  { value: "D", label: "D/Bm" },
  { value: "A", label: "A/F#m" },
  { value: "E", label: "E/C#m" },
  { value: "F", label: "F/Dm" },
  { value: "Bb", label: "Bb/Gm" },
  { value: "Eb", label: "Eb/Cm" }
];

const BPM_MIN = 60;
const BPM_MAX = 220;

/**
 * キー選択 + テンポ（BPM）スライダー＋数値入力コンポーネント
 */
export default function KeyTempoSelector() {
  const { key, setKey, tempo, setTempo } = useStore();
  const [isEditingBpm, setIsEditingBpm] = useState(false);
  const [bpmInputValue, setBpmInputValue] = useState(String(tempo));

  /** インライン入力の値を確定する */
  const commitBpm = () => {
    const parsed = parseInt(bpmInputValue, 10);
    if (!isNaN(parsed)) {
      const clamped = Math.min(BPM_MAX, Math.max(BPM_MIN, parsed));
      setTempo(clamped);
      setBpmInputValue(String(clamped));
    } else {
      setBpmInputValue(String(tempo));
    }
    setIsEditingBpm(false);
  };

  const handleBpmKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commitBpm();
    if (e.key === 'Escape') {
      setBpmInputValue(String(tempo));
      setIsEditingBpm(false);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10);
    setTempo(v);
    setBpmInputValue(String(v));
  };

  return (
    <div className="bg-voca-bg-card backdrop-blur-sm rounded-2xl p-4 md:p-6 mb-6 border border-voca-border-subtle shadow-xl">
      <div className="flex flex-col gap-6">
        
        {/* キー選択 */}
        <div>
          <label className="block text-sm font-bold text-voca-text mb-3">
            キー設定
            <span className="ml-2 text-xs font-normal text-voca-text-muted">（曲の調）</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {KEY_OPTIONS.map((opt) => {
              const isActive = key === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setKey(opt.value)}
                  className={`px-3 py-2 text-sm font-bold rounded-lg transition-all min-w-[3rem] ${
                    isActive
                      ? "bg-voca-accent-cyan/10 text-voca-accent-cyan border border-voca-accent-cyan shadow-glow-cyan"
                      : "bg-voca-bg-elevated text-voca-text-sub border border-voca-border-subtle hover:bg-voca-bg-section hover:text-voca-text hover:border-voca-accent-cyan"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* テンポ選択 */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-bold text-voca-text">
              テンポ（速さ）
              <span className="ml-2 text-xs font-normal text-voca-text-muted">BPM = 1分間の拍数</span>
            </label>
            {/* BPM 数値表示 / インライン編集 */}
            {isEditingBpm ? (
              <input
                type="number"
                min={BPM_MIN}
                max={BPM_MAX}
                value={bpmInputValue}
                onChange={e => setBpmInputValue(e.target.value)}
                onBlur={commitBpm}
                onKeyDown={handleBpmKeyDown}
                autoFocus
                className="w-20 text-right text-xl font-black bg-voca-bg-card border border-voca-accent-purple rounded-lg px-2 py-0.5 text-voca-accent-magenta focus:outline-none focus:ring-1 focus:ring-voca-accent-purple"
              />
            ) : (
              <button
                onClick={() => {
                  setBpmInputValue(String(tempo));
                  setIsEditingBpm(true);
                }}
                title="クリックして数値を直接入力"
                className="text-xl font-black text-voca-accent-purple hover:text-voca-accent-magenta hover:underline underline-offset-2 transition-colors cursor-text"
              >
                {tempo}
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-voca-text-muted whitespace-nowrap">🐢 ゆっくり</span>
            <input
              type="range"
              min={BPM_MIN}
              max={BPM_MAX}
              value={tempo}
              onChange={handleSliderChange}
              className="w-full accent-voca-accent-cyan h-2 bg-voca-bg-elevated rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs text-voca-text-muted whitespace-nowrap">🐇 速め</span>
          </div>
        </div>

      </div>
    </div>
  );
}
