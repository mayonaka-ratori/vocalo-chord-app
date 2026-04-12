import type * as ToneType from 'tone';
import { getChordSynth, getBassSynth, getMelodySynth, getTone, getToneSync } from './engine';
import { getSmplrProvider } from './smplr-provider';
import { useStore } from '../store';
import { getVolumeProfile, SYNTH_VOLUME_PROFILE } from './volume-config';

/**
 * 統合されたノートイベント情報
 */
export interface UnifiedNoteEvent {
  notes: string[];        // 例: ['C4', 'E4', 'G4']
  duration: number;       // 秒単位
  time: number;           // AudioContext の時間
  velocity?: number;      // 0-127 (smplr用)
}

/**
 * 楽器の選択状態に応じて、smplr または Tone.js のシンセで和音を再生する
 */
export async function playUnifiedChord(event: UnifiedNoteEvent): Promise<void> {
  const store = useStore.getState();
  const instrumentId = store.activeInstrumentId;
  const provider = getSmplrProvider();
  const profile = getVolumeProfile(instrumentId);

  // フォールバック条件: 楽器がシンセ、または smplr のロードが完了していない
  if (instrumentId === 'synth-fallback' || !provider.isLoaded(instrumentId)) {
    const chordSynth = getChordSynth();
    if (chordSynth) {
      const Tone = getToneSync();
      if (!Tone) return;

      const velocityFactor = event.velocity ? (event.velocity / 127) : 1;
      const gain = velocityFactor * Tone.dbToGain(SYNTH_VOLUME_PROFILE.chord);

      if ('triggerAttackRelease' in chordSynth) {
        if (chordSynth.name === 'PolySynth') {
          (chordSynth as ToneType.PolySynth).triggerAttackRelease(
            event.notes,
            event.duration,
            event.time,
            gain
          );
        } else {
          // MonoSynth などの場合は単音（最初の音）のみ
          (chordSynth as ToneType.MonoSynth).triggerAttackRelease(
            event.notes[0],
            event.duration,
            event.time,
            gain
          );
        }
      }
    }
  } else {
    // smplr を使用
    try {
      const baseVelocity = Math.round(((event.velocity ?? 90) / 127) * profile.chord);
      const isStrum = instrumentId === 'acoustic-guitar';
      const strumOffset = 0.012; // 12ms between strings
      const strumVelocityVariation = [0.85, 1.0, 0.95, 0.88];

      event.notes.forEach((note, index) => {
        const noteTime = isStrum ? event.time + index * strumOffset : event.time;
        const noteVelocity = isStrum
          ? Math.round(baseVelocity * (strumVelocityVariation[index] ?? 0.9))
          : baseVelocity;
        provider.playNote(instrumentId, note, {
          velocity: noteVelocity,
          duration: event.duration,
          time: noteTime,
        });
      });
    } catch (smplrError) {
      if (process.env.NODE_ENV !== 'production') console.warn('[UnifiedPlayer] smplr playChord failed, using Tone.js fallback:', smplrError);
      const chordSynth = getChordSynth();
      if (chordSynth) {
        const Tone = getToneSync();
        if (Tone && 'triggerAttackRelease' in chordSynth) {
          if (chordSynth.name === 'PolySynth') {
            (chordSynth as ToneType.PolySynth).triggerAttackRelease(event.notes, event.duration, event.time);
          } else {
            (chordSynth as ToneType.MonoSynth).triggerAttackRelease(event.notes[0], event.duration, event.time);
          }
        }
      }
    }
  }
}

/**
 * 楽器の選択状態に応じて、smplr または Tone.js のシンセでベース音を再生する
 */
export async function playUnifiedBass(note: string, duration: number, time: number, velocity: number = 80): Promise<void> {
  const store = useStore.getState();
  const instrumentId = store.activeInstrumentId;
  const provider = getSmplrProvider();
  const profile = getVolumeProfile(instrumentId);

  if (instrumentId === 'synth-fallback' || !provider.isLoaded(instrumentId)) {
    const bassSynth = getBassSynth();
    if (bassSynth) {
      const Tone = getToneSync();
      if (!Tone) return;
      const gain = Tone.dbToGain(SYNTH_VOLUME_PROFILE.bass);
      bassSynth.triggerAttackRelease(note, duration, time, (velocity / 127) * gain);
    }
  } else {
    // smplr を使用 (和音と同じ楽器を低域で使用)
    try {
      const effectiveVelocity = Math.round((velocity / 127) * profile.bass);
      provider.playNote(instrumentId, note, {
        velocity: effectiveVelocity,
        duration,
        time,
      });
    } catch (smplrError) {
      if (process.env.NODE_ENV !== 'production') console.warn('[UnifiedPlayer] smplr playNote (bass) failed, using Tone.js fallback:', smplrError);
      const bassSynth = getBassSynth();
      if (bassSynth) {
        const Tone = getToneSync();
        if (Tone) bassSynth.triggerAttackRelease(note, duration, time, velocity / 127);
      }
    }
  }
}

/**
 * 楽器の選択状態に応じて、smplr または Tone.js のシンセでメロディを再生する
 */
export function playUnifiedMelody(
  note: string | number,
  options: { duration: number; time: number; velocity?: number }
): void {
  const store = useStore.getState();
  const instrumentId = store.activeInstrumentId;
  const provider = getSmplrProvider();
  const profile = getVolumeProfile(instrumentId);

  if (instrumentId === 'synth-fallback' || !provider.isLoaded(instrumentId)) {
    const melodySynth = getMelodySynth();
    if (melodySynth) {
      const Tone = getToneSync();
      if (!Tone) return;
      const noteName = typeof note === 'number' ? Tone.Frequency(note, 'midi').toNote() : note;
      const gain = Tone.dbToGain(profile.melody);
      melodySynth.triggerAttackRelease(
        noteName,
        options.duration,
        options.time,
        ((options.velocity ?? 80) / 127) * gain
      );
    }
  } else {
    // smplr を使用 — メロディ音をアクティブな楽器で再生
    try {
      const effectiveVelocity = Math.round(((options.velocity ?? 80) / 127) * profile.melody);
      provider.playNote(instrumentId, note, {
        velocity: effectiveVelocity,
        duration: options.duration,
        time: options.time,
      });
    } catch (smplrError) {
      if (process.env.NODE_ENV !== 'production') console.warn('[UnifiedPlayer] smplr playNote (melody) failed, using Tone.js fallback:', smplrError);
      const melodySynth = getMelodySynth();
      if (melodySynth) {
        const Tone = getToneSync();
        if (Tone) {
          const noteName = typeof note === 'number' ? Tone.Frequency(note, 'midi').toNote() : note;
          melodySynth.triggerAttackRelease(noteName, options.duration, options.time);
        }
      }
    }
  }
}

/**
 * メロディの再生を停止する
 */
export async function stopUnifiedMelody(): Promise<void> {
  const store = useStore.getState();
  const instrumentId = store.activeInstrumentId;
  
  // Tone.js のメロディシンセを停止 (engine.ts 側で管理)
  const engine = await import('./engine');
  const synth = engine.getMelodySynth();
  safeToneStop(synth);

  // smplr を停止
  if (instrumentId !== 'synth-fallback') {
    getSmplrProvider().stopAll(instrumentId);
  }
}

/**
 * 型安全な Tone.js 停止処理
 */
function safeToneStop(instr: unknown): void {
  if (!instr) return;
  // Tone.js のシンセやノードは triggerRelease や releaseAll を持つ
  if (typeof instr === 'object' && instr !== null) {
     if ('releaseAll' in instr && typeof (instr as { releaseAll: unknown }).releaseAll === 'function') {
       (instr as { releaseAll: () => void }).releaseAll();
     } else if ('triggerRelease' in instr && typeof (instr as { triggerRelease: unknown }).triggerRelease === 'function') {
       (instr as { triggerRelease: () => void }).triggerRelease();
     }
  }
}

/**
 * 音を即座に停止する（全てのエンジンに対して）
 */
export async function stopAllUnified(): Promise<void> {
  // smplr
  getSmplrProvider().stopAll();
  
  // Tone.js (Transportを止めるだけでなく、発音中の音を消す)
  const ToneModule = await getTone();
  if (ToneModule) {
    safeToneStop(getChordSynth());
    safeToneStop(getBassSynth());
    
    const { getMelodySynth } = await import('./engine');
    safeToneStop(getMelodySynth());
  }
}
