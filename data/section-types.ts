import { SectionTypeInfo } from '@/types/music';

export const SECTION_TYPES: SectionTypeInfo[] = [
  { type: 'intro',      name: 'イントロ',           shortName: 'Intro', icon: '🎬', defaultBars: 4, description: '楽器のみ、歌なしの導入部分' },
  { type: 'verse1',     name: 'Aメロ',              shortName: 'A',     icon: '🅰️', defaultBars: 8, description: '歌い出し、物語の始まり' },
  { type: 'verse1-v2',  name: 'Aメロ パターン2',    shortName: "A'",    icon: '🅰️', defaultBars: 8, description: 'Aメロの変化形（2番など）' },
  { type: 'verse2',     name: 'Bメロ',              shortName: 'B',     icon: '🅱️', defaultBars: 8, description: '展開部分、サビへの橋渡し' },
  { type: 'verse2-v2',  name: 'Bメロ パターン2',    shortName: "B'",    icon: '🅱️', defaultBars: 8, description: 'Bメロの変化形' },
  { type: 'chorus',     name: 'サビ',               shortName: 'サビ',  icon: '🔥', defaultBars: 8, description: '楽曲のクライマックス' },
  { type: 'chorus-v2',  name: 'サビ パターン2',     shortName: "サビ'", icon: '🔥', defaultBars: 8, description: 'サビの変化形（ラスサビ等）' },
  { type: 'verse3',     name: 'Cメロ',              shortName: 'C',     icon: '©️', defaultBars: 8, description: '新しい展開、落ちサビ前' },
  { type: 'verse4',     name: 'Dメロ',              shortName: 'D',     icon: '🇩', defaultBars: 4, description: 'さらなる展開（稀）' },
  { type: 'bridge',     name: '間奏',               shortName: '間奏',  icon: '🎸', defaultBars: 4, description: '楽器ソロ、ブレイク' },
  { type: 'outro',      name: '後奏',               shortName: 'Outro', icon: '🏁', defaultBars: 4, description: 'エンディング' },
];
