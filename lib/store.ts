import { create } from 'zustand';
import { SongSearchResult, NoteName } from '@/types/music';
import { chordPresets } from '@/data/presets';
import { transposeProgression } from './music/transpose';
import { getNoteIndex } from './music/chords';

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
  
  // Playback state
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
  
  // Actions
  setKey: (key: string) => void;
  setTempo: (tempo: number) => void;
  applyPreset: (presetId: string) => void; 
  setChordAtBar: (barIndex: number, chord: string) => void;
  setDrumPattern: (id: string) => void;
  setBassPattern: (id: string) => void;
  setBackingPattern: (id: string) => void;
  togglePlay: () => void;
  stop: () => void;
  setCurrentBar: (bar: number) => void;
  setMoodTags: (tags: string[]) => void;
  openChordEditor: (barIndex: number) => void;
  closeChordEditor: () => void;
  randomize: () => void;
  setAudioInitialized: (init: boolean) => void;
}

/**
 * 度数表記を Cメジャーキーの実際のコード名に変換する簡易ヘルパー
 * 例: 'IVmaj7' -> 'Fmaj7', 'VIm' -> 'Am'
 */
function degreeToChordInC(degree: string): string {
  if (degree === 'V7/II') return 'A7';
  if (degree === 'V7/VI') return 'E7';
  
  let c = degree;
  // 長いものから置換する
  c = c.replace('IIIm', 'Em');
  c = c.replace('VIm', 'Am');
  c = c.replace('IIm', 'Dm');
  c = c.replace('IVm', 'Fm');
  c = c.replace('VII', 'B'); 
  c = c.replace('IV', 'F');
  c = c.replace('III', 'E'); 
  c = c.replace('VI', 'A');
  c = c.replace('II', 'D');
  c = c.replace('I', 'C');
  c = c.replace('V', 'G');
  return c; // 7 や maj7 はそのまま残る
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
  
  // Playback state
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
  },

  setChordAtBar: (barIndex: number, chord: string) => {
    const newChords = [...get().chords];
    if (barIndex >= 0 && barIndex < newChords.length) {
      newChords[barIndex] = chord;
      set({ chords: newChords, selectedPresetId: null }); // 手動変更時はプリセット選択状態を解除
    }
  },

  setDrumPattern: (id: string) => set({ drumPatternId: id }),
  setBassPattern: (id: string) => set({ bassPatternId: id }),
  setBackingPattern: (id: string) => set({ backingPatternId: id }),
  
  togglePlay: () => set(state => ({ isPlaying: !state.isPlaying })),
  stop: () => set({ isPlaying: false, currentBar: -1 }),
  setCurrentBar: (bar: number) => set({ currentBar: bar }),
  
  setMoodTags: (tags: string[]) => set({ activeMoodTags: tags }),
  openChordEditor: (barIndex: number) => set({ editingBarIndex: barIndex }),
  closeChordEditor: () => set({ editingBarIndex: null }),
  
  randomize: () => {
    const keys = ['C', 'G', 'D', 'F', 'Bb', 'Eb', 'A', 'E'];
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const randomTempo = Math.floor(Math.random() * (160 - 80 + 1)) + 80;
    const randomPreset = chordPresets[Math.floor(Math.random() * chordPresets.length)];
    
    // keyとtempoをセットしてからプリセットを適用する
    set({ key: randomKey, tempo: randomTempo });
    get().applyPreset(randomPreset.id);
  },

  setAudioInitialized: (init: boolean) => set({ isAudioInitialized: init })
}));
