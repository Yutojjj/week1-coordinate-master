"use client";

import Link from "next/link";

// Week1のステージ構成
const WEEKS = [
  {
    week: 1,
    title: "ざひょうとうごきをおぼえよう！",
    color: "border-blue-500",
    titleColor: "text-blue-400",
    stages: [
      {
        stageNum: 1,
        title: "じゅんじしょり",
        desc: "じゅんばんにうごく",
        color: "from-blue-600 to-blue-800",
        badge: "きほん",
        badgeColor: "bg-blue-200 text-blue-900",
        areas: [
          { id: "1-1-1", area: 1, title: "コインをとろう！", icon: "🪙" },
          { id: "1-1-2", area: 2, title: "コインをあつめろ！", icon: "🪙🪙" },
          { id: "1-1-3", area: 3, title: "たくさんあつめろ！", icon: "🪙🪙🪙🪙" },
        ],
      },
      {
        stageNum: 2,
        title: "まつブロック",
        desc: "じかんをあやつる",
        color: "from-green-600 to-green-800",
        badge: "まつ",
        badgeColor: "bg-green-200 text-green-900",
        areas: [
          { id: "1-2-1", area: 1, title: "まほうじんでチャージ！", icon: "🔮" },
          { id: "1-2-2", area: 2, title: "カミナリをよけろ！", icon: "⚡" },
          { id: "1-2-3", area: 3, title: "ざひょうなし！", icon: "🔥" },
        ],
      },
    ],
  },
  {
    week: 2,
    title: "むきとくりかえしをおぼえよう！",
    color: "border-purple-500",
    titleColor: "text-purple-400",
    stages: [
      {
        stageNum: 1,
        title: "スライム討伐",
        desc: "むきをかえてすすむ",
        color: "from-purple-600 to-purple-800",
        badge: "むき",
        badgeColor: "bg-purple-200 text-purple-900",
        areas: [
          { id: "2-1-1", area: 1, title: "スライムをたおせ！", icon: "💧" },
          { id: "2-1-2", area: 2, title: "にげたスライムをおえ！", icon: "💧💧" },
          { id: "2-1-3", area: 3, title: "スライムが2ひき！", icon: "💧💧💧" },
        ],
      },
      {
        stageNum: 2,
        title: "オークの群れ",
        desc: "くりかえしをつかう",
        color: "from-red-600 to-red-800",
        badge: "くりかえし",
        badgeColor: "bg-red-200 text-red-900",
        areas: [
          { id: "2-2-1", area: 1, title: "オークのむれ！", icon: "⚔️" },
        ],
      },
    ],
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-4 py-8">
      {/* タイトル */}
      <div className="text-center mb-10">
        <div className="text-6xl mb-3">🏫</div>
        <h1 className="text-4xl font-bold text-yellow-400 mb-1">ざひょうマスター</h1>
        <p className="text-blue-300 text-lg">ケーニーズプログラミングきょうしつ</p>
      </div>

      {/* Week一覧 */}
      {WEEKS.map(week => (
        <div key={week.week} className="max-w-4xl mx-auto mb-10">
          {/* Weekヘッダー */}
          <div className={`flex items-center gap-3 mb-5 pb-3 border-b-2 ${week.color}`}>
            <div className="bg-yellow-400 text-slate-900 font-bold text-lg px-4 py-1 rounded-full shrink-0">
              Week {week.week}
            </div>
            <h2 className={`text-lg font-bold ${week.titleColor}`}>{week.title}</h2>
          </div>

          {/* Stage一覧 */}
          <div className="flex flex-col gap-4">
            {week.stages.map(stage => (
              <div key={stage.stageNum} className={`bg-gradient-to-r ${stage.color} rounded-xl p-4 shadow-lg`}>
                {/* Stageヘッダー */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-white bg-opacity-20 text-white font-bold text-sm px-3 py-0.5 rounded-full">
                    Stage {week.week}-{stage.stageNum}
                  </span>
                  <span className="text-white font-bold">{stage.title}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ml-auto ${stage.badgeColor}`}>
                    {stage.badge}
                  </span>
                </div>

                {/* Area一覧 */}
                <div className="grid grid-cols-3 gap-2">
                  {stage.areas.map(area => (
                    <Link key={area.id} href={`/lesson/${area.id}`}>
                      <div className="bg-white bg-opacity-15 hover:bg-opacity-25 rounded-lg p-3
                        cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95">
                        <div className="text-2xl mb-1">{area.icon}</div>
                        <div className="text-white text-xs font-bold">エリア {area.area}</div>
                        <div className="text-white text-opacity-90 text-xs mt-0.5 leading-tight">
                          {area.title}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* 先生ダッシュボード */}
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard">
          <div className="bg-slate-700 hover:bg-slate-600 rounded-xl p-4 flex items-center
            gap-3 cursor-pointer transition-colors border border-slate-600">
            <div className="text-3xl">📊</div>
            <div>
              <p className="text-white font-bold">せんせいダッシュボード</p>
              <p className="text-slate-400 text-sm">せいとのしんちょくをかくにん</p>
            </div>
            <div className="ml-auto text-slate-400 text-2xl">›</div>
          </div>
        </Link>
      </div>

      <footer className="text-center mt-12 text-slate-500 text-sm">
        © 2025 ケーニーズプログラミングきょうしつ
      </footer>
    </main>
  );
}
