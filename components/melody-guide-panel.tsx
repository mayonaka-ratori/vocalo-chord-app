import React from 'react';
import { useStore } from '@/lib/store';
import { usePlayback } from '@/hooks/use-playback';
import { MelodyPatternId } from '@/types/music';

export function MelodyGuidePanel() {
  const {
    showMelodyGuide,
    toggleMelodyGuide,
    chordToneInfos,
    melodyPhrases,
    activeMelodyPatternId,
    setActiveMelodyPattern,
    includeBlueNotes,
    toggleBlueNotes,
    currentBar,
    startMelodyPreview,
    stopMelodyPreview,
    isPreviewingMelody,
    previewingPatternId,
    isPlaying: isFullPlaying
  } = useStore();

  const { toggle: toggleFullPlayback } = usePlayback();

  if (!showMelodyGuide) return null;

  const handlePreview = (e: React.MouseEvent, patternId: MelodyPatternId) => {
    e.stopPropagation();
    if (isPreviewingMelody && previewingPatternId === patternId) {
      stopMelodyPreview();
    } else {
      startMelodyPreview(patternId);
    }
  };

  const handleCombinedPreview = (e: React.MouseEvent, patternId: MelodyPatternId) => {
    e.stopPropagation();
    setActiveMelodyPattern(patternId);
    
    // Start backing if not playing
    if (!isFullPlaying) {
      toggleFullPlayback();
    }
    
    // Start melody preview
    startMelodyPreview(patternId);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 md:static md:z-auto bg-slate-900/95 backdrop-blur-xl md:bg-slate-900/40 border-t border-slate-700/80 md:border md:border-slate-800 shadow-[0_-8px_24px_rgba(0,0,0,0.6)] md:shadow-none rounded-t-3xl md:rounded-2xl animate-in slide-in-from-bottom-full duration-300 pb-[max(env(safe-area-inset-bottom),20px)] md:pb-6 md:mt-6 overflow-hidden">
      <div className="p-5 md:p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold flex items-center gap-2 text-slate-100">
              <span className="text-blue-400">🎵</span>
              メロディガイド
            </h3>
            <button
              onClick={() => toggleBlueNotes()}
              className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-bold border transition-all flex items-center gap-1.5 ${
                includeBlueNotes 
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.3)]' 
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${includeBlueNotes ? 'bg-blue-400 animate-pulse' : 'bg-slate-600'}`} />
              🎸 ブルーノート {includeBlueNotes ? 'ON' : 'OFF'}
            </button>
          </div>
          <button 
            onClick={() => toggleMelodyGuide()} 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors shadow-inner"
          >
            ✕
          </button>
        </div>

        {/* Chord Tone Visualizer (Mini Piano Roll) */}
        <div className="mb-8">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">コード構成音の確認</h4>
          <div className="flex md:grid md:grid-cols-4 lg:grid-cols-8 gap-3 overflow-x-auto pb-2 scrollbar-hide md:overflow-visible snap-x">
            {chordToneInfos.map((info, i) => {
              const isActive = currentBar === i;
              return (
                <div 
                  key={`guide-chord-${i}`}
                  className={`snap-center shrink-0 w-[110px] md:w-auto bg-slate-800/80 border rounded-xl p-3 transition-all duration-300 ${
                    isActive 
                      ? 'border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)] bg-slate-800 animate-[pulse_3s_ease-in-out_infinite]' 
                      : 'border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="text-sm font-bold text-slate-200 mb-3 flex justify-between items-center">
                    <span>{info.chord}</span>
                    <span className="text-[10px] text-slate-500">{i + 1}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {info.tones.map((_, idx) => (
                      <div key={`tone-dot-${idx}`} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-[0_0_6px_rgba(236,72,153,0.6)]" />
                        <span className="text-[10px] font-mono text-slate-400">{info.toneNames[idx].replace(/\d/, '')}</span>
                      </div>
                    ))}
                    {includeBlueNotes && info.blueNotes.map((_, idx) => (
                      <div key={`blue-dot-${idx}`} className="flex items-center gap-1.5 opacity-80">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.6)] border border-blue-300/30 border-dashed" />
                        <span className="text-[10px] font-mono text-blue-300">{['b3','b5','b7'][idx]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Melody Pattern Selector */}
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 px-1">メロディパターンの選択</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 overflow-y-auto max-h-[40vh] md:max-h-none pr-1">
            {melodyPhrases.map((phrase) => {
              const isSelected = activeMelodyPatternId === phrase.patternId;
              const rhythmIcons = phrase.patternId.includes('arpeggio') ? '♪ ♪ ♪ ♪' : '♩ ♩ ♩ ♩';
              
              return (
                <button
                  key={phrase.id}
                  onClick={() => setActiveMelodyPattern(phrase.patternId)}
                  className={`text-left border transition-all rounded-2xl p-4 group relative overflow-hidden ${
                    isSelected 
                      ? 'bg-slate-800 border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.2)]' 
                      : 'bg-slate-800/40 border-slate-800 hover:border-slate-600 hover:bg-slate-800/60'
                  }`}
                >
                  {/* Background Highlight */}
                  {isSelected && (
                    <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full -mr-8 -mt-8 blur-2xl" />
                  )}

                  <div className="flex items-start gap-3 mb-2 relative z-10">
                    <span className={`text-2xl p-2 rounded-xl bg-slate-900/80 shadow-inner group-hover:scale-110 transition-transform ${isSelected ? 'text-pink-400' : 'text-slate-400'}`}>
                      {phrase.icon}
                    </span>
                    <div>
                      <h5 className={`font-bold text-sm md:text-base ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                        {phrase.name}
                      </h5>
                      <p className="text-[10px] md:text-xs text-slate-400 line-clamp-1">{phrase.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-between items-center mt-3 relative z-10 gap-2">
                    <span className="text-xs font-mono text-slate-500 tracking-widest bg-slate-900/50 px-2 py-0.5 rounded tracking-[0.2em]">
                      {rhythmIcons}
                    </span>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => handleCombinedPreview(e, phrase.patternId)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all active:scale-90 flex items-center gap-1 ${
                          isSelected && isFullPlaying && isPreviewingMelody
                            ? 'bg-indigo-600/80 border-indigo-400 text-white'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300'
                        }`}
                        title="コードと一緒に試聴"
                      >
                        🎹+🎵
                      </button>

                      <button 
                        onClick={(e) => handlePreview(e, phrase.patternId)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all active:scale-90 flex items-center gap-1.5 ${
                          isPreviewingMelody && previewingPatternId === phrase.patternId
                            ? 'bg-amber-600 border-amber-400 text-white animate-pulse' 
                            : isSelected 
                              ? 'bg-gradient-to-r from-pink-500 to-rose-500 border-none text-white shadow-lg' 
                              : 'bg-slate-900 border-slate-700 text-slate-400'
                        }`}
                      >
                        {isPreviewingMelody && previewingPatternId === phrase.patternId ? (
                          <><span>⏹</span><span>停止</span></>
                        ) : (
                          <><span>▶</span><span>試聴</span></>
                        )}
                      </button>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
