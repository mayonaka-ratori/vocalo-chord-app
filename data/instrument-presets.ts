import { InstrumentPreset } from '@/types/audio';

export const instrumentPresets: InstrumentPreset[] = [
  {
    id: 'release-cut-piano',
    name: 'リスカピアノ',
    icon: '🎹',
    description: '余韻バッサリ、歯切れ最強ピアノ',
    tags: ['エモい', 'オシャレ'],
    exampleSongs: ['夜に駆ける', 'アイドル']
  },
  {
    id: 'pluck-synth',
    name: 'プラック',
    icon: '✨',
    description: '弦を弾いたようなクールな電子音',
    tags: ['疾走感', 'クール'],
    exampleSongs: ['ロキ', 'ベノム']
  },
  {
    id: 'synth-pad',
    name: 'シンセパッド',
    icon: '🌊',
    description: 'ふわっと空間を包む持続音',
    tags: ['切ない', '壮大'],
    exampleSongs: ['メルト', '命に嫌われている']
  },
  {
    id: 'bell-tone',
    name: 'ベル / キラキラ',
    icon: '🔔',
    description: '金属的なキラキラサウンド',
    tags: ['明るい', '中毒性'],
    exampleSongs: ['千本桜', 'テレカクシ思春期']
  },
  {
    id: 'rock-guitar',
    name: 'ロックギター',
    icon: '🎸',
    description: '歪んだパワーコード風サウンド',
    tags: ['疾走感', 'ダーク'],
    exampleSongs: ['ロストワンの号哭', 'ゴーストルール']
  },
  {
    id: '8bit-chiptune',
    name: '8bit / チップチューン',
    icon: '👾',
    description: 'ファミコン風レトロサウンド',
    tags: ['中毒性', 'レトロ'],
    exampleSongs: ['ワールドイズマイン']
  },
  {
    id: 'strings',
    name: 'ストリングス',
    icon: '🎻',
    description: '壮大な弦楽アンサンブル',
    tags: ['切ない', '壮大'],
    exampleSongs: ['シャルル', '花に亡霊']
  },
  {
    id: 'edm-bass',
    name: 'EDMベース',
    icon: '💥',
    description: 'うねる重低音シンセベース',
    tags: ['ダーク', '中毒性'],
    exampleSongs: ['脳漿炸裂ガール']
  }
];
