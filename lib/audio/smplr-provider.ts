import { getAudioContext } from './engine';
import { SmplrInstrumentId } from '@/types/music';

/**
 * smplr の各楽器クラスの共通インターフェース（最小限）
 */
interface ISmplrInstrument {
  readonly load: Promise<ISmplrInstrument>;
  start(event: {
    note: string | number;
    velocity?: number;
    time?: number;
    duration?: number;
  }): (time?: number) => void;
  stop(target?: string | number | { stopId?: string | number; time?: number }): void;
  disconnect(): void;
}

export interface LoadProgress {
  loaded: number;
  total: number;
  instrumentId: SmplrInstrumentId;
}

export type OnProgressCallback = (progress: LoadProgress) => void;

/**
 * サンプリング音源プロバイダー
 * 音源の遅延読み込みと再生を管理する
 */
class SmplrProvider {
  private instruments = new Map<SmplrInstrumentId, ISmplrInstrument>();
  private loadingPromises = new Map<SmplrInstrumentId, Promise<void>>();
  private progressMap = new Map<SmplrInstrumentId, LoadProgress>();

  /**
   * 指定した楽器をロードする。既にロード済みの場合はすぐに解消する。
   */
  async loadInstrument(id: SmplrInstrumentId, onProgress?: OnProgressCallback): Promise<void> {
    if (this.instruments.has(id)) return;
    if (this.loadingPromises.has(id)) return this.loadingPromises.get(id);

    const loadPromise = (async () => {
      try {
        const inst = await this.createInstrument(id, onProgress);
        if (inst) {
          this.instruments.set(id, inst);
        }
      } finally {
        this.loadingPromises.delete(id);
      }
    })();

    this.loadingPromises.set(id, loadPromise);
    return loadPromise;
  }

  /**
   * 単音を再生する。ロードされていない場合は何もしない（フォールバック用）。
   */
  playNote(id: SmplrInstrumentId, note: string | number, options: { 
    velocity?: number; 
    duration?: number; 
    time?: number; 
  } = {}): void {
    const inst = this.instruments.get(id);
    if (!inst) {
      // ロードされていない場合は、コンソールに警告を出すのみ（呼び出し側で Tone.js 等のフォールバックを想定）
      return;
    }

    inst.start({
      note,
      velocity: options.velocity ?? 100,
      time: options.time,
      duration: options.duration
    });
  }

  /**
   * 全ての音（または特定の楽器の音）を停止する
   */
  stopAll(id?: SmplrInstrumentId): void {
    if (id) {
      this.instruments.get(id)?.stop();
    } else {
      this.instruments.forEach(inst => inst.stop());
    }
  }

  /**
   * リソースを解放する
   */
  dispose(): void {
    this.instruments.forEach(inst => inst.disconnect());
    this.instruments.clear();
    this.loadingPromises.clear();
    this.progressMap.clear();
  }

  isLoaded(id: SmplrInstrumentId): boolean {
    return this.instruments.has(id);
  }

  getLoadProgress(id: SmplrInstrumentId): LoadProgress | null {
    return this.progressMap.get(id) || null;
  }

  /**
   * 楽器インスタンスを生成する内部メソッド（Dynamic Importを使用）
   */
  private async createInstrument(id: SmplrInstrumentId, onProgress?: OnProgressCallback): Promise<ISmplrInstrument | null> {
    const context = await getAudioContext();
    const handleProgress = (p: { loaded: number; total: number }) => {
      const progress = { ...p, instrumentId: id };
      this.progressMap.set(id, progress);
      onProgress?.(progress);
    };

    switch (id) {
      case 'splendid-grand-piano': {
        const { SplendidGrandPiano } = await import('smplr');
        const piano = new SplendidGrandPiano(context, {
          volume: 100,
          onLoadProgress: handleProgress,
        });
        await piano.load;
        return piano as unknown as ISmplrInstrument;
      }
      case 'electric-piano-cp80': {
        const { ElectricPiano } = await import('smplr');
        const ep = new ElectricPiano(context, {
          instrument: 'CP80',
          onLoadProgress: handleProgress,
        });
        await ep.load;
        return ep as unknown as ISmplrInstrument;
      }
      case 'electric-piano-wurlitzer': {
        const { ElectricPiano } = await import('smplr');
        const ep = new ElectricPiano(context, {
          instrument: 'WurlitzerEP200',
          onLoadProgress: handleProgress,
        });
        await ep.load;
        return ep as unknown as ISmplrInstrument;
      }
      case 'acoustic-guitar': {
        const { Soundfont } = await import('smplr');
        const guitar = new Soundfont(context, {
          instrument: 'acoustic_guitar_nylon',
          onLoadProgress: handleProgress,
        });
        await guitar.load;
        return guitar as unknown as ISmplrInstrument;
      }
      case 'string-ensemble': {
        const { Soundfont } = await import('smplr');
        const strings = new Soundfont(context, {
          instrument: 'string_ensemble_1',
          onLoadProgress: handleProgress,
        });
        await strings.load;
        return strings as unknown as ISmplrInstrument;
      }
      default:
        return null; // synth-fallback など
    }
  }
}

let providerInstance: SmplrProvider | null = null;

/**
 * SmplrProvider のシングルトンインスタンスを取得する
 */
export function getSmplrProvider(): SmplrProvider {
  if (!providerInstance) {
    providerInstance = new SmplrProvider();
  }
  return providerInstance;
}
