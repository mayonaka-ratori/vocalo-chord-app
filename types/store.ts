import { NoteName } from './music';

export interface Section {
  id: string; // 一意のID（uuid等）
  label: string; // 'Aメロ', 'Bメロ', 'サビ'
  chords: string[]; // 実際のコード名配列 (例：['C', 'Am', 'F', 'G'])
  length: number; // 小節数
}

export interface SongStructure {
  bpm: number;
  key: NoteName; // 現在のキー
  sections: Section[];
}

export interface RhythmState {
  drumPatternId: string;
  bassPatternId: string;
  backingPatternId: string;
}

export interface PlaybackState {
  isPlaying: boolean;
  currentSectionId: string | null;
  currentMeasureIndex: number; // 再生中の小節インデックス
}

export interface AppState {
  // ソング情報
  song: SongStructure;
  
  // リズム設定
  rhythm: RhythmState;

  // 再生情報
  playback: PlaybackState;

  // UI状態
  ui: {
    selectedSectionId: string | null; // 現在編集中のセクション
    selectedMeasureIndex: number | null; // 現在編集中の小節
    isModalOpen: boolean; 
  };
  
  // アクション (Actions)
  actions: {
    setBpm: (bpm: number) => void;
    setKey: (key: NoteName) => void;
    updateSectionChords: (sectionId: string, chords: string[]) => void;
    addSection: (section: Section) => void;
    removeSection: (sectionId: string) => void;
    
    setDrumPattern: (id: string) => void;
    setBassPattern: (id: string) => void;
    setBackingPattern: (id: string) => void;

    togglePlayback: () => void;
    stopPlayback: () => void;
    setCurrentMeasure: (index: number) => void;
    
    selectMeasure: (sectionId: string, measureIndex: number) => void;
    closeModal: () => void;
  };
}
