"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 px-4">
      {/* ロゴ */}
      <div className="text-6xl mb-4">🏫</div>
      
      {/* タイトル */}
      <h1 className="text-5xl font-bold mb-2 text-yellow-400 text-center">
        座標マスター
      </h1>
      <p className="text-xl text-blue-300 mb-8 text-center">
        ケーニーズプログラミング教室
      </p>

      {/* サブタイトル */}
      <p className="text-lg text-slate-300 mb-12 max-w-2xl text-center leading-relaxed">
        ブロックプログラミングで魔物を倒そう！<br />
        X軸とY軸の力を使ってケーニー王国を救え！
      </p>

      {/* ステージ選択 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl w-full">
        {[
          // ★ 新しいステージ構成に合わせて、初期エリアのIDを指定できるように変更しました
          { week: 1, stage: 1, area: 1, title: "コインをとろう！", emoji: "🪙", color: "from-blue-500 to-blue-600" },
          { week: 1, stage: 2, area: 1, title: "時間をあやつれ！", emoji: "⏱️", color: "from-purple-500 to-purple-600" },
          { week: 2, stage: 1, area: 1, title: "スライムをたおせ！", emoji: "💧", color: "from-red-500 to-red-600" },
        ].map((item) => (
          <Link
            key={`${item.week}-${item.stage}-${item.area}`}
            // ★ ここを /lesson/1-1-1 のような形式に変更しました
            href={`/lesson/${item.week}-${item.stage}-${item.area}`}
          >
            <div
              className={`bg-gradient-to-br ${item.color} rounded-lg p-6 cursor-pointer transform hover:scale-105 transition duration-300 shadow-lg`}
            >
              <div className="text-4xl mb-3">{item.emoji}</div>
              <h3 className="text-xl font-bold text-white mb-2">
                Week {item.week}, Stage {item.stage}
              </h3>
              <p className="text-white text-sm">{item.title}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ボタン */}
      <div className="flex gap-4">
        <Link href="/dashboard">
          <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition">
            📊 先生ダッシュボード
          </button>
        </Link>
      </div>

      {/* フッター */}
      <footer className="mt-20 text-slate-400 text-sm text-center">
        <p>©2025 ケーニーズプログラミング教室</p>
      </footer>
    </main>
  );
}