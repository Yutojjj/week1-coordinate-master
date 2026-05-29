"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getStage } from "@/lib/stages";
import { CanvasEngine, GameState, audioManager } from "@/lib/canvas-engine";
import Canvas from "./components/Canvas";
import dynamic from "next/dynamic";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BlocklyEditor = dynamic<any>(
  () => import("./components/BlocklyEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64 bg-slate-700 rounded text-slate-300 text-sm">
        ⏳ よみこみちゅう...
      </div>
    ),
  }
);

interface PageProps {
  params: { stageId: string };
}

function R({ children, ruby, color = "#7a6020" }: { children: string; ruby: string; color?: string }) {
  return <ruby>{children}<rt style={{ fontSize: "0.55em", color }}>{ruby}</rt></ruby>;
}

function ChapterBadge({ n }: { n: number }) {
  const kanjiNum = ["一","二","三","四","五"][n-1] ?? String(n);
  const rubyNum  = ["いち","に","さん","し","ご"][n-1] ?? "";
  return (
    <span style={{ lineHeight: 1.8 }}>
      <ruby>第<rt style={{ fontSize: "0.55em", color: "rgba(255,255,255,0.8)" }}>だい</rt></ruby>
      <ruby>{kanjiNum}<rt style={{ fontSize: "0.55em", color: "rgba(255,255,255,0.8)" }}>{rubyNum}</rt></ruby>
      <ruby>章<rt style={{ fontSize: "0.55em", color: "rgba(255,255,255,0.8)" }}>しょう</rt></ruby>
    </span>
  );
}

function TitleWithRuby({ stageId, title }: { stageId: string; title: string }) {
  const W = ({ children, ruby }: { children: string; ruby: string }) =>
    <R ruby={ruby} color="rgba(255,220,140,0.8)">{children}</R>;
  const map: Record<string, JSX.Element> = {
    "1-1-1": <><W ruby="ざひょう">座標</W>でコインをとろう！</>,
    "1-1-2": <>コインをあつめろ！</>,
    "1-1-3": <>たくさんあつめろ！</>,
    "1-2-1": <><W ruby="まほうじん">魔法陣</W>でチャージ！</>,
    "1-2-2": <>⚡ <W ruby="まほうつかい">魔法使</W>いの<W ruby="しれん">試練</W>！カミナリをかわせ！</>,
  };
  return map[stageId]
    ? <span style={{ lineHeight: 1.8 }}>{map[stageId]}</span>
    : <span>{title}</span>;
}

function StoryWithRuby({ stageId, story }: { stageId: string; story: string }) {
  const rubyMap: Record<string, JSX.Element> = {
    "1-1-1": <><R ruby="ゆうしゃ">勇者</R>よ！<R ruby="まほう">魔法</R>のコインがあるぞ！<R ruby="ざひょう">座標</R>を<R ruby="み">見</R>てとりにいこう！</>,
    "1-1-2": <>コインがふえたぞ！<R ruby="じゅんばん">順番</R>にうごいてとりにいこう！</>,
    "1-1-3": <><R ruby="ざひょう">座標</R>がみえないぞ！マス目をよく<R ruby="み">見</R>て、ばらばらのコインをぜんぶあつめよう！</>,
    "1-2-1": <>コインのまえにコウモリがいるぞ！<R ruby="あかまる">赤丸</R>（まほうじん）のうえで「まつ」ブロックをつかって３<R ruby="びょう">秒</R>かんエネルギーをためて、コウモリをたおそう！</>,
    "1-2-2": <>オークの<R ruby="まほう">魔法</R>でカミナリが<R ruby="こうご">交互</R>に<R ruby="お">落</R>ちるぞ！「まつ」を<R ruby="つか">使</R>って<R ruby="じょうずに">上手に</R><R ruby="すす">進</R>もう！</>,
  };
  return rubyMap[stageId] ? <span>{rubyMap[stageId]}</span> : <span>{story}</span>;
}

export default function StagePage({ params }: PageProps) {
  const router = useRouter();
  const stageConfig = getStage(params.stageId);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<CanvasEngine | null>(null);
  const animRafRef = useRef<number | null>(null);
  const isRunningRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const keyLoopRef = useRef<number | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [message, setMessage] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "running" | "win" | "lose">("idle");
  const [collectedCoins, setCollectedCoins] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isCleared, setIsCleared] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showBlockly, setShowBlockly] = useState(true);
  const [hintUsed, setHintUsed] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const [hintSeconds, setHintSeconds] = useState(10);
  const [bgmReady, setBgmReady] = useState(false);

  const handleBgmStart = () => {
    const isBoss = stageConfig?.enemyType === "orc" || stageConfig?.enemyType === "bat";
    if (isBoss) {
      audioManager.startBossBgm();
    } else {
      audioManager.startAmbientBgm();
    }
    setBgmReady(true);
  };

  useEffect(() => {
    if (!stageConfig || !canvasRef.current) return;
    if (animRafRef.current) { cancelAnimationFrame(animRafRef.current); }
    if (timerRef.current) { clearInterval(timerRef.current); }
    if (keyLoopRef.current) { clearTimeout(keyLoopRef.current); }

    const coins = stageConfig.coins.map(c => ({ ...c, collected: false, hidden: c.hidden ?? false }));
    const attackPoints = stageConfig.attackPoints.map(a => ({ ...a, hit: false }));
    const traps = stageConfig.traps ? JSON.parse(JSON.stringify(stageConfig.traps)) : [];
    const potions = stageConfig.potions ? stageConfig.potions.map(p => ({ ...p, collected: false })) : [];

    const startX = stageConfig.playerStartX ?? -150;
    const startY = stageConfig.playerStartY ?? -150;

    const initialState: GameState = {
      playerX: startX, playerY: startY,
      playerAngle: 90, 
      enemyX: stageConfig.enemyX, 
      enemyY: stageConfig.enemyY,
      enemyHP: stageConfig.enemyHP, 
      enemyMaxHP: stageConfig.enemyHP,
      enemyType: stageConfig.enemyType,
      coins, attackPoints, traps, potions, 
      gameOver: false, gameWon: false,
      damageEffects: [],
      fireballEffects: [],
      coinFloatEffects: [],
      lightningStrike: null,
      damageAccum: 0,
      explosionFrame: 0, explosionX: 0, explosionY: 0, showExplosion: false,
      showCoordLabels: stageConfig.showCoordLabels,
      hideCoinCoords: false,
      chapter: stageConfig.chapter,
      timeLeft: 0,
      isStarted: false, // ★ 初期状態は開始前
    };

    const engine = new CanvasEngine(canvasRef.current, initialState);
    engineRef.current = engine;
    setTimeLeft(stageConfig.timeLimit);
    setIsCleared(false);

    engine.loadAllSprites().then(() => {
      engine.draw();
      const loop = () => {
        engine.tickDamageEffects();
        engine.draw();
        animRafRef.current = requestAnimationFrame(loop);
      };
      animRafRef.current = requestAnimationFrame(loop);
    });

    return () => {
      if (animRafRef.current) cancelAnimationFrame(animRafRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (keyLoopRef.current) clearTimeout(keyLoopRef.current);
      audioManager.stopAll();
    };
  }, [stageConfig]);

  const handleRun = useCallback(async () => {
    if (!engineRef.current || !stageConfig || isRunningRef.current || !code.trim()) return;

    if (code.includes("__NO_EVENT_BLOCK__")) {
      setMessage("「じっこうがおされたとき」ブロックをつかおう！");
      setStatus("idle");
      return;
    }

    isRunningRef.current = true;
    setIsRunning(true);
    setStatus("running");
    setMessage("▶ じっこうちゅう...");
    setIsCleared(false);
    setIsGameOver(false);

    const engine = engineRef.current;

    // ★ 実行時に開始フラグを立てる（これで敵が攻撃し始める）
    engine.state.isStarted = true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (engine as any).keyCallbacks = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (engine as any).clickCallbacks = [];

    engine.startTime = Date.now();
    engine.state.playerX = stageConfig.playerStartX ?? -150;
    engine.state.playerY = stageConfig.playerStartY ?? -150;
    engine.state.playerAngle = 90;
    engine.state.enemyHP = stageConfig.enemyHP;
    engine.state.gameOver = false;
    engine.state.gameWon = false;
    engine.state.coins.forEach((c, i) => {
      c.collected = false;
      c.hidden = stageConfig.coins[i]?.hidden ?? false;
    });
    engine.state.potions?.forEach(p => p.collected = false);
    engine.state.attackPoints.forEach(a => a.hit = false);
    engine.state.timeLeft = 0;
    engine.state.damageEffects = [];
    engine.state.fireballEffects = [];
    engine.state.coinFloatEffects = [];
    engine.state.lightningStrike = null;
    engine.state.damageAccum = 0;
    engine.state.isBarrierActive = false;
    setCollectedCoins(0);
    engine.state.treasureBox = null; // ★ 宝箱をリセット
    engine.state.isOrcKing = false; // ★ オークキングフラグをリセット
    engine.state.lastOrcKingFireTime = undefined;
    engine.state.barrierCount = 0;
    engine.draw();

    const movePlayer = async (x: number, y: number) => {
      if (engine.state.gameOver) return;
      const targetX = Math.max(-200, Math.min(200, Number(x)));
      const targetY = Math.max(-200, Math.min(200, Number(y)));

      await engine.movePlayer(targetX, targetY);

      const got = engine.checkCoinCollection();
      if (got > 0) {
        const total = engine.state.coins.filter(c => c.collected).length;
        setCollectedCoins(total);
        setMessage(`🪙 コインをゲット！ (${total}/${engine.state.coins.length})`);
      }
    };

    const wait = (ms: number) =>
      stageConfig.allowWait ? engine.wait(Number(ms)) : Promise.resolve();

    const checkEnemyAlive = async () => {
      return engine.state.enemyHP > 0;
    };

    const pointInDirection = async (angle: number) => {
      if (engine.state.gameOver) return;
      engine.state.playerAngle = Number(angle);
      engine.draw();
      await new Promise<void>(r => setTimeout(r, 200)); 
    };

    const pointToTarget = async (target: string) => {
      if (engine.state.gameOver) return;
      let tx = 0, ty = 0;
      if (target === "enemy" || target === "slime" || target === "orc" || target === "bat") {
        tx = engine.state.enemyX; ty = engine.state.enemyY;
      } else if (target === "circle1") {
        tx = engine.state.attackPoints[0]?.x ?? 0; ty = engine.state.attackPoints[0]?.y ?? 0;
      } else if (target === "circle2") {
        tx = engine.state.attackPoints[1]?.x ?? 0; ty = engine.state.attackPoints[1]?.y ?? 0;
      } else if (target.startsWith("coin")) {
        const idx = parseInt(target.replace("coin", "")) || 0;
        const coin = engine.state.coins.filter(c => !c.collected)[idx];
        if (coin) { tx = coin.x; ty = coin.y; }
      }
      const dx = tx - engine.state.playerX;
      const dy = ty - engine.state.playerY;
      const angle = Math.atan2(dx, dy) * (180 / Math.PI);
      engine.state.playerAngle = angle;
      engine.draw();
      await new Promise<void>(r => setTimeout(r, 300));
    };

    const moveSteps = async (steps: number) => {
      if (engine.state.gameOver) return;
      const rad = engine.state.playerAngle * (Math.PI / 180);
      const dx = Math.sin(rad) * Number(steps);
      const dy = Math.cos(rad) * Number(steps);
      const targetX = Math.max(-200, Math.min(200, engine.state.playerX + dx));
      const targetY = Math.max(-200, Math.min(200, engine.state.playerY + dy));
      await engine.movePlayer(targetX, targetY);
      const got = engine.checkCoinCollection();
      if (got > 0) {
        const total = engine.state.coins.filter(c => c.collected).length;
        setCollectedCoins(total);
        setMessage(`🪙 コインをゲット！ (${total}/${engine.state.coins.length})`);
      }
    };

    const isChap3 = stageConfig.chapter === 3;
    if (isChap3) {
      if (keyLoopRef.current) clearTimeout(keyLoopRef.current);
      
      const pollLoop = () => {
        if (!isRunningRef.current) return;
        
        const total = engine.state.coins.filter(c => c.collected).length;
        setCollectedCoins(total);
        if (total > 0 && total < engine.state.coins.length) {
           setMessage(`🪙 コインをゲット！ (${total}/${engine.state.coins.length})`);
        }

        if (engine.state.gameWon) {
          setStatus("win");
          setMessage("🎉 クリア！");
          setIsCleared(true);
          isRunningRef.current = false;
          setIsRunning(false);
          return;
        }
        if (engine.state.gameOver) {
          setStatus("lose");
          setMessage(engine.state.lightningStrike ? "⚡ カミナリにうたれた！" : "やられてしまった！");
          setTimeout(() => setIsGameOver(true), 2000);
          isRunningRef.current = false;
          setIsRunning(false);
          return;
        }
        keyLoopRef.current = setTimeout(pollLoop, 100) as unknown as number;
      };
      pollLoop();
    }

    try {
      const fn = new Function(
        "engine", "movePlayer", "wait", "checkEnemyAlive", "pointInDirection", "moveSteps", "pointToTarget",
        `"use strict";
         let playerX = ${engine.state.playerX};
         let playerY = ${engine.state.playerY};
         return (async () => { ${code.replace("__NO_EVENT_BLOCK__\n", "")} })()`
      );

      await fn(engine, movePlayer, wait, checkEnemyAlive, pointInDirection, moveSteps, pointToTarget);
    } catch (e: any) {
      if (e.message === "TRAP_HIT") {
        engine.state.gameOver = true;
        engine.state.lightningStrike = {
          progress: 0,
          x: engine.toCanvasX(engine.state.playerX),
        };
        engine.draw();
        setStatus("lose");
        setMessage("⚡ カミナリにうたれた！");
        setTimeout(() => setIsGameOver(true), 2000);
      } else {
        setMessage("❌ エラー: " + e.message);
      }
    }

    if (isChap3) {
      return; 
    }

    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }

    if (engine.state.gameWon) {
      engine.draw();
      setStatus("win");
      setMessage("🎉 まものをたおした！クリア！");
      setIsCleared(true);
    } else if (engine.state.gameOver) {
      // 処理済み
    } else {
      const left = engine.state.coins.filter(c => !c.collected).length;
      const enemyDefeated = engine.state.enemyType !== "none" && engine.state.enemyHP === 0;
      if (enemyDefeated || (engine.state.enemyType === "none" && left === 0)) {
        engine.state.gameWon = true;
        engine.draw();
        setStatus("win");
        setMessage(enemyDefeated ? "🎉 まものをたおした！クリア！" : "🎉 ぜんぶのコインをとった！クリア！");
        setIsCleared(true);
      } else {
        engine.state.gameOver = true;
        engine.state.lightningStrike = {
          progress: 0,
          x: engine.toCanvasX(engine.state.playerX),
        };
        engine.draw();
        setStatus("lose");
        setMessage("まものをたおせなかった…");
        setTimeout(() => setIsGameOver(true), 2000);
      }
    }

    engine.state.timeLeft = 0;
    engine.draw();
    isRunningRef.current = false;
    setIsRunning(false);
  }, [code, stageConfig]);

  // ★ やり直しボタンの処理（実行中でも完全に初期状態に戻せる）
  const handleReset = useCallback(() => {
    if (!engineRef.current || !stageConfig) return;
    
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (keyLoopRef.current) { clearTimeout(keyLoopRef.current); keyLoopRef.current = null; }
    
    isRunningRef.current = false;
    setIsRunning(false);
    setStatus("idle");
    setMessage("");
    setIsCleared(false);
    setIsGameOver(false);

    const e = engineRef.current;
    
    // 現在実行中の関数を終わらせるために一旦 gameOver を立てる
    e.state.gameOver = true; 
    
    // 少し待ってから完全に初期化
    setTimeout(() => {
      e.startTime = Date.now();
      e.state.isStarted = false; // ★ ここで未開始状態に戻す
      e.state.playerX = stageConfig.playerStartX ?? -150;
      e.state.playerY = stageConfig.playerStartY ?? -150;
      e.state.playerAngle = 90; 
      e.state.enemyX = stageConfig.enemyX;
      e.state.enemyY = stageConfig.enemyY;
      e.state.enemyTargetX = undefined;
      e.state.enemyTargetY = undefined;
      e.state.enemyHP = stageConfig.enemyHP;
      e.state.gameOver = false; 
      e.state.gameWon = false;
      e.state.coins.forEach((c, i) => {
        c.collected = false;
        c.hidden = stageConfig.coins[i]?.hidden ?? false;
      });
      e.state.potions?.forEach(p => p.collected = false);
      e.state.attackPoints = []; // 魔法陣や予告円をリセット
      e.state.timeLeft = 0;
      e.state.damageEffects = [];
      e.state.fireballEffects = [];
      e.state.coinFloatEffects = [];
      e.state.lightningStrike = null;
      e.state.isBarrierActive = false;
      e.state.magicCircleSpawnTime = undefined;
      e.state.treasureBox = null; // ★ 宝箱をリセット
      e.state.isOrcKing = false; // ★ オークキングフラグをリセット
      e.state.lastOrcKingFireTime = undefined;
      e.state.barrierCount = 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (e as any).keyCallbacks = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (e as any).clickCallbacks = [];
      setCollectedCoins(0);
      setTimeLeft(stageConfig.timeLimit);
      e.draw();
    }, 50);
  }, [stageConfig]);

  const handleNextStage = () => {
    if (stageConfig?.nextStageId) {
      router.push(`/lesson/${stageConfig.nextStageId}`);
    }
  };

  const handleHint = () => {
    if (hintUsed || !engineRef.current) return;
    setHintUsed(true);
    setHintVisible(true);
    setHintSeconds(10);

    const engine = engineRef.current;
    engine.state.showCoordLabels = true;
    engine.state.hideCoinCoords = true;

    const endTime = Date.now() + 10000;
    let countdownSec = 10;
    let rafId: number;

    const tick = () => {
      const remaining = endTime - Date.now();
      if (remaining <= 0) {
        engine.state.showCoordLabels = false;
        engine.state.hideCoinCoords = false;
        engine.draw();
        setHintVisible(false);
        return;
      }
      engine.draw();
      const newSec = Math.ceil(remaining / 1000);
      if (newSec !== countdownSec) {
        countdownSec = newSec;
        setHintSeconds(newSec);
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
  };

  if (!stageConfig) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#fafafa", color: "#aaa", fontSize: "14px" }}>ステージがみつかりません</div>
  );

  const chNum = stageConfig.chapter;

  const gold = "#B8972A";
  const goldLight = "#F5EDCC";
  const goldGrad = "linear-gradient(135deg, #C9A84C, #A0762A)";
  const goldShadow = "0 4px 16px rgba(184,151,42,0.35)";

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#F7F4EE", fontFamily: "'Inter', 'Noto Sans JP', sans-serif" }}>

      <div style={{
        background: "linear-gradient(135deg, #2a1f0a 0%, #4a3510 40%, #3a2808 100%)",
        padding: "0 24px",
        height: "60px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        flexShrink: 0,
        boxShadow: "0 3px 16px rgba(0,0,0,0.35)",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "4px", background: goldGrad }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 60%)", pointerEvents: "none" }} />

        <button
          onClick={() => router.push("/menu")}
          style={{ display: "flex", alignItems: "center", gap: "4px", color: "rgba(255,220,140,0.7)", fontSize: "13px", background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: "6px", transition: "all 0.15s", zIndex: 1 }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,220,140,0.12)"; (e.currentTarget as HTMLButtonElement).style.color = "#F5EDCC"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "none"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,220,140,0.7)"; }}
        >
          🏠 メニュー
        </button>

        <div style={{ width: "1px", height: "20px", background: "rgba(255,220,140,0.2)", zIndex: 1 }} />

        <span style={{
          fontSize: "12px", fontWeight: 800,
          padding: "4px 14px", borderRadius: "20px",
          background: goldGrad,
          color: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
          whiteSpace: "nowrap",
          zIndex: 1,
          letterSpacing: "0.05em",
        }}>
          <ChapterBadge n={chNum} />
        </span>

        <span style={{ fontSize: "13px", color: "rgba(255,220,140,0.6)", fontWeight: 600, zIndex: 1, flexShrink: 0 }}>
          {stageConfig.stage}-{stageConfig.area}
        </span>

        <span style={{
          fontSize: "16px", fontWeight: 800, color: "#F5EDCC",
          letterSpacing: "0.02em", zIndex: 1,
          textShadow: "0 1px 4px rgba(0,0,0,0.5)",
          lineHeight: 1.8,
        }}>
          <TitleWithRuby stageId={params.stageId} title={stageConfig.title} />
        </span>

        <div style={{ flex: 1, zIndex: 1 }} />
        <div style={{ width: "80px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(255,220,140,0.4))", zIndex: 1 }} />
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        <div style={{
          width: showBlockly ? "400px" : "0px",
          flexShrink: 0,
          overflow: "hidden",
          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          background: "#fff",
          borderRight: `1px solid ${goldLight}`,
          display: "flex",
          flexDirection: "column",
          boxShadow: showBlockly ? "3px 0 16px rgba(184,151,42,0.07)" : "none",
        }}>
          <div style={{ width: "400px", height: "100%", display: "flex", flexDirection: "column" }}>

            <div style={{ padding: "14px 16px 12px", borderBottom: `1px solid #f3f0e8`, flexShrink: 0 }}>
              
              {/* ★ ここにやり直すボタンを追加 */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                <button
                  onClick={handleRun}
                  disabled={isRunning || !code.trim() || isCleared}
                  style={{
                    flex: 1,
                    padding: "14px 16px",
                    borderRadius: "12px",
                    border: "none",
                    background: isRunning || !code.trim() || isCleared ? "#e5e7eb" : goldGrad,
                    color: isRunning || !code.trim() || isCleared ? "#9ca3af" : "#fff",
                    fontWeight: 800,
                    fontSize: "15px",
                    cursor: isRunning || !code.trim() || isCleared ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                    boxShadow: isRunning || !code.trim() || isCleared ? "none" : goldShadow,
                    letterSpacing: "0.04em",
                  }}
                  onMouseEnter={e => {
                    if (!isRunning && code.trim() && !isCleared) {
                      (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(184,151,42,0.45)";
                    }
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = isRunning || !code.trim() || isCleared ? "none" : goldShadow;
                  }}
                >
                  {isRunning ? "⏳ じっこうちゅう..." : "▶ じっこう"}
                </button>
                <button
                  onClick={handleReset}
                  style={{
                    padding: "14px 16px",
                    borderRadius: "12px",
                    border: `1px solid ${goldLight}`,
                    background: "#fff",
                    color: gold,
                    fontWeight: 800,
                    fontSize: "14px",
                    cursor: "pointer",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#faf8f3"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#fff"; }}
                >
                  🔄 やりなおす
                </button>
              </div>

              {message && (
                <div style={{
                  marginTop: "10px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: status === "win" ? "#f0fdf4" : status === "lose" ? "#fef2f2" : "#faf8f3",
                  borderLeft: `3px solid ${status === "win" ? "#22c55e" : status === "lose" ? "#ef4444" : goldLight}`,
                  fontSize: "11px",
                  color: status === "win" ? "#16a34a" : status === "lose" ? "#dc2626" : "#7a6020",
                  fontWeight: status === "win" || status === "lose" ? 700 : 400,
                  lineHeight: 1.5,
                }}>
                  {message}
                </div>
              )}
            </div>

            <div style={{ flex: 1, minHeight: 0, padding: "8px" }}>
              <BlocklyEditor
                onCodeChange={setCode}
                stageBlocks={stageConfig.blocklyBlocks}
                allowWait={stageConfig.allowWait}
                defaultWaitSec={stageConfig.defaultWaitSec}
                initialCode={stageConfig.initialCode}
              />
            </div>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>

          <div style={{
            height: "40px",
            background: "#fff",
            borderBottom: `1px solid ${goldLight}`,
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            flexShrink: 0,
          }}>
            <button
              onClick={() => setShowBlockly(v => !v)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "5px 14px",
                borderRadius: "8px",
                border: `1px solid ${showBlockly ? gold + "60" : goldLight}`,
                background: showBlockly ? goldLight : "#fff",
                color: showBlockly ? gold : "#aaa",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = goldShadow; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}
            >
              🧩 {showBlockly ? "エディタを隠す" : "エディタを表示"}
            </button>
          </div>

          <div style={{
            background: goldLight,
            borderBottom: `1px solid #e8d99a`,
            padding: "10px 20px",
            flexShrink: 0,
          }}>
            <p style={{ margin: 0, fontSize: "13px", color: "#5a4510", lineHeight: 1.9, fontWeight: 500 }}>
              <StoryWithRuby stageId={params.stageId} story={stageConfig.story} />
            </p>
          </div>

          {status === "lose" && (
            <div style={{
              background: "#fffbeb",
              borderBottom: "1px solid #fde68a",
              padding: "8px 20px",
              flexShrink: 0,
              animation: "fadeIn 0.3s ease",
              display: "flex",
              alignItems: "flex-start",
              gap: "6px",
            }}>
              <span style={{ fontSize: "14px", flexShrink: 0, marginTop: "1px" }}>💡</span>
              <p style={{ margin: 0, fontSize: "12px", color: "#92400e", lineHeight: 1.7, fontWeight: 500 }}>
                <strong style={{ marginRight: "4px" }}>ヒント：</strong>
                {chNum === 1
                  ? "「まつ」ブロックや「Ｘを〇〇 Ｙを〇〇 にうごく」をうまくつかおう！"
                  : "「むき」と「ほすすむ」をつかって、じぶんのむきをよくたしかめよう！"}
              </p>
            </div>
          )}

          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", position: "relative", background: "#F7F4EE" }}>

            {stageConfig.showHintButton && (
              <button
                onClick={handleHint}
                disabled={hintUsed && !hintVisible}
                style={{
                  position: "absolute", top: 28, right: 22,
                  display: "flex", alignItems: "center", gap: "5px",
                  padding: "5px 12px", borderRadius: "8px", zIndex: 10,
                  border: `1px solid ${hintUsed ? "#e5e7eb" : "#f59e0b88"}`,
                  background: hintVisible ? "#fef3c7" : hintUsed ? "#f9fafb" : "#fffbeb",
                  color: hintUsed && !hintVisible ? "#9ca3af" : "#b45309",
                  fontSize: "11px", fontWeight: 700,
                  cursor: hintUsed && !hintVisible ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  boxShadow: hintVisible ? "0 2px 8px rgba(245,158,11,0.4)" : "0 1px 4px rgba(0,0,0,0.1)",
                }}
                onMouseEnter={e => { if (!hintUsed) (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 3px 10px rgba(245,158,11,0.4)"; }}
                onMouseLeave={e => { if (!hintVisible) (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.1)"; }}
              >
                {hintVisible
                  ? `🔍 ${hintSeconds}びょう`
                  : hintUsed
                  ? "✅ つかいずみ"
                  : "💡 ざひょうをみる"}
              </button>
            )}

            <div style={{ position: "relative", display: "inline-block", maxWidth: "100%" }}>
              <div style={{ position: "absolute", right: -18, top: "50%", transform: "translateY(-50%)", color: "rgba(220,60,60,0.95)", fontWeight: 900, fontSize: "14px", fontFamily: "monospace" }}>X</div>
              <div style={{ position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)", color: "rgba(40,140,230,0.95)", fontWeight: 900, fontSize: "14px", fontFamily: "monospace" }}>Y</div>
              <div style={{ borderRadius: "16px", overflow: "hidden", boxShadow: "0 8px 40px rgba(184,151,42,0.15), 0 2px 8px rgba(0,0,0,0.08)", border: `1px solid ${goldLight}` }}>
                <Canvas width={800} height={560} ref={canvasRef} />
              </div>
            </div>

            {isCleared && (
              <div style={{
                position: "absolute", inset: 0,
                background: "rgba(30,20,0,0.45)",
                backdropFilter: "blur(6px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 50,
                animation: "fadeIn 0.25s ease",
              }}>
                <div style={{
                  background: "#fff",
                  borderRadius: "20px",
                  padding: "44px 40px",
                  textAlign: "center",
                  boxShadow: `0 32px 80px rgba(0,0,0,0.2), 0 0 0 1px ${goldLight}`,
                  maxWidth: "320px",
                  width: "calc(100% - 48px)",
                  animation: "slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}>
                  <div style={{ width: "40px", height: "3px", background: goldGrad, borderRadius: "2px", margin: "0 auto 20px" }} />
                  <div style={{ width: "120px", height: "120px", margin: "0 auto 8px", borderRadius: "50%", overflow: "hidden", boxShadow: `0 0 24px ${goldLight}` }}>
                    <img src="/sprites/clear_cheer.jpg" alt="クリア" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <h2 style={{ fontSize: "26px", fontWeight: 800, color: "#1a1a1a", marginBottom: "6px", letterSpacing: "-0.02em" }}>クリア！</h2>
                  <p style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "28px" }}>すばらしい！よくできました！</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {stageConfig.nextStageId && (
                      <button
                        onClick={handleNextStage}
                        style={{
                          padding: "13px",
                          borderRadius: "10px",
                          border: "none",
                          background: goldGrad,
                          color: "#fff",
                          fontWeight: 800,
                          fontSize: "14px",
                          cursor: "pointer",
                          boxShadow: goldShadow,
                          transition: "transform 0.15s, box-shadow 0.15s",
                          letterSpacing: "0.02em",
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 24px rgba(184,151,42,0.45)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = goldShadow; }}
                      >
                        つぎのステージへ →
                      </button>
                    )}
                    <button
                      onClick={handleReset}
                      style={{
                        padding: "11px",
                        borderRadius: "10px",
                        border: `1px solid ${goldLight}`,
                        background: "#fff",
                        color: gold,
                        fontWeight: 600,
                        fontSize: "13px",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = goldLight; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#fff"; }}
                    >
                      もういちどプレイする
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isGameOver && (
              <div style={{
                position: "absolute", inset: 0,
                background: message.includes("カミナリ") ? "rgba(10,10,30,0.65)" : "rgba(20,0,0,0.6)",
                backdropFilter: "blur(6px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 50,
                animation: "fadeIn 0.25s ease",
              }}>
                <div style={{
                  background: message.includes("カミナリ") ? "#0a0a1a" : stageConfig.enemyType === "none" ? "#0a1020" : "#1a0a0a",
                  borderRadius: "20px",
                  padding: "44px 40px",
                  textAlign: "center",
                  boxShadow: message.includes("カミナリ")
                    ? "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(100,100,255,0.3)"
                    : stageConfig.enemyType === "none"
                    ? "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(100,150,255,0.3)"
                    : "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(220,60,60,0.3)",
                  maxWidth: "320px",
                  width: "calc(100% - 48px)",
                  animation: "slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}>
                  <div style={{
                    width: "40px", height: "3px",
                    background: message.includes("カミナリ")
                      ? "linear-gradient(135deg,#60a5fa,#3b82f6)"
                      : stageConfig.enemyType === "none"
                      ? "linear-gradient(135deg,#818cf8,#4f46e5)"
                      : "linear-gradient(135deg,#dc2626,#991b1b)",
                    borderRadius: "2px", margin: "0 auto 20px",
                  }} />
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
                    {message.includes("カミナリ")
                      ? <span style={{ fontSize: "48px", lineHeight: 1 }}>⚡</span>
                      : stageConfig.enemyType === "none"
                      ? <img src="/sprites/coin_frame1.png" alt="コイン" style={{ width: 56, height: 56, imageRendering: "pixelated" }} />
                      : <span style={{ fontSize: "48px", lineHeight: 1 }}>💀</span>
                    }
                  </div>
                  <h2 style={{
                    fontSize: "26px", fontWeight: 800,
                    color: message.includes("カミナリ") ? "#93c5fd" : stageConfig.enemyType === "none" ? "#a5b4fc" : "#fca5a5",
                    marginBottom: "6px", letterSpacing: "-0.02em",
                  }}>
                    {message.includes("カミナリ")
                      ? <><ruby>感電<rt style={{ fontSize: "0.5em", color: "rgba(147,197,253,0.7)" }}>かんでん</rt></ruby>…</>
                      : stageConfig.enemyType === "none"
                      ? <><ruby>残念<rt style={{ fontSize: "0.5em", color: "rgba(165,180,252,0.7)" }}>ざんねん</rt></ruby>…</>
                      : <><ruby>全滅<rt style={{ fontSize: "0.5em", color: "rgba(252,165,165,0.7)" }}>ぜんめつ</rt></ruby>…</>
                    }
                  </h2>
                  <p style={{
                    fontSize: "13px",
                    color: message.includes("カミナリ") ? "rgba(147,197,253,0.6)" : stageConfig.enemyType === "none" ? "rgba(165,180,252,0.6)" : "rgba(252,165,165,0.6)",
                    marginBottom: "28px", lineHeight: 1.6,
                  }}>
                    {message.includes("カミナリ")
                      ? <>カミナリにうたれた！<br />タイミングをはかろう！</>
                      : stageConfig.enemyType === "none"
                      ? <>コインをぜんぶとれなかった！<br />もう一度がんばろう！</>
                      : <>まものをたおせなかった！<br /><ruby>再挑戦<rt style={{ fontSize: "0.6em" }}>さいちょうせん</rt></ruby>しよう！</>
                    }
                  </p>
                  <button
                    onClick={handleReset}
                    style={{
                      width: "100%",
                      padding: "13px",
                      borderRadius: "10px",
                      border: "none",
                      background: message.includes("カミナリ")
                        ? "linear-gradient(135deg,#3b82f6,#1d4ed8)"
                        : stageConfig.enemyType === "none"
                        ? "linear-gradient(135deg,#6366f1,#4338ca)"
                        : "linear-gradient(135deg,#dc2626,#991b1b)",
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: "14px",
                      cursor: "pointer",
                      boxShadow: message.includes("カミナリ")
                        ? "0 4px 16px rgba(59,130,246,0.4)"
                        : stageConfig.enemyType === "none"
                        ? "0 4px 16px rgba(99,102,241,0.4)"
                        : "0 4px 16px rgba(220,38,38,0.4)",
                      transition: "transform 0.15s, box-shadow 0.15s",
                      letterSpacing: "0.02em",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
                  >
                    ↩ もう一度チャレンジ！
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bgmPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(184,151,42,0.5); }
          50% { transform: scale(1.04); box-shadow: 0 0 0 14px rgba(184,151,42,0); }
        }
        @keyframes bgmFadeOut {
          from { opacity: 1; pointer-events: all; }
          to { opacity: 0; pointer-events: none; }
        }
      `}</style>

      {!bgmReady && (
        stageConfig.enemyType === "orc" || stageConfig.enemyType === "bat" ? (
          <div
            onClick={handleBgmStart}
            style={{
              position: "fixed", inset: 0, zIndex: 200,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "linear-gradient(160deg, #0a0500 0%, #1a0800 50%, #0d0d00 100%)",
              cursor: "pointer",
              animation: "fadeIn 0.5s ease",
              overflow: "hidden",
            }}
          >
            <div style={{
              position: "absolute", inset: 0,
              background: "radial-gradient(ellipse 60% 50% at 50% 60%, rgba(180,100,0,0.18) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />
            <div style={{ position: "absolute", left: "8%", top: "10%", fontSize: "48px", opacity: 0.25, animation: "bgmPulse 2.1s ease-in-out infinite", animationDelay: "0.3s" }}>⚡</div>
            <div style={{ position: "absolute", right: "8%", top: "15%", fontSize: "36px", opacity: 0.2, animation: "bgmPulse 1.8s ease-in-out infinite", animationDelay: "0.9s" }}>⚡</div>
            <div style={{ position: "absolute", left: "15%", bottom: "20%", fontSize: "28px", opacity: 0.15, animation: "bgmPulse 2.4s ease-in-out infinite" }}>⚡</div>
            <div style={{ position: "absolute", right: "12%", bottom: "25%", fontSize: "40px", opacity: 0.18, animation: "bgmPulse 1.6s ease-in-out infinite", animationDelay: "1.2s" }}>⚡</div>

            <div style={{ textAlign: "center", position: "relative", zIndex: 1, padding: "0 24px", maxWidth: "420px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px", justifyContent: "center" }}>
                <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right, transparent, rgba(184,151,42,0.6))" }} />
                <span style={{ fontSize: "11px", color: "rgba(184,151,42,0.7)", fontWeight: 700, letterSpacing: "0.2em" }}>BOSS STAGE</span>
                <div style={{ flex: 1, height: "1px", background: "linear-gradient(to left, transparent, rgba(184,151,42,0.6))" }} />
              </div>

              <div style={{
                width: "110px", height: "110px", margin: "0 auto 20px",
                borderRadius: "50%",
                border: "2px solid rgba(184,151,42,0.4)",
                boxShadow: "0 0 40px rgba(184,100,0,0.35), inset 0 0 20px rgba(0,0,0,0.5)",
                overflow: "hidden",
                animation: "bgmPulse 2s ease-in-out infinite",
                background: "#1a0800",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {stageConfig.enemyType === "bat" 
                  ? <img src="/sprites/enemy_bat.png" alt="コウモリ" style={{ width: "90px", height: "90px", imageRendering: "pixelated" }} />
                  : <img src="/sprites/enemy_orc.png" alt="オーク" style={{ width: "90px", height: "90px", imageRendering: "pixelated" }} />
                }
              </div>

              <p style={{ color: "rgba(184,151,42,0.7)", fontSize: "12px", margin: "0 0 6px", letterSpacing: "0.15em", fontWeight: 600 }}>
                {stageConfig.stage}-{stageConfig.area}
              </p>
              <h2 style={{
                fontSize: "22px", fontWeight: 900, color: "#F5EDCC",
                margin: "0 0 20px",
                textShadow: "0 0 20px rgba(184,151,42,0.6)",
                lineHeight: 1.4,
              }}>
                <TitleWithRuby stageId={params.stageId} title={stageConfig.title} />
              </h2>

              <div style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(184,151,42,0.2)",
                borderRadius: "12px",
                padding: "14px 18px",
                marginBottom: "28px",
                fontSize: "13px", color: "rgba(245,237,204,0.85)",
                lineHeight: 2.0, textAlign: "left",
              }}>
                <StoryWithRuby stageId={params.stageId} story={stageConfig.story} />
              </div>

              <div style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "13px 32px",
                borderRadius: "50px",
                background: "linear-gradient(135deg, #C9A84C, #A0762A)",
                color: "#fff", fontWeight: 800, fontSize: "15px",
                boxShadow: "0 4px 20px rgba(184,151,42,0.45)",
                animation: "bgmPulse 1.8s ease-in-out infinite",
                letterSpacing: "0.05em",
              }}>
                ⚔️ タップしてはじめる
              </div>
              <p style={{ color: "rgba(245,237,204,0.3)", fontSize: "11px", marginTop: "12px" }}>
                ボスBGMが流れます
              </p>
            </div>
          </div>
        ) : (
          <div
            onClick={handleBgmStart}
            style={{
              position: "fixed", inset: 0, zIndex: 200,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "linear-gradient(160deg, #040810 0%, #0a1020 50%, #050a08 100%)",
              cursor: "pointer",
              animation: "fadeIn 0.5s ease",
              overflow: "hidden",
            }}
          >
            <div style={{
              position: "absolute", inset: 0,
              background: "radial-gradient(ellipse 60% 50% at 50% 60%, rgba(60,100,180,0.15) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />
            <div style={{ position: "absolute", left: "8%", top: "12%", fontSize: "36px", opacity: 0.2, animation: "bgmPulse 2.2s ease-in-out infinite" }}>✨</div>
            <div style={{ position: "absolute", right: "10%", top: "18%", fontSize: "28px", opacity: 0.15, animation: "bgmPulse 1.9s ease-in-out infinite", animationDelay: "0.8s" }}>🌟</div>
            <div style={{ position: "absolute", left: "15%", bottom: "22%", fontSize: "24px", opacity: 0.15, animation: "bgmPulse 2.5s ease-in-out infinite", animationDelay: "0.4s" }}>✨</div>
            <div style={{ position: "absolute", right: "12%", bottom: "28%", fontSize: "32px", opacity: 0.18, animation: "bgmPulse 1.7s ease-in-out infinite", animationDelay: "1.2s" }}>🌟</div>

            <div style={{ textAlign: "center", position: "relative", zIndex: 1, padding: "0 24px", maxWidth: "420px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px", justifyContent: "center" }}>
                <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right, transparent, rgba(184,151,42,0.5))" }} />
                <span style={{ fontSize: "11px", color: "rgba(184,151,42,0.65)", fontWeight: 700, letterSpacing: "0.2em" }}>
                  {stageConfig.stage}-{stageConfig.area}
                </span>
                <div style={{ flex: 1, height: "1px", background: "linear-gradient(to left, transparent, rgba(184,151,42,0.5))" }} />
              </div>

              <div style={{
                width: "110px", height: "110px", margin: "0 auto 20px",
                borderRadius: "50%",
                border: "2px solid rgba(184,151,42,0.35)",
                boxShadow: "0 0 40px rgba(60,120,255,0.2), inset 0 0 20px rgba(0,0,0,0.5)",
                overflow: "hidden",
                animation: "bgmPulse 2s ease-in-out infinite",
                background: "#080c18",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {stageConfig.enemyType === "none" && (params.stageId === "1-1-2" || params.stageId === "1-1-3")
                  ? <img src="/sprites/coin_frame1.png" alt="コイン" style={{ width: "80px", height: "80px", imageRendering: "pixelated" }} />
                  : stageConfig.enemyType === "none"
                  ? <img src="/sprites/player_front.png" alt="キャラ" style={{ width: "80px", height: "80px", imageRendering: "pixelated" }} />
                  : <span style={{ fontSize: "52px" }}>🎮</span>
                }
              </div>

              <h2 style={{
                fontSize: "22px", fontWeight: 900, color: "#F5EDCC",
                margin: "0 0 20px",
                textShadow: "0 0 20px rgba(184,151,42,0.5)",
                lineHeight: 1.5,
              }}>
                <TitleWithRuby stageId={params.stageId} title={stageConfig.title} />
              </h2>

              <div style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(184,151,42,0.18)",
                borderRadius: "12px",
                padding: "14px 18px",
                marginBottom: "28px",
                fontSize: "13px", color: "rgba(245,237,204,0.85)",
                lineHeight: 2.0, textAlign: "left",
              }}>
                <StoryWithRuby stageId={params.stageId} story={stageConfig.story} />
              </div>

              <div style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "13px 32px", borderRadius: "50px",
                background: "linear-gradient(135deg, #C9A84C, #A0762A)",
                color: "#fff", fontWeight: 800, fontSize: "15px",
                boxShadow: "0 4px 20px rgba(184,151,42,0.45)",
                animation: "bgmPulse 1.8s ease-in-out infinite",
                letterSpacing: "0.05em",
              }}>
                🎮 タップしてはじめる
              </div>
              <p style={{ color: "rgba(245,237,204,0.3)", fontSize: "11px", marginTop: "12px" }}>
                BGMが流れます
              </p>
            </div>
          </div>
        )
      )}
    </div>
  );
}