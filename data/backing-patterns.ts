import { BackingPattern } from '@/types/audio';

export const backingPatterns: BackingPattern[] = [
  {
    id: 'backing-pad',
    name: '白玉（全音符）',
    description: 'コード感を静かに支える（バラード等）',
    steps: [
      { type: 'BLOCK', duration: '1m' }, // 1 measure whole note
    ]
  },
  {
    id: 'backing-4beat',
    name: '4つ打ちバッキング',
    description: '4分音符でコードを押さえる',
    steps: Array.from({ length: 4 }).map(() => ({
      type: 'BLOCK',
      duration: '4n' // quarter note
    }))
  },
  {
    id: 'backing-8beat',
    name: '8ビートバッキング',
    description: 'ピアノ等の定番ポップス刻み',
    steps: Array.from({ length: 8 }).map(() => ({
      type: 'BLOCK',
      duration: '8n' // 8th note
    }))
  },
  {
    id: 'backing-syncopation',
    name: 'シンコペーション',
    description: '裏拍を強調したリズミカルなバッキング',
    steps: [
      { type: 'BLOCK', duration: '4n' },
      { type: 'BLOCK', duration: '8n' },
      { type: 'BLOCK', duration: '8n' }, // Anticipates next downbeat
      { type: 'REST', duration: '8n' },
      { type: 'BLOCK', duration: '8n' },
      { type: 'REST', duration: '8n' },
      { type: 'BLOCK', duration: '8n' },
    ]
  },
  {
    id: 'backing-arpeggio',
    name: 'アルペジオ',
    description: 'コードを分散させて弾く美しい響き',
    steps: [
      { type: 'ARP_ROOT', duration: '8n' },
      { type: 'ARP_CHORD', duration: '8n' },
      { type: 'ARP_CHORD', duration: '8n' },
      { type: 'ARP_CHORD', duration: '8n' },
      { type: 'ARP_ROOT', duration: '8n' },
      { type: 'ARP_CHORD', duration: '8n' },
      { type: 'ARP_CHORD', duration: '8n' },
      { type: 'ARP_CHORD', duration: '8n' },
    ]
  }
];
