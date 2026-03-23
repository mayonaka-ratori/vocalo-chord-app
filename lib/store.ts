import { create } from 'zustand';
import { SongSearchResult, NoteName, ChordVariation, SmplrInstrumentId } from '@/types/music';
import { generateVariations as computeVariations } from './music/variation';
import { chordPresets } from '@/data/presets';
import { transposeProgression } from './music/transpose';
import { getNoteIndex, degreeToChordInC } from './music/chords';
import { InstrumentPresetId } from '@/types/audio';
import { instrumentPresets } from '@/data/instrument-presets';
import { Section, SectionType, MelodyPhrase, MelodyPatternId, ChordToneInfo } from '@/types/music';
import { STRUCTURE_TEMPLATES } from '@/data/structure-templates';
import { createEmptySection, duplicateSectionData } from './music/section-utils';
import { generateMelodyPhrases, getChordTones } from './music/melody';
import { getSmplrProvider } from './audio/smplr-provider';


export interface AppState {
  // Key & Tempo
  key: string;              
  tempo: number;            
  
  // Current chord progression
  chords: string[];         
  selectedPresetId: string | null;
  
  // Pattern selections
  drumPatternId: string;
  bassPatternId: string;
  backingPatternId: string;
  instrumentPresetId: InstrumentPresetId;
  
  // Section Builder state
  sections: Section[];
  activeSectionIndex: number;
  isStructureMode: boolean;
  
  // Playback state
  playbackMode: 'section' | 'song';
  isPlaying: boolean;
  currentBar: number;       
  isAudioInitialized: boolean;
  
  // UI state
  activeMoodTags: string[]; 
  editingBarIndex: number | null;
  
  // Song search
  searchQuery: string;
  searchResults: SongSearchResult[];
  isSearching: boolean;
  categoryFilter: string | null;

  // Variation suggestions
  variations: ChordVariation[];
  showVariations: boolean;
  previewChords: string[] | null;
  previewChangedIndices: number[] | null;

  // Melody guide state
  melodyPhrases: MelodyPhrase[];
  activeMelodyPatternId: MelodyPatternId | null;
  showMelodyGuide: boolean;
  includeBlueNotes: boolean;
  chordToneInfos: ChordToneInfo[];
  isPreviewingMelody: boolean;
  previewingPatternId: MelodyPatternId | null;

  // Instrument state (smplr)
  activeInstrumentId: SmplrInstrumentId;
  instrumentLoadProgress: { loaded: number; total: number } | null;
  isInstrumentLoading: boolean;
  instrumentLoadError: string | null;


  // Actions
  setKey: (key: string) => void;
  setTempo: (tempo: number) => void;
  applyPreset: (presetId: string) => void; 
  setChordAtBar: (barIndex: number, chord: string) => void;
  setDrumPattern: (id: string) => void;
  setBassPattern: (id: string) => void;
  setBackingPattern: (id: string) => void;
  setInstrumentPreset: (id: InstrumentPresetId) => void;
  togglePlay: () => void;
  stop: () => void;
  setCurrentBar: (bar: number) => void;
  setPlaybackMode: (mode: 'section' | 'song') => void;
  setMoodTags: (tags: string[]) => void;
  openChordEditor: (barIndex: number) => void;
  closeChordEditor: () => void;
  randomize: () => void;
  setAudioInitialized: (init: boolean) => void;
  setCategoryFilter: (category: string | null) => void;
  setActiveInstrument: (id: SmplrInstrumentId) => Promise<void>;


  // Variation actions
  generateVariationSuggestions: () => void;
  applyVariation: (variationId: string) => void;
  dismissVariations: () => void;
  previewVariation: (variationId: string) => void;
  clearPreview: () => void;

  // Section Builder actions
  enableStructureMode: () => void;
  disableStructureMode: () => void;
  applyStructureTemplate: (templateId: string) => void;
  addSection: (type: SectionType, afterIndex?: number) => void;
  removeSection: (sectionId: string) => void;
  duplicateSection: (sectionId: string) => void;
  moveSection: (sectionId: string, direction: 'up' | 'down') => void;
  setActiveSection: (index: number) => void;
  updateSectionChords: (sectionId: string, chords: string[]) => void;
  updateSectionPattern: (sectionId: string, field: 'drumPatternId' | 'bassPatternId' | 'backingPatternId' | 'instrumentPresetId', value: string) => void;
  updateSectionBars: (sectionId: string, bars: number) => void;

  // Melody guide actions
  toggleMelodyGuide: () => void;
  toggleBlueNotes: () => void;
  setActiveMelodyPattern: (id: MelodyPatternId | null) => void;
  refreshMelodyData: () => void; // regenerates chordToneInfos + melodyPhrases from current chords/key
  startMelodyPreview: (patternId: MelodyPatternId) => void;
  stopMelodyPreview: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Key & Tempo
  key: 'C',
  tempo: 120,
  
  // Current chord progression
  chords: ['C', 'F', 'G', 'C'],
  selectedPresetId: null,
  
  // Pattern selections
  drumPatternId: '8beat-basic',
  bassPatternId: 'bass-8beat',
  backingPatternId: 'backing-4beat',
  instrumentPresetId: 'release-cut-piano',
  
  // Section Builder state
  sections: [],
  activeSectionIndex: 0,
  isStructureMode: false,
  
  // Playback state
  playbackMode: 'section',
  isPlaying: false,
  currentBar: -1,       
  isAudioInitialized: false,
  
  // UI state
  activeMoodTags: [],
  editingBarIndex: null,
  
  // Song search
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  categoryFilter: null,

  // Variation suggestions
  variations: [],
  showVariations: false,
  previewChords: null,
  previewChangedIndices: null,

  // Melody guide state
  melodyPhrases: [],
  activeMelodyPatternId: null,
  showMelodyGuide: false,
  includeBlueNotes: false,
  chordToneInfos: [],
  isPreviewingMelody: false,
  previewingPatternId: null,

  // Instrument state (smplr)
  activeInstrumentId: 'synth-fallback',
  instrumentLoadProgress: null,
  isInstrumentLoading: false,
  instrumentLoadError: null,


  // Actions
  setKey: (newKey: string) => {
    const { key: oldKey, chords } = get();
    if (newKey === oldKey) return;
    
    // 現在のコードを指定のキー分だけトランスポーズする
    const rootNew = newKey.split('/')[0] as NoteName;
    const rootOld = oldKey.split('/')[0] as NoteName;
    const semitones = getNoteIndex(rootNew) - getNoteIndex(rootOld);
    const transposedChords = transposeProgression(chords, semitones);
    set({ key: newKey, chords: transposedChords });
    get().refreshMelodyData();
  },

  setTempo: (tempo: number) => set({ tempo }),

  applyPreset: (presetId: string) => {
    const preset = chordPresets.find(p => p.id === presetId);
    if (!preset) return;
    
    const currentKey = get().key;
    const semitonesFromC = getNoteIndex(currentKey as NoteName) - getNoteIndex('C');
    
    // プリセットの度数表記をCキーのコード名に変換し、現在のキーへトランスポーズ
    const chordsInC = preset.degrees.map(degreeToChordInC);
    const actualChords = transposeProgression(chordsInC, semitonesFromC);
    
    set({ 
      selectedPresetId: presetId, 
      chords: actualChords 
    });
    get().refreshMelodyData();
  },

  setChordAtBar: (barIndex: number, chord: string) => {
    const newChords = [...get().chords];
    if (barIndex >= 0 && barIndex < newChords.length) {
      newChords[barIndex] = chord;
      
      const updates: Partial<AppState> = { chords: newChords, selectedPresetId: null, previewChords: null, previewChangedIndices: null };
      
      // Update active section if in structure mode
      const { isStructureMode, activeSectionIndex, sections } = get();
      if (isStructureMode && sections.length > activeSectionIndex) {
         const newSections = [...sections];
         newSections[activeSectionIndex] = {
           ...newSections[activeSectionIndex],
           chords: newChords
         };
         updates.sections = newSections;
      }
      
      set(updates);
      get().refreshMelodyData();
    }
  },

  setDrumPattern: (id: string) => {
    const { isStructureMode, activeSectionIndex, sections } = get();
    if (isStructureMode && sections.length > activeSectionIndex) {
      const newSections = [...sections];
      newSections[activeSectionIndex] = { ...newSections[activeSectionIndex], drumPatternId: id };
      set({ drumPatternId: id, sections: newSections });
    } else {
      set({ drumPatternId: id });
    }
  },
  
  setBassPattern: (id: string) => {
    const { isStructureMode, activeSectionIndex, sections } = get();
    if (isStructureMode && sections.length > activeSectionIndex) {
      const newSections = [...sections];
      newSections[activeSectionIndex] = { ...newSections[activeSectionIndex], bassPatternId: id };
      set({ bassPatternId: id, sections: newSections });
    } else {
      set({ bassPatternId: id });
    }
  },
  
  setBackingPattern: (id: string) => {
    const { isStructureMode, activeSectionIndex, sections } = get();
    if (isStructureMode && sections.length > activeSectionIndex) {
      const newSections = [...sections];
      newSections[activeSectionIndex] = { ...newSections[activeSectionIndex], backingPatternId: id };
      set({ backingPatternId: id, sections: newSections });
    } else {
      set({ backingPatternId: id });
    }
  },
  
  setInstrumentPreset: (id: InstrumentPresetId) => {
    const { isStructureMode, activeSectionIndex, sections } = get();
    if (isStructureMode && sections.length > activeSectionIndex) {
      const newSections = [...sections];
      newSections[activeSectionIndex] = { ...newSections[activeSectionIndex], instrumentPresetId: id };
      set({ instrumentPresetId: id, sections: newSections });
    } else {
      set({ instrumentPresetId: id });
    }
  },
  
  togglePlay: () => set(state => ({ isPlaying: !state.isPlaying })),
  stop: () => set({ isPlaying: false, currentBar: -1 }),
  setCurrentBar: (bar: number) => set({ currentBar: bar }),
  setPlaybackMode: (mode: 'section' | 'song') => set({ playbackMode: mode }),
  
  setMoodTags: (tags: string[]) => set({ activeMoodTags: tags }),
  openChordEditor: (barIndex: number) => set({ editingBarIndex: barIndex }),
  closeChordEditor: () => set({ editingBarIndex: null }),
  
  randomize: () => {
    const keys = ['C', 'G', 'D', 'F', 'Bb', 'Eb', 'A', 'E'];
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const randomTempo = Math.floor(Math.random() * (160 - 80 + 1)) + 80;
    const randomPreset = chordPresets[Math.floor(Math.random() * chordPresets.length)];
    const randomInstrument = instrumentPresets[Math.floor(Math.random() * instrumentPresets.length)].id;
    
    // keyとtempoをセットしてからプリセットを適用する
    set({ key: randomKey, tempo: randomTempo, instrumentPresetId: randomInstrument });
    get().applyPreset(randomPreset.id);
  },

  setAudioInitialized: (init: boolean) => set({ isAudioInitialized: init }),

  setCategoryFilter: (category: string | null) => set({ categoryFilter: category }),

  setActiveInstrument: async (id: SmplrInstrumentId) => {
    const state = get();
    if (id === state.activeInstrumentId) return;

    if (id === 'synth-fallback') {
      set({ 
        activeInstrumentId: id, 
        instrumentLoadProgress: null, 
        isInstrumentLoading: false,
        instrumentLoadError: null
      });
      return;
    }

    set({ 
      isInstrumentLoading: true, 
      instrumentLoadProgress: { loaded: 0, total: 1 },
      instrumentLoadError: null
    });

    try {
      const { ensureAudioReady } = await import('./audio/engine');
      await ensureAudioReady();
      
      const provider = getSmplrProvider();
      await provider.loadInstrument(id, (progress) => {
        set({ 
          instrumentLoadProgress: { loaded: progress.loaded, total: progress.total } 
        });
      });
      set({ 
        activeInstrumentId: id, 
        isInstrumentLoading: false, 
        instrumentLoadProgress: null 
      });
    } catch (error) {
      console.error('Failed to load instrument:', error);
      // Fall back to synth on failure
      set({ 
        activeInstrumentId: 'synth-fallback', 
        isInstrumentLoading: false, 
        instrumentLoadProgress: null,
        instrumentLoadError: '音源の読み込みに失敗しました'
      });
      
      // 3秒後にエラーを消す
      setTimeout(() => set({ instrumentLoadError: null }), 3000);
    }
  },


  // --------------------------------
  // Variation suggestion actions
  // --------------------------------

  /**
   * 現在のコード進行に対してバリエーション提案を生成し、パネルを表示する
   */
  generateVariationSuggestions: () => {
    const { isStructureMode, activeSectionIndex, sections, chords, key } = get();
    const targetChords = isStructureMode && sections.length > activeSectionIndex
      ? sections[activeSectionIndex].chords
      : chords;
    const variations = computeVariations(targetChords, key, 5);
    set({ variations, showVariations: true });
  },

  /**
   * 指定IDのバリエーションを現在のコード進行に適用する
   */
  applyVariation: (variationId: string) => {
    const { variations, isStructureMode, activeSectionIndex, sections } = get();
    const variation = variations.find(v => v.id === variationId);
    if (!variation) return;

    const newChords = [...variation.modifiedChords];

    if (isStructureMode && sections.length > activeSectionIndex) {
      const newSections = [...sections];
      newSections[activeSectionIndex] = {
        ...newSections[activeSectionIndex],
        chords: newChords,
      };
      set({
        sections: newSections,
        chords: newChords,
        showVariations: false,
        selectedPresetId: null,
        previewChords: null,
        previewChangedIndices: null,
      });
      get().refreshMelodyData();
    } else {
      set({
        chords: newChords,
        showVariations: false,
        selectedPresetId: null,
        previewChords: null,
        previewChangedIndices: null,
      });
      get().refreshMelodyData();
    }
  },

  /**
   * バリエーションパネルを非表示にする
   */
  dismissVariations: () => set({ 
    showVariations: false, 
    previewChords: null, 
    previewChangedIndices: null 
  }),

  /**
   * バリエーションを一時的にプレビュー設定する
   */
  previewVariation: (variationId: string) => {
    const { variations } = get();
    const variation = variations.find(v => v.id === variationId);
    if (!variation) return;

    set({
      previewChords: variation.modifiedChords,
      previewChangedIndices: variation.changedIndices,
    });
  },

  /**
   * プレビュー状態を解除する
   */
  clearPreview: () => set({ 
    previewChords: null, 
    previewChangedIndices: null 
  }),

  // Section Builder actions
  enableStructureMode: () => {
    const state = get();
    if (state.isStructureMode) return;
    
    // Migrate current state to a single section
    const initialSection: Section = {
      id: crypto.randomUUID(),
      type: 'verse1',
      label: '最初のセクション',
      chords: state.chords,
      bars: state.chords.length,
      drumPatternId: state.drumPatternId,
      bassPatternId: state.bassPatternId,
      backingPatternId: state.backingPatternId,
      instrumentPresetId: state.instrumentPresetId,
      repeat: 1
    };
    
    set({
      isStructureMode: true,
      sections: [initialSection],
      activeSectionIndex: 0
    });
  },

  disableStructureMode: () => {
    // Just clear sections and flag, current chords remain in flat mode state
    set({
      isStructureMode: false,
      sections: [],
      activeSectionIndex: 0
    });
  },

  applyStructureTemplate: (templateId: string) => {
    const template = STRUCTURE_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;
    
    const state = get();
    const defaults = {
      key: state.key,
      drumPatternId: state.drumPatternId,
      bassPatternId: state.bassPatternId,
      backingPatternId: state.backingPatternId,
      instrumentPresetId: state.instrumentPresetId
    };
    
    const newSections: Section[] = [];
    template.sectionSequence.forEach(seq => {
      newSections.push(createEmptySection(seq.type, defaults, newSections, seq.bars));
    });
    
    set({
      isStructureMode: true,
      sections: newSections,
      activeSectionIndex: 0
    });
    get().setActiveSection(0);
  },

  addSection: (type: SectionType, afterIndex?: number) => {
    const state = get();
    const defaults = {
      key: state.key,
      drumPatternId: state.drumPatternId,
      bassPatternId: state.bassPatternId,
      backingPatternId: state.backingPatternId,
      instrumentPresetId: state.instrumentPresetId
    };
    
    const newSection = createEmptySection(type, defaults, state.sections);
    const newSections = [...state.sections];
    
    const targetIndex = afterIndex !== undefined ? afterIndex + 1 : newSections.length;
    newSections.splice(targetIndex, 0, newSection);
    
    set({ sections: newSections });
    get().setActiveSection(targetIndex);
  },

  removeSection: (sectionId: string) => {
    const state = get();
    const newSections = state.sections.filter(s => s.id !== sectionId);
    if (newSections.length === 0) return; // Must have at least one
    
    let newIndex = state.activeSectionIndex;
    if (newIndex >= newSections.length) {
      newIndex = newSections.length - 1;
    }
    
    set({ sections: newSections });
    get().setActiveSection(newIndex);
  },

  duplicateSection: (sectionId: string) => {
    const state = get();
    const idx = state.sections.findIndex(s => s.id === sectionId);
    if (idx === -1) return;
    
    const duplicated = duplicateSectionData(state.sections[idx], state.sections);
    const newSections = [...state.sections];
    newSections.splice(idx + 1, 0, duplicated);
    
    set({ sections: newSections });
    get().setActiveSection(idx + 1);
  },

  moveSection: (sectionId: string, direction: 'up' | 'down') => {
    const state = get();
    const idx = state.sections.findIndex(s => s.id === sectionId);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === state.sections.length - 1) return;
    
    const newSections = [...state.sections];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    
    const item = newSections.splice(idx, 1)[0];
    newSections.splice(targetIdx, 0, item);
    
    const currentActiveSection = state.sections[state.activeSectionIndex];
    set({ sections: newSections });
    
    // Find where the active section went
    const newlyMovedActiveIndex = newSections.findIndex(s => s.id === currentActiveSection.id);
    get().setActiveSection(newlyMovedActiveIndex !== -1 ? newlyMovedActiveIndex : 0);
  },

  setActiveSection: (index: number) => {
    const state = get();
    if (index < 0 || index >= state.sections.length) return;
    
    const section = state.sections[index];
    set({
      activeSectionIndex: index,
      chords: [...section.chords],
      drumPatternId: section.drumPatternId,
      bassPatternId: section.bassPatternId,
      backingPatternId: section.backingPatternId,
      instrumentPresetId: section.instrumentPresetId
    });
  },

  updateSectionChords: (sectionId: string, chords: string[]) => {
    const state = get();
    const idx = state.sections.findIndex(s => s.id === sectionId);
    if (idx === -1) return;
    
    const newSections = [...state.sections];
    newSections[idx] = { ...newSections[idx], chords };
    set({ sections: newSections });
    
    if (idx === state.activeSectionIndex) {
      set({ chords: [...chords] });
    }
  },

  updateSectionPattern: (sectionId: string, field: 'drumPatternId' | 'bassPatternId' | 'backingPatternId' | 'instrumentPresetId', value: string) => {
    const state = get();
    const idx = state.sections.findIndex(s => s.id === sectionId);
    if (idx === -1) return;
    
    const newSections = [...state.sections];
    newSections[idx] = { ...newSections[idx], [field]: value };
    set({ sections: newSections });
    
    if (idx === state.activeSectionIndex) {
      set({ [field]: value });
    }
  },

  updateSectionBars: (sectionId: string, bars: number) => {
    const state = get();
    const idx = state.sections.findIndex(s => s.id === sectionId);
    if (idx === -1) return;
    
    const section = state.sections[idx];
    let newChords = [...section.chords];
    
    // Adjust chords array size
    if (bars > section.bars) {
      newChords = [...newChords, ...Array(bars - section.bars).fill(newChords[newChords.length - 1] || 'C')];
    } else if (bars < section.bars) {
      newChords = newChords.slice(0, bars);
    }
    
    const newSections = [...state.sections];
    newSections[idx] = { ...section, bars, chords: newChords };
    set({ sections: newSections });
    
    if (idx === state.activeSectionIndex) {
      set({ chords: [...newChords] });
      get().refreshMelodyData();
    }
  },

  // --------------------------------
  // Melody guide actions
  // --------------------------------

  toggleMelodyGuide: () => set(state => ({ showMelodyGuide: !state.showMelodyGuide })),
  
  toggleBlueNotes: () => {
    set(state => ({ includeBlueNotes: !state.includeBlueNotes }));
    get().refreshMelodyData();
  },

  setActiveMelodyPattern: (id: MelodyPatternId | null) => set({ activeMelodyPatternId: id }),

  refreshMelodyData: () => {
    const { chords, key, includeBlueNotes } = get();
    if (!chords || chords.length === 0) return;

    // 現在のコードに対する構成音情報を取得
    const chordToneInfos = chords.map(chord => getChordTones(chord));
    
    // メロディフレーズを生成
    const melodyPhrases = generateMelodyPhrases(chords, key, includeBlueNotes);

    set({ chordToneInfos, melodyPhrases });
  },

  startMelodyPreview: async (patternId: MelodyPatternId) => {
    const { melodyPhrases, tempo } = get();
    const phrase = melodyPhrases.find(p => p.patternId === patternId);
    if (!phrase) return;

    set({ isPreviewingMelody: true, previewingPatternId: patternId });

    const { previewMelody } = await import('./audio/engine');
    await previewMelody(phrase.notes, tempo, () => {
      set({ isPreviewingMelody: false, previewingPatternId: null });
    });
  },

  stopMelodyPreview: async () => {
    const { stopMelodyPreview } = await import('./audio/engine');
    stopMelodyPreview();
    set({ isPreviewingMelody: false, previewingPatternId: null });
  }
}));
