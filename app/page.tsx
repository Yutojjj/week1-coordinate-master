"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ModeSelect() {
  const router = useRouter();

  return (
    <main style={{
      minHeight: "100vh",
      background: "url('/sprites/menu_bg.jpg') center center / cover no-repeat fixed",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Noto Sans JP', sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Zen+Maru+Gothic:wght@700;900&display=swap');
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .mode-btn { transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1); }
        .mode-btn:hover { transform: translateY(-6px) scale(1.03) !important; }
      `}</style>

      {/* 暗幕 */}
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,10,0.55)", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "0 24px", width: "100%", maxWidth: 700 }}>

        {/* タイトル */}
        <h1 style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: "clamp(22px, 4vw, 38px)",
          fontWeight: 900,
          margin: "0 0 4px",
          background: "linear-gradient(180deg, #fff 0%, #FDE68A 40%, #FBBF24 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          filter: "drop-shadow(0 0 20px rgba(251,191,36,0.5))",
          letterSpacing: "0.06em",
          animation: "fadeUp 0.6s ease both",
        }}>
          COORD MASTER
        </h1>
        <p style={{
          color: "rgba(147,197,253,0.6)", fontSize: 11, letterSpacing: "0.2em",
          marginBottom: 28, animation: "fadeUp 0.6s ease 0.1s both",
        }}>
          ✦ ケーニーズプログラミングきょうしつ ✦
        </p>

        {/* モード選択 */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20,
          animation: "fadeUp 0.6s ease 0.2s both",
        }}>

          {/* プログラミング */}
          <button
            className="mode-btn"
            onClick={() => router.push("/menu")}
            style={{
              background: "none",
              border: "none",
              borderRadius: 16, padding: 0,
              cursor: "pointer", overflow: "hidden",
              position: "relative",
              boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
            }}
          >
            <img
              src="/sprites/mode_programming.png"
              alt="プログラミング"
              style={{ width: "100%", display: "block", borderRadius: 16 }}
            />
            {/* ホバーグロー */}
            <div style={{
              position: "absolute", inset: 0, borderRadius: 16,
              background: "rgba(59,130,246,0)",
              border: "2px solid transparent",
              transition: "all 0.2s",
            }} className="mode-overlay" />
          </button>

          {/* タイピング */}
          <button
            className="mode-btn"
            onClick={() => window.open("https://typing.playgram.jp/select", "_blank")}
            style={{
              background: "none",
              border: "none",
              borderRadius: 16, padding: 0,
              cursor: "pointer", overflow: "hidden",
              position: "relative",
              boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
            }}
          >
            <img
              src="/sprites/mode_typing.png"
              alt="タイピング"
              style={{ width: "100%", display: "block", borderRadius: 16 }}
            />
            <div style={{
              position: "absolute", inset: 0, borderRadius: 16,
              background: "rgba(16,185,129,0)",
              border: "2px solid transparent",
              transition: "all 0.2s",
            }} className="mode-overlay" />
          </button>
        </div>

        <p style={{ color: "rgba(255,255,255,0.15)", fontSize: 10, marginTop: 40, letterSpacing: "0.15em" }}>
          © 2025 ケーニーズプログラミング
        </p>
      </div>
    </main>
  );
}