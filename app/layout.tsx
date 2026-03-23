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
  themeColor: "#0D0D14",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="bg-voca-bg text-voca-text min-h-screen antialiased selection:bg-voca-accent-purple/30">
        {children}
      </body>
    </html>
  );
}
