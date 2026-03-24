import { BassPattern } from '@/types/audio';

export const bassPatterns: BassPattern[] = [
  {
    id: 'bass-basic',
    name: 'ルート全音符',
    description: 'コードのルート音を長く伸ばす',
    steps: [
      { type: 'ROOT', duration: '1m' }, // 1 measure
    ]
  },
  {
    id: 'bass-8beat',
    name: '8ビート刻み',
    description: 'ロック系の定番ルート弾き',
    steps: Array.from({ length: 8 }).map(() => ({
      type: 'ROOT', 
      duration: '8n' // 8th note
    }))
  },
  {
    id: 'bass-octave',
    name: 'オクターブ刻み',
    description: 'ディスコやダンス系の定番',
    steps: Array.from({ length: 4 }).flatMap(() => [
      { type: 'ROOT', duration: '8n' },
      { type: 'OCT',  duration: '8n' }, // octave up
    ])
  },
  {
    id: 'bass-syncopation',
    name: 'シンコペーション',
    description: '裏拍で食うエモいベース',
    steps: [
      { type: 'ROOT', duration: '4n' },
      { type: 'ROOT', duration: '8n' },
      { type: 'ROOT', duration: '8n' }, // Syncopation into next beat
      { type: 'REST', duration: '8n' },
      { type: 'ROOT', duration: '8n' },
      { type: 'REST', duration: '8n' },
      { type: 'ROOT', duration: '8n' },
    ]
  },
  {
    id: 'bass-walking',
    name: 'ウォーキングベース',
    description: 'ジャズ風の4分音符歩行ベースライン',
    steps: [
      { type: 'ROOT',  duration: '4n' },
      { type: 'THIRD', duration: '4n' },
      { type: 'FIFTH', duration: '4n' },
      { type: 'THIRD', duration: '4n' },
    ]
  },
  {
    id: 'bass-bossanova',
    name: 'ボサノバ',
    description: 'ブラジル音楽風のシンコペーションベース',
    steps: [
      { type: 'ROOT',  duration: '8n' },
      { type: 'REST',  duration: '8n' },
      { type: 'REST',  duration: '8n' },
      { type: 'FIFTH', duration: '8n' },
      { type: 'ROOT',  duration: '8n' },
      { type: 'REST',  duration: '8n' },
      { type: 'REST',  duration: '8n' },
      { type: 'REST',  duration: '8n' },
    ]
  },
  {
    id: 'bass-reggae',
    name: 'レゲエ（ワンドロップ）',
    description: '1拍目を抜いたレゲエ特有のベースライン',
    steps: [
      { type: 'REST',  duration: '4n' },
      { type: 'REST',  duration: '4n' },
      { type: 'ROOT',  duration: '4n' },
      { type: 'FIFTH', duration: '4n' },
    ]
  }
];
