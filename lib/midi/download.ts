import { exportToMidi, ExportConfig } from './exporter';

/**
 * MIDI用のトースト通知用インターフェース
 */
interface ToastSetter {
  (toast: { message: string, type: 'success' | 'error' } | null): void;
}

/**
 * MIDI生成からブラウザでのダウンロード実行、トースト通知までを一括で管理するヘルパー
 * components/transport-controls.tsx と components/floating-player.tsx で共有
 */
export async function downloadMidi(
  config: ExportConfig,
  key: string,
  setToast: ToastSetter
): Promise<void> {
  try {
    // 1. MIDI Blob 生成
    const blob = exportToMidi(config);
    
    // 2. URL生成
    const url = URL.createObjectURL(blob);
    
    // 3. ファイル名生成
    const safeKey = key.replace('#', 's');
    const tempo = config.tempo;
    
    let filename = '';
    const melodySuffix = config.melodyNotes && config.melodyNotes.length > 0 ? '-melody' : '';
    
    if (config.mode === 'song') {
      filename = `vocalo-song-${safeKey}-${tempo}bpm-${config.sections.length}sections${melodySuffix}.mid`;
    } else {
      filename = `vocalo-chord-${safeKey}-${tempo}bpm${melodySuffix}.mid`;
    }

    // 4. ブラウザでのダウンロード実行
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();

    // 5. 後処理 & 通知
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setToast({ message: 'MIDIファイルをダウンロードしました！', type: 'success' });
    
  } catch (err) {
    console.error('MIDI export failed:', err);
    setToast({ message: 'MIDI書き出しに補助しました', type: 'error' });
  }
}
