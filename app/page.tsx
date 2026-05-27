"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const WEEKS = [
  {
    week: 1,
    title: "ざひょうとうごきをおぼえよう！",
    color: "#3B82F6",
    stages: [
      {
        stageNum: 1,
        title: "じゅんじしょり",
        desc: "じゅんばんにうごく",
        icon: "🪙",
        gradient: "from-blue-500 to-cyan-500",
        badge: "きほん",
        areas: [
          { id: "1-1-1", area: 1, title: "コインをとろう！", locked: false },
          { id: "1-1-2", area: 2, title: "コインをあつめろ！", locked: false },
          { id: "1-1-3", area: 3, title: "たくさんあつめろ！", locked: false },
        ],
      },
      {
        stageNum: 2,
        title: "まつブロック",
        desc: "じかんをあやつる",
        icon: "⚡",
        gradient: "from-green-500 to-emerald-500",
        badge: "まつ",
        areas: [
          { id: "1-2-1", area: 1, title: "まほうじんでチャージ！", locked: false },
          { id: "1-2-2", area: 2, title: "カミナリをよけろ！", locked: false },
        ],
      },
    ],
  },
  {
    week: 2,
    title: "むきとくりかえしをおぼえよう！",
    color: "#A855F7",
    stages: [
      {
        stageNum: 1,
        title: "スライム討伐",
        desc: "むきをかえてすすむ",
        icon: "💧",
        gradient: "from-purple-500 to-violet-500",
        badge: "むき",
        areas: [
          { id: "2-1-1", area: 1, title: "スライムをたおせ！", locked: false },
          { id: "2-1-2", area: 2, title: "にげたスライムをおえ！", locked: false },
          { id: "2-1-3", area: 3, title: "スライムが2ひき！", locked: false },
        ],
      },
      {
        stageNum: 2,
        title: "オークの群れ",
        desc: "くりかえしをつかう",
        icon: "⚔️",
        gradient: "from-red-500 to-rose-500",
        badge: "くりかえし",
        areas: [
          { id: "2-2-1", area: 1, title: "オークのむれ！", locked: false },
        ],
      },
    ],
  },
];

function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.5 + 0.3,
      speed: Math.random() * 0.3 + 0.05,
      alpha: Math.random(),
      dalpha: (Math.random() - 0.5) * 0.015,
    }));
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        s.alpha += s.dalpha;
        if (s.alpha <= 0 || s.alpha >= 1) s.dalpha *= -1;
        s.y += s.speed;
        if (s.y > canvas.height) { s.y = 0; s.x = Math.random() * canvas.width; }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0, Math.min(1, s.alpha))})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />;
}

function FloatingOrb({ color, size, x, y, delay }: { color: string; size: number; x: string; y: string; delay: number }) {
  return (
    <div
      className="fixed rounded-full pointer-events-none"
      style={{
        width: size, height: size, left: x, top: y,
        background: color, filter: "blur(80px)", opacity: 0.18,
        animation: `float ${6 + delay}s ease-in-out infinite`,
        animationDelay: `${delay}s`, zIndex: 0,
      }}
    />
  );
}

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen relative overflow-x-hidden"
      style={{ background: "linear-gradient(135deg, #0a0a1a 0%, #0d1225 40%, #0a1a0d 100%)" }}>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;500;700;900&family=Orbitron:wght@700;900&display=swap');
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes pulse-glow { 0%,100%{box-shadow:0 0 20px rgba(251,191,36,0.3)} 50%{box-shadow:0 0 40px rgba(251,191,36,0.7),0 0 80px rgba(251,191,36,0.2)} }
        @keyframes badge-shine { 0%{opacity:0;left:-100%} 50%{opacity:0.6} 100%{opacity:0;left:200%} }
        @keyframes title-glow { 0%,100%{text-shadow:0 0 30px rgba(251,191,36,0.5)} 50%{text-shadow:0 0 60px rgba(251,191,36,0.9),0 0 120px rgba(251,191,36,0.3)} }
        @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .area-card { transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1); background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
        .area-card:hover { transform: translateY(-4px) scale(1.04); background: rgba(255,255,255,0.12) !important; border-color: rgba(255,255,255,0.3) !important; box-shadow: 0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1) !important; }
        .area-card:hover .area-hover-shine { opacity: 1; }
        .week-card { transition: all 0.3s ease; }
      `}</style>

      <StarField />
      <FloatingOrb color="radial-gradient(circle,#3B82F6,transparent)" size={500} x="10%" y="5%" delay={0} />
      <FloatingOrb color="radial-gradient(circle,#A855F7,transparent)" size={400} x="70%" y="20%" delay={2} />
      <FloatingOrb color="radial-gradient(circle,#10B981,transparent)" size={350} x="40%" y="60%" delay={4} />
      <FloatingOrb color="radial-gradient(circle,#F59E0B,transparent)" size={300} x="80%" y="70%" delay={1} />

      <div className="relative" style={{ zIndex: 1 }}>
        {/* ヒーローセクション */}
        <div className="text-center pt-16 pb-10 px-4">
          {/* 装飾リング */}
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-yellow-400/30"
              style={{ width: 100, height: 100, left: "50%", top: "50%", transform: "translate(-50%,-50%)", animation: "spin-slow 12s linear infinite" }} />
            <div className="absolute inset-0 rounded-full border border-yellow-400/15"
              style={{ width: 130, height: 130, left: "50%", top: "50%", transform: "translate(-50%,-50%)", animation: "spin-slow 20s linear infinite reverse" }} />
            <div className="text-7xl relative z-10" style={{ filter: "drop-shadow(0 0 20px rgba(251,191,36,0.6))" }}>🏰</div>
          </div>

          <h1 className="text-5xl md:text-6xl font-black mb-2 relative"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              background: "linear-gradient(90deg, #FCD34D, #FBBF24, #F59E0B, #FCD34D, #FDE68A, #FBBF24)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "shimmer 4s linear infinite, title-glow 3s ease-in-out infinite",
            }}>
            ざひょうマスター
          </h1>
          <p className="text-blue-300/80 text-lg mt-3 tracking-widest"
            style={{ fontFamily: "'Zen Maru Gothic', sans-serif" }}>
            ✦ ケーニーズプログラミングきょうしつ ✦
          </p>

          {/* 区切り装飾 */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-yellow-400/50" />
            <div className="text-yellow-400/60 text-sm">⬡</div>
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-yellow-400/50" />
          </div>
        </div>

        {/* Week一覧 */}
        <div className="max-w-3xl mx-auto px-4 pb-16 space-y-10">
          {WEEKS.map((week, wi) => (
            <div key={week.week} className="week-card">
              {/* Weekヘッダー */}
              <div className="flex items-center gap-4 mb-5">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full blur-md opacity-60"
                    style={{ background: week.color }} />
                  <div className="relative px-5 py-1.5 rounded-full font-black text-sm text-white border border-white/20"
                    style={{
                      background: `linear-gradient(135deg, ${week.color}cc, ${week.color}88)`,
                      fontFamily: "'Orbitron', sans-serif",
                      boxShadow: `0 0 20px ${week.color}66`,
                    }}>
                    WEEK {week.week}
                  </div>
                </div>
                <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${week.color}66, transparent)` }} />
                <span className="text-white/50 text-xs" style={{ fontFamily: "'Zen Maru Gothic', sans-serif" }}>{week.title}</span>
              </div>

              {/* Stage一覧 */}
              <div className="space-y-4">
                {week.stages.map((stage) => (
                  <div key={stage.stageNum}
                    className="rounded-2xl overflow-hidden border border-white/10"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      backdropFilter: "blur(12px)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
                    }}>
                    {/* Stageヘッダー */}
                    <div className={`bg-gradient-to-r ${stage.gradient} p-4 flex items-center gap-3`}
                      style={{ position: "relative", overflow: "hidden" }}>
                      {/* 光沢オーバーレイ */}
                      <div className="absolute inset-0 opacity-20"
                        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%)" }} />
                      <div className="text-3xl relative z-10"
                        style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.5))" }}>{stage.icon}</div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2">
                          <span className="text-white/70 text-xs font-bold"
                            style={{ fontFamily: "'Orbitron', sans-serif" }}>
                            {week.week}-{stage.stageNum}
                          </span>
                          <span className="text-white font-black text-base"
                            style={{ fontFamily: "'Zen Maru Gothic', sans-serif" }}>{stage.title}</span>
                        </div>
                        <p className="text-white/70 text-xs mt-0.5"
                          style={{ fontFamily: "'Zen Maru Gothic', sans-serif" }}>{stage.desc}</p>
                      </div>
                      {/* バッジ */}
                      <div className="ml-auto relative z-10 px-3 py-1 rounded-full text-xs font-black text-white/90 border border-white/30 overflow-hidden"
                        style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}>
                        <span className="absolute top-0 w-4 h-full bg-white/40 skew-x-12"
                          style={{ animation: "badge-shine 3s ease infinite" }} />
                        {stage.badge}
                      </div>
                    </div>

                    {/* Area一覧 */}
                    <div className="p-4 grid gap-3"
                      style={{ gridTemplateColumns: `repeat(${stage.areas.length}, 1fr)` }}>
                      {stage.areas.map((area, ai) => (
                        <button key={area.id} onClick={() => router.push(`/lesson/${area.id}`)}
                          className="area-card w-full text-left block rounded-xl p-3 relative overflow-hidden">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white/40 text-xs font-bold"
                                style={{ fontFamily: "'Orbitron', sans-serif" }}>
                                AREA {area.area}
                              </span>
                              <span className="text-white/20 text-lg">›</span>
                            </div>
                            <p className="text-white text-xs font-bold leading-tight"
                              style={{ fontFamily: "'Zen Maru Gothic', sans-serif" }}>{area.title}</p>
                            <div className="area-hover-shine absolute inset-0 pointer-events-none rounded-xl opacity-0 transition-opacity duration-200"
                                style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)" }} />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* せんせいダッシュボード */}
          <button onClick={() => router.push("/dashboard")} className="w-full">
            <div className="rounded-2xl p-4 flex items-center gap-4 cursor-pointer border border-white/10 group transition-all duration-300 hover:border-white/20"
              style={{
                background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
              }}>
              <div className="text-4xl" style={{ filter: "drop-shadow(0 0 10px rgba(100,200,255,0.4))" }}>📊</div>
              <div>
                <p className="text-white font-bold text-sm" style={{ fontFamily: "'Zen Maru Gothic', sans-serif" }}>せんせいダッシュボード</p>
                <p className="text-white/40 text-xs mt-0.5" style={{ fontFamily: "'Zen Maru Gothic', sans-serif" }}>せいとのしんちょくをかくにん</p>
              </div>
              <div className="ml-auto text-white/30 text-2xl transition-transform duration-300 group-hover:translate-x-1">›</div>
            </div>
          </button>
        </div>

        <footer className="text-center pb-8 text-white/20 text-xs tracking-widest"
          style={{ fontFamily: "'Orbitron', sans-serif" }}>
          © 2025 KENIE'S PROGRAMMING
        </footer>
      </div>
    </main>
  );
}