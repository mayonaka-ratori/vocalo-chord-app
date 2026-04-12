import {
  NoteName,
  ChordToneInfo,
  MelodyPhrase,
  MelodyPatternId,
  MelodyNote
} from '@/types/music';
import { parseChord, getNoteIndex, getNoteFromIndexForKey } from './chords';

// ─── Unified NoteGenerator interface ───────────────────────────────────────

interface NoteGenContext {
  info: ChordToneInfo;
  chordIndex: number;
  totalChords: number;
  beatsPerChord: number;
  includeBlueNotes: boolean;
  keyRoot: string;
}

type NoteGenerator = (ctx: NoteGenContext) => MelodyNote[];

function makeNote(
  midi: number,
  beat: number,
  duration: number,
  info: ChordToneInfo,
  velocity: number = 80,
  keyRoot: string = '',
): MelodyNote {
  return {
    midi,
    name: `${getNoteFromIndexForKey(midi % 12, keyRoot)}${Math.floor(midi / 12) - 1}`,
    duration,
    beat,
    velocity,
    isChordTone: info.tones.includes(midi),
    isBlueNote: info.blueNotes.includes(midi),
  };
}

/**
 * コード名から構成音をMIDI番号として取得する
 * @param chordName コード名 (例: "Am7")
 * @param baseOctave ベースとなるオクターブ (デフォルト 4 = 中央ハ)
 */
export function getChordTones(chordName: string, baseOctave: number = 4): ChordToneInfo {
  const { root, quality } = parseChord(chordName);
  const rootIndex = getNoteIndex(root);
  const baseMidi = (baseOctave + 1) * 12 + rootIndex;

  let intervals: number[] = [0, 4, 7]; // Default Major

  switch (quality) {
    case '':
    case 'M':
      intervals = [0, 4, 7];
      break;
    case 'm':
      intervals = [0, 3, 7];
      break;
    case '7':
      intervals = [0, 4, 7, 10];
      break;
    case 'm7':
      intervals = [0, 3, 7, 10];
      break;
    case 'M7':
    case 'maj7':
      intervals = [0, 4, 7, 11];
      break;
    case 'dim':
      intervals = [0, 3, 6];
      break;
    case 'aug':
      intervals = [0, 4, 8];
      break;
    case 'sus4':
      intervals = [0, 5, 7];
      break;
    case 'sus2':
      intervals = [0, 2, 7];
      break;
    case 'add9':
      intervals = [0, 4, 7, 14];
      break;
    case '9':
      intervals = [0, 4, 7, 10, 14];
      break;
    case 'm9':
      intervals = [0, 3, 7, 10, 14];
      break;
  }

  const tones = intervals.map(interval => baseMidi + interval);
  const toneNames = tones.map(midi => {
    const note = getNoteFromIndexForKey(midi % 12, root);
    const octave = Math.floor(midi / 12) - 1;
    return `${note}${octave}`;
  });

  // スケール音（コードのルートに基づいたメジャースケール）
  const scaleIntervals = [0, 2, 4, 5, 7, 9, 11];
  const scaleTones = scaleIntervals.map(interval => baseMidi + interval);

  // ブルーノート (b3, b5, b7 relative to root)
  const blueNoteOffsets = [3, 6, 10];
  const blueNotes = blueNoteOffsets.map(offset => baseMidi + offset);

  return {
    chord: chordName,
    tones,
    toneNames,
    scaleTones,
    blueNotes
  };
}

/**
 * 特定のキーのスケール音（1オクターブ分）をMIDI番号で取得する
 */
export function getScaleNotes(key: string, baseOctave: number = 4): number[] {
  const rootNote = key.split('/')[0] as NoteName;
  const rootIndex = getNoteIndex(rootNote);
  const baseMidi = (baseOctave + 1) * 12 + rootIndex;

  // とりあえずメジャースケール
  const majorScale = [0, 2, 4, 5, 7, 9, 11];
  return majorScale.map(interval => baseMidi + interval);
}

/**
 * 特定のキーのブルーノートをMIDI番号で取得する
 */
export function getBlueNotes(key: string, baseOctave: number = 4): number[] {
  const rootNote = key.split('/')[0] as NoteName;
  const rootIndex = getNoteIndex(rootNote);
  const baseMidi = (baseOctave + 1) * 12 + rootIndex;

  // b3, b5, b7
  return [3, 6, 10].map(offset => baseMidi + offset);
}

// ─── Pattern metadata ───────────────────────────────────────────────────────

const PATTERN_META: { id: MelodyPatternId; name: string; icon: string; description: string }[] = [
  { id: 'chord-tone-ascend',  name: 'コードトーン上昇', icon: '📈', description: 'コードの構成音を下から順に（4分音符）' },
  { id: 'chord-tone-descend', name: 'コードトーン下降', icon: '📉', description: 'コードの構成音を上から順に（4分音符）' },
  { id: 'arpeggio-up',        name: 'アルペジオ上昇',   icon: '✨', description: '分散和音で軽やかに上昇（8分音符）' },
  { id: 'arpeggio-down',      name: 'アルペジオ下降',   icon: '🌊', description: '分散和音でさらさらと下降（8分音符）' },
  { id: 'stepwise-ascend',    name: '順次進行上昇',     icon: '🚶', description: 'スケールに沿って一歩ずつ上昇' },
  { id: 'stepwise-descend',   name: '順次進行下降',     icon: '🏃', description: 'スケールに沿って一歩ずつ下降' },
  { id: '16th-arpeggio',      name: '16分アルペジオ',   icon: '⚡', description: '高速な分散和音で駆け上がる（16分音符）' },
  { id: 'syncopated',         name: 'シンコペーション', icon: '🎭', description: '裏拍を活かしたリズミカルなメロディ' },
];

// ─── Note generators (one pure function per pattern) ────────────────────────

const NOTE_GENERATORS: Record<MelodyPatternId, NoteGenerator> = {

  'chord-tone-ascend': ({ info, chordIndex, beatsPerChord, includeBlueNotes, keyRoot }) => {
    let midis = [...info.tones];
    if (includeBlueNotes) midis.push(info.blueNotes[2]);
    midis = midis.slice(0, 4);
    const beat0 = chordIndex * beatsPerChord;
    return midis.map((midi, i) => makeNote(midi, beat0 + i * 1, 1, info, 80, keyRoot));
  },

  'chord-tone-descend': ({ info, chordIndex, beatsPerChord, includeBlueNotes, keyRoot }) => {
    let midis = [...info.tones].reverse();
    if (includeBlueNotes) midis.push(info.blueNotes[2]);
    midis = midis.slice(0, 4);
    const beat0 = chordIndex * beatsPerChord;
    return midis.map((midi, i) => makeNote(midi, beat0 + i * 1, 1, info, 80, keyRoot));
  },

  'arpeggio-up': ({ info, chordIndex, beatsPerChord, includeBlueNotes, keyRoot }) => {
    let midis = [...info.tones, info.tones[0] + 12];
    if (includeBlueNotes) midis.splice(2, 0, info.blueNotes[2]);
    midis = [...midis, ...midis].slice(0, 8);
    const beat0 = chordIndex * beatsPerChord;
    return midis.map((midi, i) => makeNote(midi, beat0 + i * 0.5, 0.5, info, 80, keyRoot));
  },

  'arpeggio-down': ({ info, chordIndex, beatsPerChord, includeBlueNotes, keyRoot }) => {
    let midis = [info.tones[0] + 12, ...[...info.tones].reverse()];
    if (includeBlueNotes) midis.splice(2, 0, info.blueNotes[0]);
    midis = [...midis, ...midis].slice(0, 8);
    const beat0 = chordIndex * beatsPerChord;
    return midis.map((midi, i) => makeNote(midi, beat0 + i * 0.5, 0.5, info, 80, keyRoot));
  },

  'stepwise-ascend': ({ info, chordIndex, beatsPerChord, includeBlueNotes, keyRoot }) => {
    const extended = [...info.scaleTones, ...info.scaleTones.map(n => n + 12)];
    const midis = extended.slice(0, 4);
    if (includeBlueNotes) midis[3] = info.blueNotes[2];
    const beat0 = chordIndex * beatsPerChord;
    return midis.map((midi, i) => makeNote(midi, beat0 + i * 1, 1, info, 80, keyRoot));
  },

  'stepwise-descend': ({ info, chordIndex, beatsPerChord, keyRoot }) => {
    const extended = [...info.scaleTones.map(n => n - 12), ...info.scaleTones];
    const midis = [...extended].reverse().slice(0, 4);
    const beat0 = chordIndex * beatsPerChord;
    return midis.map((midi, i) => makeNote(midi, beat0 + i * 1, 1, info, 80, keyRoot));
  },

  '16th-arpeggio': ({ info, chordIndex, beatsPerChord, includeBlueNotes, keyRoot }) => {
    const tones = [...info.tones, info.tones[0] + 12];
    if (includeBlueNotes) tones.splice(2, 0, info.blueNotes[2]);
    const beat0 = chordIndex * beatsPerChord;
    return Array.from({ length: 16 }, (_, i) => {
      const midi = tones[i % tones.length] + (Math.floor(i / tones.length) % 2 === 1 ? 12 : 0);
      return makeNote(midi, beat0 + i * 0.25, 0.25, info, i % 4 === 0 ? 90 : 70, keyRoot);
    });
  },

  'syncopated': ({ info, chordIndex, beatsPerChord, includeBlueNotes, keyRoot }) => {
    const beat0 = chordIndex * beatsPerChord;
    const pattern = [
      { beatOffset: 0,    dur: 0.75, toneIdx: 0, vel: 75 },
      { beatOffset: 0.75, dur: 0.75, toneIdx: 1, vel: 95 },
      { beatOffset: 1.5,  dur: 1.0,  toneIdx: 2, vel: 80 },
      { beatOffset: 2.5,  dur: 0.5,  toneIdx: 1, vel: 95 },
      { beatOffset: 3.0,  dur: 1.0,  toneIdx: 0, vel: 75 },
    ];
    return pattern.map(sp => {
      const baseMidi = info.tones[sp.toneIdx % info.tones.length];
      const midi = (includeBlueNotes && sp.toneIdx === 1) ? info.blueNotes[2] : baseMidi;
      return makeNote(midi, beat0 + sp.beatOffset, sp.dur, info, sp.vel, keyRoot);
    });
  },
};

// ─── Main entry point ────────────────────────────────────────────────────────

/**
 * コード進行に基づいたメロディーフレーズを生成する
 */
export function generateMelodyPhrases(
  chords: string[],
  key: string,
  includeBlueNotes: boolean,
  beatsPerChord: number = 4
): MelodyPhrase[] {
  const keyRoot = key.split('/')[0];
  const chordsKey = chords.join('-').replace(/#/g, 's').replace(/[^a-zA-Z0-9]/g, '');

  return PATTERN_META.map(({ id, name, icon, description }) => {
    const generator = NOTE_GENERATORS[id];
    const notes = chords.flatMap((chord, chordIndex) =>
      generator({
        info: getChordTones(chord),
        chordIndex,
        totalChords: chords.length,
        beatsPerChord,
        includeBlueNotes,
        keyRoot,
      })
    );
    return {
      id: `${id}-${chordsKey}`,
      patternId: id,
      name,
      icon,
      description,
      notes,
      totalBeats: chords.length * beatsPerChord,
    };
  });
}
