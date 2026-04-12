import React from 'react';
import { useStore } from '@/lib/store';
import { playUnifiedMelody, stopUnifiedMelody, playUnifiedChord } from '@/lib/audio/unified-player';
import { MelodyPhrase } from '@/types/music';

let melodyPreviewUiTimeout: NodeJS.Timeout | null = null;

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
    isMelodyEnabled,
    toggleMelody,
    currentBar,
    isPreviewingMelody,
    previewingPatternId,
    isPlaying: isFullPlaying
  } = useStore();

  if (!showMelodyGuide) return null;

  const handlePreviewPattern = async (pattern: MelodyPhrase) => {
    const { tempo } = useStore.getState();
    const beatDuration = 60 / tempo;
    const { getAudioContext, ensureAudioReady } = await import('@/lib/audio/engine');
    await ensureAudioReady();
    const context = await getAudioContext();
    const startTime = context.currentTime + 0.05; // small buffer

    // Stop any current preview
    stopUnifiedMelody();

    // Set preview state in store (for UI animation)
    useStore.setState({ 
      isPreviewingMelody: true, 
      previewingPatternId: pattern.patternId 
    });

    pattern.notes.forEach((note) => {
      const noteTime = startTime + (note.beat * beatDuration);
      const noteDuration = note.duration * beatDuration;

      playUnifiedMelody(note.midi, {
        duration: noteDuration,
        time: noteTime,
        velocity: note.velocity ?? 80,
      });
    });

    // Auto-clear preview state after pattern duration
    const totalDuration = pattern.notes.reduce((max, n) =>
      Math.max(max, (n.beat + n.duration) * beatDuration), 0);

    const timeoutId = setTimeout(() => {
      useStore.setState({ 
        isPreviewingMelody: false, 
        previewingPatternId: null 
      });
      melodyPreviewUiTimeout = null;
    }, (totalDuration + 0.1) * 1000);

    // Save timeout to global for cleanup
    melodyPreviewUiTimeout = timeoutId;
  };

  const stopPreview = () => {
    stopUnifiedMelody();
    if (melodyPreviewUiTimeout) {
      clearTimeout(melodyPreviewUiTimeout);
      melodyPreviewUiTimeout = null;
    }
    useStore.setState({ 
      isPreviewingMelody: false, 
      previewingPatternId: null 
    });
  };

  const handlePreview = (e: React.MouseEvent, pattern: MelodyPhrase) => {
    e.stopPropagation();
    if (isPreviewingMelody && previewingPatternId === pattern.patternId) {
      stopPreview();
    } else {
      handlePreviewPattern(pattern);
    }
  };

  const handleCombinedPreview = async (e: React.MouseEvent, pattern: MelodyPhrase) => {
    e.stopPropagation();
    setActiveMelodyPattern(pattern.patternId);
    
    const { tempo, chords } = useStore.getState();
    const beatDuration = 60 / tempo;
    const { getAudioContext, ensureAudioReady } = await import('@/lib/audio/engine');
    await ensureAudioReady();
    const context = await getAudioContext();
    const startTime = context.currentTime + 0.05;

    // Stop current
    stopPreview();

    // Start melody
    handlePreviewPattern(pattern);

    // Also schedule chords for the first 4 bars (one pattern length usually)
    // Simple implementation: play chords on the same timeline
    for (let i = 0; i < 4; i++) {
      const chord = chords[i % chords.length];
      if (chord && chord !== 'N.C.') {
        import('@/lib/music/chords').then(m => {
          const notes = m.getChordNotes(chord).map(n => `${n}3`);
          playUnifiedChord({
            notes,
            duration: beatDuration * 4,
            time: startTime + (i * 4 * beatDuration),
            velocity: 70
          });
        });
      }
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 md:static md:z-auto bg-voca-bg-card/95 backdrop-blur-xl md:bg-voca-bg-card/40 border-t border-voca-border-subtle md:border md:border-voca-border-subtle shadow-[0_-12px_32px_rgba(0,0,0,0.6)] md:shadow-none rounded-t-3xl md:rounded-2xl animate-in slide-in-from-bottom-full duration-300 pb-[max(env(safe-area-inset-bottom),20px)] md:pb-8 md:mt-8 overflow-hidden">
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <h3 className="text-xl font-black flex items-center gap-3 text-voca-text uppercase tracking-widest">
              <span className="text-voca-accent-cyan text-2xl">🎵</span>
              メロディガイド
            </h3>
            <button
              type="button"
              onClick={() => toggleBlueNotes()}
              aria-pressed={includeBlueNotes}
              className={`px-4 py-1.5 rounded-full text-[10px] md:text-xs font-black border-2 transition-all flex items-center gap-2 uppercase tracking-wider ${
                includeBlueNotes
                  ? 'bg-voca-accent-cyan/10 border-voca-accent-cyan text-voca-accent-cyan shadow-glow-cyan/20'
                  : 'bg-voca-bg-elevated border-voca-border-subtle text-voca-text-muted hover:border-voca-text-sub'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${includeBlueNotes ? 'bg-voca-accent-cyan shadow-glow-cyan animate-pulse' : 'bg-voca-bg-section'}`} />
              BLUE NOTE {includeBlueNotes ? 'ON' : 'OFF'}
            </button>
            <button
              type="button"
              onClick={() => toggleMelody()}
              aria-pressed={isMelodyEnabled}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full border-2 text-[10px] md:text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                isMelodyEnabled
                  ? 'bg-voca-accent-cyan/10 border-voca-accent-cyan text-voca-accent-cyan shadow-glow-cyan'
                  : 'bg-voca-bg-elevated border-voca-border-subtle text-voca-text-muted hover:border-voca-accent-cyan/50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isMelodyEnabled ? 'bg-voca-accent-cyan animate-pulse' : 'bg-voca-bg-section'}`} />
              MELODY {isMelodyEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          <button
            type="button"
            onClick={() => toggleMelodyGuide()}
            aria-label="閉じる"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-voca-bg-elevated text-voca-text-sub hover:text-voca-text hover:bg-voca-bg-section transition-all border border-voca-border-subtle/50 active:scale-90 shadow-sm"
          >
            ✕
          </button>
        </div>

        {/* Chord Tone Visualizer (Mini Piano Roll) */}
        <div className="mb-10">
          <h4 className="text-[10px] font-black text-voca-text-muted uppercase tracking-[0.2em] mb-4 px-1">Check Chord Tones</h4>
          <div className="flex md:grid md:grid-cols-4 lg:grid-cols-8 gap-4 overflow-x-auto pb-4 scrollbar-hide md:overflow-visible snap-x">
            {chordToneInfos.map((info, i) => {
              const isActive = currentBar === i;
              return (
                <div 
                  key={`guide-chord-${i}`}
                  className={`snap-center shrink-0 w-[120px] md:w-auto bg-voca-bg-elevated/50 border-2 rounded-2xl p-4 transition-all duration-300 ${
                    isActive 
                      ? 'border-voca-tone-pink shadow-glow-pink bg-voca-bg-card active-scale-105 z-10' 
                      : 'border-voca-border-subtle hover:border-voca-text-sub'
                  }`}
                >
                  <div className="text-sm font-black text-voca-text mb-4 flex justify-between items-center font-mono">
                    <span className="tracking-tighter">{info.chord}</span>
                    <span className="text-[10px] text-voca-text-muted opacity-50">{i + 1}</span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {info.tones.map((_, idx) => (
                      <div key={`tone-dot-${idx}`} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-voca-tone-pink shadow-glow-pink" />
                        <span className="text-[10px] font-black font-mono text-voca-text-sub lowercase">{info.toneNames[idx].replace(/\d/, '')}</span>
                      </div>
                    ))}
                    {includeBlueNotes && info.blueNotes.map((_, idx) => (
                      <div key={`blue-dot-${idx}`} className="flex items-center gap-2 opacity-90">
                        <div className="w-2.5 h-2.5 rounded-full bg-voca-accent-cyan shadow-glow-cyan border border-white/20" />
                        <span className="text-[10px] font-black font-mono text-voca-accent-cyan lowercase">{['b3','b5','b7'][idx]}</span>
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
          <h4 className="text-[10px] font-black text-voca-text-muted uppercase tracking-[0.2em] mb-5 px-1">Select Melody Pattern</h4>
          {/* aria-live region for preview state announcements */}
          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {isPreviewingMelody ? '再生中' : ''}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 overflow-y-auto max-h-[40vh] md:max-h-none pr-1">
            {melodyPhrases.map((phrase, phraseIndex) => {
              const isSelected = activeMelodyPatternId === phrase.patternId;
              const rhythmIcons = phrase.patternId.includes('arpeggio') ? '♪ ♪ ♪ ♪' : '♩ ♩ ♩ ♩';

              return (
                <div
                  key={phrase.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  onClick={() => setActiveMelodyPattern(phrase.patternId)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveMelodyPattern(phrase.patternId);
                    }
                  }}
                  style={{ animationDelay: `${phraseIndex * 50}ms`, animationFillMode: 'both' }}
                  className={`text-left border-2 transition-all hover:scale-[1.02] duration-150 rounded-3xl p-6 group relative overflow-hidden cursor-pointer animate-fadeInUp ${
                    isSelected
                      ? 'bg-voca-bg-card border-voca-accent-magenta shadow-glow-magenta/20'
                      : 'bg-voca-bg-elevated/40 border-voca-border-subtle hover:border-voca-text-sub hover:bg-voca-bg-elevated/60'
                  }`}
                >
                  {/* Background Highlight */}
                  {isSelected && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-voca-accent-magenta/5 rounded-full -mr-12 -mt-12 blur-3xl" />
                  )}

                  <div className="flex items-start gap-4 mb-3 relative z-10">
                    <span className={`text-3xl p-3 rounded-2xl bg-voca-bg-card shadow-inner group-hover:scale-110 transition-transform ${isSelected ? 'text-voca-accent-magenta' : 'text-voca-text-sub'}`}>
                      {phrase.icon}
                    </span>
                    <div className="pt-1">
                      <h5 className={`font-black text-sm md:text-base uppercase tracking-wider ${isSelected ? 'text-voca-text' : 'text-voca-text-sub'}`}>
                        {phrase.name}
                      </h5>
                      <p className="text-[10px] md:text-xs text-voca-text-muted font-bold mt-0.5 line-clamp-1">{phrase.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-between items-center mt-4 relative z-10 gap-3">
                    <span className="text-[10px] font-black font-mono text-voca-text-muted bg-voca-bg-card px-2.5 py-1 rounded-lg tracking-[0.3em] shadow-inner opacity-70 border border-voca-border-subtle/50">
                      {rhythmIcons}
                    </span>
                    
                    <div className="flex gap-2.5">
                       <button 
                        onClick={(e) => handleCombinedPreview(e, phrase)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black border-2 transition-all active:scale-90 flex items-center gap-2 uppercase tracking-tight ${
                          isSelected && isFullPlaying && isPreviewingMelody
                            ? 'bg-voca-accent-purple border-voca-accent-purple text-white shadow-glow-purple'
                            : 'bg-voca-bg-card border-voca-border-subtle text-voca-text-sub hover:border-voca-text-sub hover:text-voca-text'
                        }`}
                        title="コードと一緒に試聴"
                      >
                        🎹+🎵
                      </button>

                      <button 
                        onClick={(e) => handlePreview(e, phrase)}
                        className={`px-4 py-1.5 rounded-xl text-[10px] font-black border-2 transition-all active:scale-90 flex items-center gap-2 uppercase tracking-widest ${
                          isPreviewingMelody && previewingPatternId === phrase.patternId
                            ? 'bg-voca-accent-magenta border-voca-accent-magenta text-white shadow-glow-magenta animate-pulse border-none' 
                            : isSelected 
                              ? 'bg-gradient-hero border-none text-white shadow-glow-cyan' 
                              : 'bg-voca-bg-card border-voca-border-subtle text-voca-text-sub'
                        }`}
                      >
                        {isPreviewingMelody && previewingPatternId === phrase.patternId ? (
                          <><span>⏹</span><span>STOP</span></>
                        ) : (
                          <><span>▶</span><span>PLAY</span></>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
