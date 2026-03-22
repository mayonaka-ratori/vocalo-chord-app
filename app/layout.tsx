import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ボカロ作曲アシスタント",
  description: "有名コード進行を選んで、リズムパターンを組み合わせて、ボカロ曲のアイディアを形にしよう",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-purple-500/30">
        {children}
      </body>
    </html>
  );
}
