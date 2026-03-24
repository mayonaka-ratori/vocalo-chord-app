export default function Header() {
  return (
    <header className="sticky top-0 z-50 h-12 w-full bg-voca-bg/95 backdrop-blur-lg border-b-2 border-transparent relative overflow-hidden">
      {/* ボカコレ風グラデーションボーダーを擬似要素的に再現 */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-card" />
      
      <div className="max-w-5xl mx-auto h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎵</span>
          <h1 className="text-lg font-bold tracking-tight text-gradient-hero">
            ボカロ作曲アシスタント
          </h1>
        </div>

        {/* 右側に情報を置くスペース（将来用） */}
        <div className="hidden md:block">
          <p className="text-[10px] text-voca-text-muted font-mono tracking-widest uppercase">
            Vocacore Chord App v1.9
          </p>
        </div>
      </div>
    </header>
  );
}
