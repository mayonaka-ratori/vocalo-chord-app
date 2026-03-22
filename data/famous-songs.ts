import { FamousSong } from '@/types/music';

// 有名曲コード進行データベース。歌詞は含めない。
export const famousSongs: FamousSong[] = [
  {
    id: 'yoru-ni-kakeru',
    title: '夜に駆ける',
    artist: 'YOASOBI',
    year: 2019,
    key: 'Eb',
    bpm: 130,
    sections: [
      { label: 'Aメロ', chords: ['Abmaj7', 'G7', 'Cm7', 'Bb7'] },
      { label: 'サビ', chords: ['Abmaj7', 'G7', 'Cm7', 'Bbm7', 'Eb7'] }
    ],
    tags: ['オシャレ', '中毒性', 'ボカロP'],
    searchAliases: ['よるにかける', 'yoru ni kakeru', 'racing into the night', 'yorunikakeru']
  },
  {
    id: 'idol',
    title: 'アイドル',
    artist: 'YOASOBI',
    year: 2023,
    key: 'Ab',
    bpm: 166,
    sections: [
      { label: 'Aメロ', chords: ['Fm', 'Db', 'Eb', 'Cm'] },
      { label: 'サビ', chords: ['Db', 'Eb', 'Cm', 'Fm', 'Dbmaj7', 'C7', 'Fm', 'Eb'] }
    ],
    tags: ['エモい', '疾走感', '中毒性'],
    searchAliases: ['あいどる', 'oshi no ko', '推しの子']
  },
  {
    id: 'senbonzakura',
    title: '千本桜',
    artist: '黒うさP',
    year: 2011,
    key: 'Bm',
    bpm: 154,
    sections: [
      { label: 'Aメロ', chords: ['Bm', 'F#m', 'G', 'A'] },
      { label: 'サビ', chords: ['G', 'A', 'F#m', 'Bm', 'G', 'A', 'F#m', 'Bm'] }
    ],
    tags: ['疾走感', 'エモい'],
    searchAliases: ['せんぼんざくら', 'senbonzakura', '千本桜', 'kuro usa p', '黒うさ']
  },
  {
    id: 'charles',
    title: 'シャルル',
    artist: 'バルーン',
    year: 2016,
    key: 'G',
    bpm: 167,
    sections: [
      { label: 'Aメロ', chords: ['Em', 'C', 'G', "D"] },
      { label: 'サビ', chords: ['C', 'D', 'Bm', 'Em', 'C', 'D', 'G', 'G'] }
    ],
    tags: ['エモい', '疾走感', '切ない'],
    searchAliases: ['しゃるる', 'sharuru', 'balloon', 'バルーン']
  },
  {
    id: 'lemon',
    title: 'Lemon',
    artist: '米津玄師',
    year: 2018,
    key: 'G#m',
    bpm: 87,
    sections: [
      { label: 'Aメロ', chords: ['G#m', 'E', 'B', 'F#'] },
      { label: 'サビ', chords: ['E', 'F#', 'D#m', 'G#m', 'E', 'F#', 'B', 'B'] }
    ],
    tags: ['切ない', 'エモい'],
    searchAliases: ['れもん', 'yonezu kenshi', '米津玄師', 'kenshi yonezu']
  },
  {
    id: 'roki',
    title: 'ロキ',
    artist: 'みきとP',
    year: 2018,
    key: 'Bm',
    bpm: 150,
    sections: [
      { label: 'Aメロ', chords: ['Bm', 'Bm', 'G', 'A'] },
      { label: 'サビ', chords: ['G', 'A', 'F#m', 'Bm', 'G', 'A', 'Bm', 'Bm'] }
    ],
    tags: ['疾走感', 'ダーク', '中毒性'],
    searchAliases: ['ろき', 'mikito p', 'みきとp']
  },
  {
    id: 'phony',
    title: 'フォニイ',
    artist: 'ツミキ',
    year: 2021,
    key: 'Dm',
    bpm: 160,
    sections: [
      { label: 'Aメロ', chords: ['Dm', 'Bb', 'C', 'Am'] },
      { label: 'サビ', chords: ['Bb', 'C', 'Am', 'Dm', 'Bb', 'C', 'Dm', 'Dm'] }
    ],
    tags: ['疾走感', '中毒性', 'ダーク'],
    searchAliases: ['ふぉにい', 'phony', 'tsumiki', 'ツミキ']
  },
  {
    id: 'goodbye-sengen',
    title: 'グッバイ宣言',
    artist: 'Chinozo',
    year: 2020,
    key: 'D',
    bpm: 190,
    sections: [
      { label: 'サビ', chords: ['D', 'A', 'Bm', 'G', 'D', 'A', 'Bm', 'G'] }
    ],
    tags: ['明るい', '疾走感'],
    searchAliases: ['ぐっばいせんげん', 'goodbye declaration', 'goodbye sengen', 'chinozo']
  },
  {
    id: 'king',
    title: 'KING',
    artist: 'Kanaria',
    year: 2020,
    key: 'Gm',
    bpm: 146,
    sections: [
      { label: 'Aメロ', chords: ['Gm', 'Eb', "F", 'D'] },
      { label: 'サビ', chords: ['Eb', 'F', 'Dm', 'Gm', 'Eb', 'F', 'Gm', 'Gm'] }
    ],
    tags: ['ダーク', '中毒性', '疾走感'],
    searchAliases: ['きんぐ', 'kanaria', 'かなりあ']
  },
  {
    id: 'melt',
    title: 'メルト',
    artist: 'ryo(supercell)',
    year: 2007,
    key: 'D',
    bpm: 152,
    sections: [
      { label: 'Aメロ', chords: ['D', 'A', 'Bm', 'F#m', 'G', 'D', 'G', 'A'] },
      { label: 'サビ', chords: ['G', 'A', 'F#m', 'Bm', 'G', 'A', 'D', 'D'] }
    ],
    tags: ['明るい', '切ない'],
    searchAliases: ['めると', 'melt', 'ryo', 'supercell']
  },
  {
    id: 'lost-ones-weeping',
    title: 'ロストワンの号哭',
    artist: 'Neru',
    year: 2013,
    key: 'Bm',
    bpm: 162,
    sections: [
      { label: 'サビ', chords: ['Bm', 'G', 'A', 'D', 'Bm', 'G', "A", "Bm"] }
    ],
    tags: ['エモい', '疾走感', 'ダーク'],
    searchAliases: ['ろすとわんのごうこく', 'lost ones weeping', 'neru', 'ねる']
  },
  {
    id: 'villain',
    title: 'ヴィラン',
    artist: 'てにをは',
    year: 2020,
    key: 'Am',
    bpm: 136,
    sections: [
      { label: 'Aメロ', chords: ['Am', 'F', 'C', 'G'] },
      { label: 'サビ', chords: ['F', 'G', 'Em', 'Am', 'F', 'G', 'Am', 'Am'] }
    ],
    tags: ['ダーク', 'オシャレ', '中毒性'],
    searchAliases: ['ヴィラン', 'びらん', 'villain', 'teniwoha', 'てにをは']
  }
];
