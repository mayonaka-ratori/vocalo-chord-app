export default function Header() {
  return (
    <header className="py-4 md:py-8 text-center flex flex-col items-center">
      <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-2">
        <span className="mr-2">🎵</span>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
          ボカロ作曲アシスタント
        </span>
      </h1>
      {/* PC向けサブタイトル */}
      <p className="text-sm md:text-base text-slate-400 max-w-lg mx-auto leading-relaxed hidden sm:block">
        有名コード進行を選んで、リズムパターンを組み合わせて、ボカロ曲のアイディアを形にしよう
      </p>
      {/* モバイル向けコンパクトサブタイトル */}
      <p className="text-xs text-slate-500 sm:hidden">
        アイディアを形にする作曲アシスタント
      </p>
    </header>
  );
}
