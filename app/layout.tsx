import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "座標マスター - ケーニーズプログラミング教室",
  description: "プログラミング学習ゲーム：座標とBlocklyで魔物を倒そう！",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-slate-900 text-white">
        {children}
      </body>
    </html>
  );
}
