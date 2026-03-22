import type * as ToneType from 'tone';
import { getTone } from './engine';
import { playDrumStep } from './drummer';
import { playBassStep } from './bassist';
import { playBackingStep } from './backing';

import { DrumPattern, BassPattern, BackingPattern } from '@/types/audio';

export interface PlaybackStateConfig {
  chords: string[]; // 全小節のコード（1小節1コードと想定）
  bpm: number;
  drumPattern: DrumPattern | null;
  bassPattern: BassPattern | null;
  backingPattern: BackingPattern | null;
}

let Tone: typeof ToneType | null = null;
let playbackLoop: ToneType.Loop | null = null;
let currentConfig: PlaybackStateConfig | null = null;

let onBarChangeCallback: ((barIndex: number) => void) | null = null;
let currentStepGlobal = 0; // 16分音符ごとのステップ経過

export function setOnBarChangeCallback(cb: (barIndex: number) => void) {
  onBarChangeCallback = cb;
}

export function updatePlaybackConfig(config: PlaybackStateConfig) {
  if (currentConfig) {
    currentConfig = config;
    if (Tone) Tone.Transport.bpm.value = config.bpm;
  }
}

export async function updateTempo(bpm: number) {
  Tone = await getTone();
  Tone.Transport.bpm.value = bpm;
}

/**
 * 再生ループを開始する
 */
export async function startPlayback(config: PlaybackStateConfig) {
  Tone = await getTone();
  
  if (!Tone) return;

  currentConfig = config;
  Tone.Transport.bpm.value = config.bpm;
  
  // すでにループがあれば一度クリア
  if (playbackLoop) {
    playbackLoop.stop();
    playbackLoop.dispose();
  }

  currentStepGlobal = 0;
  if (onBarChangeCallback) onBarChangeCallback(0);

  // 16分音符 ('16n') スケールでループ
  playbackLoop = new Tone.Loop((time) => {
    if (!currentConfig) return;

    // 現在の小節番号を計算（1小節 = 16分音符 × 16ステップ とすると、4/4拍子想定）
    const stepsPerBar = 16;
    const currentBar = Math.floor(currentStepGlobal / stepsPerBar);
    
    // 全小節数を過ぎたらループ
    const activeBar = currentBar % currentConfig.chords.length;

    // バーが変わった瞬間にUI通知
    if (currentStepGlobal % stepsPerBar === 0) {
      if (onBarChangeCallback) {
        // Tone.Draw で描画タイミングと音声タイミングを合わせる
        Tone!.Draw.schedule(() => {
          if (onBarChangeCallback) onBarChangeCallback(activeBar);
        }, time);
      }
    }

    const currentChord = currentConfig.chords[activeBar];

    // ドラム再生
    if (currentConfig.drumPattern) {
      playDrumStep(currentConfig.drumPattern, currentStepGlobal, time);
    }
    
    // ベース再生
    if (currentConfig.bassPattern) {
      playBassStep(currentConfig.bassPattern, currentStepGlobal, time, currentChord);
    }

    // バッキング再生
    if (currentConfig.backingPattern) {
      playBackingStep(currentConfig.backingPattern, currentStepGlobal, time, currentChord);
    }

    currentStepGlobal++;

  }, '16n');

  playbackLoop.start(0);
  Tone!.Transport.start();
}

/**
 * 再生を停止する
 */
export async function stopPlayback() {
  if (!Tone) return;

  Tone.Transport.stop();
  
  if (playbackLoop) {
    playbackLoop.stop();
    playbackLoop.dispose();
    playbackLoop = null;
  }
  
  currentStepGlobal = 0;
}
