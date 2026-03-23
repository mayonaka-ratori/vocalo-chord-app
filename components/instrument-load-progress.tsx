'use client';
import { useStore } from '@/lib/store';

/**
 * 楽器のロード進捗を表示するプログレスバー
 * アプリ上部（ヘッダー直下）に配置される想定
 */
export function InstrumentLoadProgress() {
  const isLoading = useStore((s) => s.isInstrumentLoading);
  const progress = useStore((s) => s.instrumentLoadProgress);

  if (!isLoading || !progress) return null;

  const percent = progress.total > 0 ? (progress.loaded / progress.total) * 100 : 0;

  return (
    <div className="w-full h-1 bg-voca-bg-section/50 overflow-hidden sticky top-14 z-50">
      <div
        className="h-full bg-gradient-to-r from-voca-accent-cyan to-voca-accent-magenta transition-all duration-300 ease-out shadow-[0_0_8px_rgba(255,0,255,0.5)]"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
