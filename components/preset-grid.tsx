"use client";

import { useStore } from "@/lib/store";
import { chordPresets } from "@/data/presets";
import { getNoteIndex, degreeToChordInC } from "@/lib/music/chords";
import { transposeProgression } from "@/lib/music/transpose";
import { NoteName, MoodTag } from "@/types/music";

// 共通の helper を lib/music/chords から使用

export default function PresetGrid() {
  const {
    key, selectedPresetId, applyPreset, activeMoodTags,
    isStructureMode, sections, activeSectionIndex
  } = useStore();

  const activeSection = isStructureMode ? sections[activeSectionIndex] : null;

  const filteredPresets = chordPresets.filter(preset => {
    if (activeMoodTags.length === 0) return true;
    // 選択されたタグが一つでも含まれていれば表示（OR条件）。要件に応じてANDにも可能。
    return activeMoodTags.some(tag => preset.tags.includes(tag as MoodTag));
  });

  const semitonesFromC = getNoteIndex(key as NoteName) - getNoteIndex('C');

  return (
    <div className="mb-8">
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-100">
          <span className="text-pink-400">✧</span>
          コードプリセット
        </h2>
        {isStructureMode && activeSection && (
          <div className="text-xs text-slate-400 pb-1">
            {activeSection.label} に適用
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
        {filteredPresets.map((preset) => {
          const isActive = preset.id === selectedPresetId;

          // 現在のキーでの最初の4コードを計算
          const previewDegrees = preset.degrees.slice(0, 4);
          const chordsInC = previewDegrees.map(degreeToChordInC);
          const previewChords = transposeProgression(chordsInC, semitonesFromC);

          return (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.id)}
              className={`text-left p-4 rounded-xl border transition-all relative overflow-hidden group
                ${isActive 
                  ? 'bg-green-500/10 border-green-500 shadow-[0_0_12px_rgba(34,197,94,0.25)]' 
                  : 'bg-slate-900 border-slate-800 hover:bg-slate-800 hover:border-slate-600 active:scale-[0.98]'
                }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-100 text-lg">{preset.name}</h3>
                <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2 py-1 rounded">
                  {preset.category === 'famous-song' ? '有名曲' : '定番'}
                </span>
              </div>
              
              <p className="text-xs text-slate-400 mb-3 h-8 line-clamp-2">
                {preset.description}
              </p>

              <div className="bg-slate-950 border border-slate-800 rounded px-3 py-2 justify-center flex mb-3">
                <span className="font-mono font-bold text-purple-400 tracking-wider">
                  {previewChords.join(" → ")} {preset.degrees.length > 4 ? '...' : ''}
                </span>
              </div>

              {preset.famousSongs.length > 0 && (
                <p className="text-[10px] text-slate-500 italic mb-3 line-clamp-1">
                  ♪ {preset.famousSongs.join(', ')}
                </p>
              )}

              <div className="flex flex-wrap gap-1 mt-auto">
                {preset.tags.map(tag => (
                  <span key={tag} className="text-[10px] bg-cyan-900/40 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-800/50">
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
