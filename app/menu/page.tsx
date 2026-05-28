"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

function R({ children, ruby }: { children: string; ruby: string }) {
  return (
    <ruby style={{ rubyAlign: "center" } as React.CSSProperties}>
      {children}
      <rt style={{ fontSize: "0.55em", color: "rgba(255,255,255,0.6)" }}>{ruby}</rt>
    </ruby>
  );
}

function OrcIcon({ size = 28 }: { size?: number }) {
  return <img src="/sprites/enemy_orc.png" alt="オーク" style={{ width: size, height: size, imageRendering: "pixelated" }} />;
}

// ── SE ──────────────────────────────────────────
function playHoverStageSe() {
  try {
    const ctx = new AudioContext();
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.18, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    g.connect(ctx.destination);
    // モワーン：サイン波フィルタースイープ
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.25);
    osc.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 0.5);
    osc.connect(g);
    osc.start(); osc.stop(ctx.currentTime + 0.5);
  } catch {}
}

function playHoverAreaSe() {
  try {
    const ctx = new AudioContext();
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    g.connect(ctx.destination);
    // カチッ：短い矩形波
    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.06);
    osc.connect(g);
    osc.start(); osc.stop(ctx.currentTime + 0.08);
  } catch {}
}

function useMenuBgm(started: boolean) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    if (!started) return;
    const audio = new Audio("/bgm/Sunlit_Meadow_Path.mp3");
    audio.loop = true;
    audio.volume = 0.35;
    audio.play().catch(() => {});
    audioRef.current = audio;
    return () => { audio.pause(); audio.currentTime = 0; };
  }, [started]);
}
const CHAPTERS = [
  {
    chapter: 1,
    titleNode: <><R ruby="うご">動</R>き・<R ruby="ざひょう">座標</R>・まつを<R ruby="おぼ">覚</R>えよう！</>,
    color: "#3B82F6",
    glowColor: "rgba(59,130,246,0.5)",
    borderColor: "rgba(59,130,246,0.6)",
    stages: [
      {
        stageNum: 1,
        titleNode: <><R ruby="ざひょう">座標</R>と<R ruby="うご">動</R>き</>,
        desc: <><R ruby="じゅんばん">順番</R>にうごく</>,
        icon: "🪙",
        color: "#3B82F6",
        badge: <><R ruby="きほん">基本</R></>,
        areas: [
          { id: "1-1-1", area: 1, title: <>キャラを<R ruby="うご">動</R>かしてみよう</>, icon: "player", boss: false },
          { id: "1-1-2", area: 2, title: <>コインをたくさん<R ruby="あつ">集</R>めろ！</>, icon: "🪙", boss: false },
          { id: "1-1-3", area: 3, title: <><R ruby="ざひょう">座標</R>になれよう！</>, icon: "📍", boss: false },
        ],
      },
      {
        stageNum: 2,
        titleNode: <>まつブロック</>,
        desc: <><R ruby="じかん">時間</R>をあやつる</>,
        icon: "⏳",
        color: "#10B981",
        badge: <>まつ</>,
        areas: [
          { id: "1-2-1", area: 1, title: <><R ruby="まほうじん">魔法陣</R>でチャージ！</>, icon: "magic", boss: false },
          { id: "1-2-2", area: 2, title: <>オークをたおせ！</>, icon: "orc", boss: true },
        ],
      },
    ],
  },
  {
    chapter: 2, comingSoon: true,
    titleNode: <><R ruby="む">向</R>きとくりかえしを<R ruby="おぼ">覚</R>えよう！</>,
    color: "#A855F7",
    glowColor: "rgba(168,85,247,0.5)",
    borderColor: "rgba(168,85,247,0.6)",
    stages: [
      {
        stageNum: 1,
        titleNode: <><R ruby="とうばつ">討伐</R>スライム</>,
        desc: <>むきをかえてすすむ</>,
        icon: "💧",
        color: "#A855F7",
        badge: <>むき</>,
        areas: [
          { id: "2-1-1", area: 1, title: <>スライムをたおせ！</>, icon: "💧", boss: false },
          { id: "2-1-2", area: 2, title: <>にげたスライムをおえ！</>, icon: "💧", boss: false },
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
    const stars = Array.from({ length: 160 }, () => ({
      x: Math.random() * 1400, y: Math.random() * 900,
      r: Math.random() * 1.8 + 0.2,
      alpha: Math.random(), dalpha: (Math.random() - 0.5) * 0.012,
    }));
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        s.alpha = Math.max(0.05, Math.min(1, s.alpha + s.dalpha));
        if (s.alpha <= 0.05 || s.alpha >= 1) s.dalpha *= -1;
        ctx.beginPath(); ctx.arc(s.x % canvas.width, s.y % canvas.height, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.alpha})`; ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />;
}

function AreaIcon({ icon }: { icon: string }) {
  if (icon === "orc") return <OrcIcon size={30} />;
  if (icon === "player") return <img src="/sprites/player_front.png" alt="キャラ" style={{ width: 30, height: 30, imageRendering: "pixelated" }} />;
  if (icon === "magic") return <img src="/sprites/magic_circle.png" alt="魔法陣" style={{ width: 30, height: 30, imageRendering: "pixelated", borderRadius: "50%" }} />;
  return <span style={{ fontSize: "22px", lineHeight: 1 }}>{icon}</span>;
}

export default function Home() {
  const router = useRouter();
  const [bgmStarted, setBgmStarted] = React.useState(false);
  useMenuBgm(bgmStarted);

  // 最初のクリックでBGM開始（オーバーレイなし）
  useEffect(() => {
    const start = () => { setBgmStarted(true); };
    window.addEventListener("click", start, { once: true });
    window.addEventListener("keydown", start, { once: true });
    return () => {
      window.removeEventListener("click", start);
      window.removeEventListener("keydown", start);
    };
  }, []);

  return (
    <main style={{
      minHeight: "100vh",
      background: "url('/sprites/menu_bg.jpg') center center / cover no-repeat fixed",
      position: "relative", overflow: "hidden",
      fontFamily: "'Noto Sans JP', sans-serif",
    }}>
      {/* 全体を少し暗くしてテキストを読みやすく */}
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,8,0.35)", zIndex: 0, pointerEvents: "none" }} />
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@700;900&family=Orbitron:wght@700;900&display=swap');
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes glow-pulse { 0%,100%{opacity:0.6} 50%{opacity:1} }
        @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .area-btn { transition: all 0.22s cubic-bezier(0.34,1.56,0.64,1); }
        .area-btn:hover { transform: translateY(-4px) scale(1.04) !important; }
        .stage-card { transition: box-shadow 0.2s; }
        .stage-card:hover { box-shadow: 0 0 32px var(--glow) !important; }
      `}</style>

      {/* 左右の縦ライン */}
      <div style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: 3, background: "linear-gradient(to bottom, transparent, rgba(59,130,246,0.5) 30%, rgba(168,85,247,0.5) 70%, transparent)", zIndex: 1 }} />
      <div style={{ position: "fixed", right: 0, top: 0, bottom: 0, width: 3, background: "linear-gradient(to bottom, transparent, rgba(59,130,246,0.5) 30%, rgba(168,85,247,0.5) 70%, transparent)", zIndex: 1 }} />

      <div style={{ position: "relative", zIndex: 2, maxWidth: 820, margin: "0 auto", padding: "0 20px 60px" }}>

        {/* ── ヒーロー ── */}
        <div style={{ textAlign: "center", paddingTop: 48, paddingBottom: 32 }}>

          {/* タイトル */}
          <div style={{ marginBottom: 6 }}>
            <h1 style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "clamp(38px, 9vw, 68px)",
              fontWeight: 900,
              margin: "0 0 4px",
              background: "linear-gradient(180deg, #ffffff 0%, #FDE68A 40%, #FBBF24 70%, #F59E0B 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              letterSpacing: "0.06em",
              filter: "drop-shadow(0 0 30px rgba(251,191,36,0.6))",
            }}>
              COORD MASTER
            </h1>
          </div>
          <p style={{ color: "rgba(147,197,253,0.6)", fontSize: 12, letterSpacing: "0.2em", margin: "0 0 6px" }}>
            ✦ ケーニーズプログラミングきょうしつ ✦
          </p>

          {/* 区切り */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 16 }}>
            <div style={{ width: 80, height: 1, background: "linear-gradient(to right, transparent, rgba(251,191,36,0.4))" }} />
            <div style={{ color: "rgba(251,191,36,0.5)", fontSize: 12 }}>⬡</div>
            <div style={{ width: 80, height: 1, background: "linear-gradient(to left, transparent, rgba(251,191,36,0.4))" }} />
          </div>
        </div>

        {/* ── チャプター一覧 ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {CHAPTERS.map((ch, ci) => (
            <div key={ch.chapter} style={{ animation: `fadeSlideIn 0.5s ease ${ci * 0.15}s both`, position: "relative" }}>

              {/* 開発中オーバーレイ */}
              {(ch as any).comingSoon && (
                <div style={{
                  position: "absolute", inset: 0, zIndex: 10,
                  borderRadius: 16,
                  background: "rgba(2,4,16,0.75)",
                  backdropFilter: "blur(3px)",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 8,
                  pointerEvents: "none",
                }}>
                  <span style={{ fontSize: 32 }}>🔒</span>
                  <span style={{
                    fontSize: 13, fontWeight: 800, color: "#a78bfa",
                    background: "rgba(167,139,250,0.15)",
                    border: "1px solid rgba(167,139,250,0.35)",
                    padding: "4px 16px", borderRadius: 20, letterSpacing: "0.1em",
                  }}>
                    <ruby>開発中<rt style={{ fontSize: "0.55em", color: "rgba(167,139,250,0.7)" }}>かいはつちゅう</rt></ruby>
                  </span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>もうすこしまっていてね！</span>
                </div>
              )}

              {/* チャプターヘッダー */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                {/* 章バッジ */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{ position: "absolute", inset: -3, borderRadius: 24, background: ch.color, filter: "blur(8px)", opacity: 0.5 }} />
                  <div style={{
                    position: "relative",
                    padding: "5px 16px", borderRadius: 24,
                    background: `linear-gradient(135deg, ${ch.color}cc, ${ch.color}88)`,
                    border: `1px solid ${ch.borderColor}`,
                    color: "#fff", fontWeight: 900, fontSize: 13,
                    lineHeight: 1.8, letterSpacing: "0.06em",
                  }}>
                    <ruby>第<rt style={{ fontSize: "0.55em", color: "rgba(255,255,255,0.75)" }}>だい</rt></ruby>
                    {ch.chapter === 1
                      ? <ruby>一<rt style={{ fontSize: "0.55em", color: "rgba(255,255,255,0.75)" }}>いち</rt></ruby>
                      : <ruby>二<rt style={{ fontSize: "0.55em", color: "rgba(255,255,255,0.75)" }}>に</rt></ruby>
                    }
                    <ruby>章<rt style={{ fontSize: "0.55em", color: "rgba(255,255,255,0.75)" }}>しょう</rt></ruby>
                  </div>
                </div>
                <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, ${ch.color}66, transparent)` }} />
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, lineHeight: 2 }}>{ch.titleNode}</span>
              </div>

              {/* ステージ一覧 */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {ch.stages.map((stage) => (
                  <div key={stage.stageNum}
                    className="stage-card"
                    onMouseEnter={playHoverStageSe}
                    style={{
                      borderRadius: 16,
                      overflow: "hidden",
                      border: `1px solid ${stage.color}55`,
                      background: "rgba(2,6,20,0.85)",
                      backdropFilter: "blur(20px)",
                      boxShadow: `0 4px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)`,
                      ["--glow" as any]: `${stage.color}66`,
                    }}>

                    {/* ステージヘッダー */}
                    <div style={{
                      padding: "12px 18px",
                      background: `linear-gradient(135deg, ${stage.color}22, ${stage.color}0a)`,
                      borderBottom: `1px solid ${stage.color}33`,
                      display: "flex", alignItems: "center", gap: 12,
                    }}>
                      <span style={{ fontSize: 26, filter: `drop-shadow(0 0 8px ${stage.color}88)` }}>{stage.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ color: `${stage.color}cc`, fontSize: 11, fontWeight: 700 }}>
                            {ch.chapter}-{stage.stageNum}
                          </span>
                          <span style={{ color: "#fff", fontWeight: 900, fontSize: 15, lineHeight: 1.8 }}>
                            {stage.titleNode}
                          </span>
                        </div>
                        <p style={{ margin: 0, color: "rgba(255,255,255,0.45)", fontSize: 11, lineHeight: 1.8 }}>
                          {stage.desc}
                        </p>
                      </div>
                      {/* バッジ */}
                      <div style={{
                        padding: "3px 12px", borderRadius: 20,
                        background: `${stage.color}22`,
                        border: `1px solid ${stage.color}55`,
                        color: `${stage.color}ee`,
                        fontSize: 11, fontWeight: 800, lineHeight: 1.8,
                      }}>
                        {stage.badge}
                      </div>
                    </div>

                    {/* エリア一覧 */}
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: `repeat(${stage.areas.length}, 1fr)`,
                      gap: 10, padding: 12,
                    }}>
                      {stage.areas.map((area) => (
                        <button key={area.id}
                          className="area-btn"
                          onMouseEnter={playHoverAreaSe}
                          onClick={() => router.push(`/lesson/${area.id}`)}
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 12, padding: "10px 12px",
                            cursor: "pointer", textAlign: "left",
                            position: "relative", overflow: "hidden",
                          }}>
                          {/* BOSSバッジ */}
                          {area.boss && (
                            <span style={{
                              position: "absolute", top: 7, right: 7,
                              background: "linear-gradient(135deg,#dc2626,#991b1b)",
                              color: "#fff", fontSize: 8, fontWeight: 800,
                              padding: "2px 6px", borderRadius: 8,
                              boxShadow: "0 2px 6px rgba(220,38,38,0.5)",
                              letterSpacing: "0.1em",
                            }}>BOSS</span>
                          )}
                          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 700, marginBottom: 6 }}>
                            エリア{area.area}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <AreaIcon icon={area.icon} />
                            <span style={{ color: "#fff", fontSize: 12, fontWeight: 700, lineHeight: 1.7 }}>
                              {area.title}
                            </span>
                          </div>
                          {/* ホバー光沢 */}
                          <div style={{
                            position: "absolute", inset: 0, borderRadius: 12,
                            background: `linear-gradient(135deg, ${stage.color}18, transparent)`,
                            opacity: 0, transition: "opacity 0.2s",
                          }} />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* フッター */}
        <div style={{ textAlign: "center", marginTop: 48, color: "rgba(255,255,255,0.15)", fontSize: 11, letterSpacing: "0.15em" }}>
          © 2025 ケーニーズプログラミング
        </div>
      </div>
    </main>
  );
}