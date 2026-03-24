import { DrumPattern } from '@/types/audio';

export const drumPatterns: DrumPattern[] = [
  {
    id: '8beat-basic',
    name: '8ビート（基本）',
    description: '標準的なポップス・ロック向け',
    steps: Array.from({ length: 16 }).map((_, i) => ({
      kick: i === 0 || i === 8, // 1, 3拍目
      snare: i === 4 || i === 12, // 2, 4拍目
      hihatClosed: i % 2 === 0, // 8分音符で刻む
    }))
  },
  {
    id: '4otsuchi',
    name: '4つ打ち',
    description: 'ダンスミュージック・ボカロックの定番',
    steps: Array.from({ length: 16 }).map((_, i) => ({
      kick: i % 4 === 0, // 4分音符で刻む
      snare: i === 4 || i === 12, // 2, 4拍目
      hihatClosed: i % 2 === 0 && i % 4 !== 2, // 裏拍メイン
      hihatOpen: i % 4 === 2 // 裏打ちのアクセント
    }))
  },
  {
    id: '16beat-funk',
    name: '16ビート（ファンク）',
    description: '細かく跳ねるようなお洒落なリズム',
    steps: [
      { kick: true, snare: false, hihatClosed: true },
      { kick: false, snare: false, hihatClosed: false },
      { kick: false, snare: false, hihatClosed: true },
      { kick: true, snare: false, hihatClosed: true },
      
      { kick: false, snare: true, hihatClosed: true },
      { kick: false, snare: false, hihatClosed: false },
      { kick: false, snare: false, hihatClosed: true },
      { kick: false, snare: false, hihatClosed: true },
      
      { kick: true, snare: false, hihatClosed: true },
      { kick: false, snare: false, hihatClosed: true },
      { kick: true, snare: false, hihatClosed: true },
      { kick: false, snare: false, hihatClosed: false },
      
      { kick: false, snare: true, hihatClosed: true },
      { kick: false, snare: false, hihatClosed: true },
      { kick: false, snare: false, hihatClosed: true },
      { kick: false, snare: false, hihatClosed: true },
    ]
  },
  {
    id: 'half-time',
    name: 'ハーフタイム',
    description: 'ゆったりした大きなノリ',
    steps: Array.from({ length: 16 }).map((_, i) => ({
      kick: i === 0 || i === 10,
      snare: i === 8, // 3拍目のみ
      hihatClosed: i % 4 === 0, // 4分音符
    }))
  },
  {
    id: 'jazz-swing',
    name: 'ジャズスウィング',
    description: 'ジャズ風のスウィングリズム',
    steps: Array.from({ length: 16 }, (_, i) => ({
      kick: i === 0 || i === 12,
      snare: i === 7 || i === 15,
      hihatClosed: i % 4 === 0 || i % 4 === 3,
      hihatOpen: i === 6 || i === 14,
    }))
  }
];
