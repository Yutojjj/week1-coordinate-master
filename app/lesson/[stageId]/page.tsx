"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getStage } from "@/lib/stages";
import { CanvasEngine, GameState } from "@/lib/canvas-engine";
import Canvas from "./components/Canvas";
import dynamic from "next/dynamic";

const BlocklyEditor = dynamic(
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

export default function StagePage({ params }: PageProps) {
  const router = useRouter();
  const stageConfig = getStage(params.stageId);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<CanvasEngine | null>(null);
  const animRafRef = useRef<number | null>(null);
  const isRunningRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [message, setMessage] = useState("ブロックをくんで▶じっこうをおしてください");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "running" | "win" | "lose">("idle");
  const [collectedCoins, setCollectedCoins] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  
  const [isCleared, setIsCleared] = useState(false);

  useEffect(() => {
    if (!stageConfig || !canvasRef.current) return;
    if (animRafRef.current) { cancelAnimationFrame(animRafRef.current); }
    if (timerRef.current) { clearInterval(timerRef.current); }

    const coins = stageConfig.coins.map(c => ({ ...c, collected: false, hidden: c.hidden ?? false }));
    const attackPoints = stageConfig.attackPoints.map(a => ({ ...a, hit: false }));
    const traps = stageConfig.traps ? JSON.parse(JSON.stringify(stageConfig.traps)) : [];

    const initialState: GameState = {
      playerX: -150, playerY: -150,
      enemyX: stageConfig.enemyX, 
      enemyY: stageConfig.enemyY,
      enemyHP: stageConfig.enemyHP, 
      enemyMaxHP: stageConfig.enemyHP,
      enemyType: stageConfig.enemyType,
      coins, attackPoints, traps,
      gameOver: false, gameWon: false,
      damageEffects: [],
      explosionFrame: 0, explosionX: 0, explosionY: 0, showExplosion: false,
      showCoordLabels: stageConfig.showCoordLabels,
      timeLeft: 0,
    };

    const engine = new CanvasEngine(canvasRef.current, initialState);
    engineRef.current = engine;
    setTimeLeft(stageConfig.timeLimit);
    setIsCleared(false);

    engine.loadAllSprites().then(() => {
      engine.draw();
      const loop = () => {
        // ★ 実行中でなくても、描画とトラップの点滅は進み続ける
        engine.tickDamageEffects();
        engine.draw();
        animRafRef.current = requestAnimationFrame(loop);
      };
      animRafRef.current = requestAnimationFrame(loop);
    });

    return () => {
      if (animRafRef.current) cancelAnimationFrame(animRafRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stageConfig]);

  const handleRun = useCallback(async () => {
    if (!engineRef.current || !stageConfig || isRunningRef.current || !code.trim()) return;

    isRunningRef.current = true;
    setIsRunning(true);
    setStatus("running");
    setMessage("▶ じっこうちゅう...");
    setIsCleared(false);

    const engine = engineRef.current;

    // ★ 実行開始時にタイマーや当たり判定の基準時間をリセットする
    engine.startTime = Date.now();
    engine.state.playerX = -150;
    engine.state.playerY = -150;
    engine.state.enemyHP = stageConfig.enemyHP;
    engine.state.gameOver = false;
    engine.state.gameWon = false;
    engine.state.coins.forEach((c, i) => {
      c.collected = false;
      c.hidden = stageConfig.coins[i]?.hidden ?? false;
    });
    engine.state.attackPoints.forEach(a => a.hit = false);
    engine.state.timeLeft = stageConfig.timeLimit;
    engine.state.damageEffects = [];
    setCollectedCoins(0);
    setTimeLeft(stageConfig.timeLimit);
    engine.draw();

    let timedOut = false;
    let remaining = stageConfig.timeLimit;

    if (stageConfig.timeLimit > 0) {
      timerRef.current = setInterval(() => {
        remaining = Math.max(0, remaining - 0.1);
        engine.state.timeLeft = remaining;
        setTimeLeft(remaining);
        if (remaining <= 0) {
          timedOut = true;
          clearInterval(timerRef.current!);
        }
      }, 100);
    }

    const movePlayer = async (x: number, y: number) => {
      if (timedOut || engine.state.gameOver) return;
      const targetX = Math.max(-200, Math.min(200, Number(x)));
      const targetY = Math.max(-200, Math.min(200, Number(y)));

      const startX = engine.state.playerX;
      const startY = engine.state.playerY;
      const duration = 500;

      await new Promise<void>((resolve, reject) => {
        const startTime = performance.now();
        const animate = (time: number) => {
          if (timedOut) {
            resolve();
            return;
          }
          // ★ 移動アニメーション中も常にトラップ監視！
          if (engine.checkTraps()) {
            engine.state.gameOver = true;
            reject(new Error("TRAP_HIT"));
            return;
          }

          const elapsed = performance.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          engine.state.playerX = startX + (targetX - startX) * progress;
          engine.state.playerY = startY + (targetY - startY) * progress;
          
          engine.draw();
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            resolve();
          }
        };
        requestAnimationFrame(animate);
      });

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

    try {
      const fn = new Function(
        "movePlayer", "wait",
        `"use strict";
         let playerX = ${engine.state.playerX};
         let playerY = ${engine.state.playerY};
         return (async () => { ${code} })()`
      );
      await fn(movePlayer, wait);
    } catch (e: any) {
      // ★ カミナリに当たった時の専用エラーキャッチ
      if (e.message === "TRAP_HIT") {
        engine.state.gameOver = true;
        engine.draw();
        setStatus("lose");
        setMessage("⚡ カミナリにうたれた！タイミングをはかろう！");
      } else {
        setMessage("❌ エラー: " + e.message);
      }
    }

    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }

    // トラップでのゲームオーバーじゃなく、単純な時間切れの場合
    if (timedOut && !engine.state.gameWon && !engine.state.gameOver) {
      engine.state.gameOver = true;
      engine.draw();
      setStatus("lose");
      setMessage("⏰ じかんぎれ！「まつ」のじかんをへらしてみよう！");
    } else if (!engine.state.gameWon && !engine.state.gameOver) {
      const left = engine.state.coins.filter(c => !c.collected).length;
      if (left === 0) {
        engine.state.gameWon = true;
        engine.draw();
        setStatus("win");
        setMessage("🎉 ぜんぶのコインをとった！クリア！");
        setIsCleared(true);
      } else {
        setMessage(`コインがまだ ${left} このこっています！`);
      }
    }

    engine.state.timeLeft = 0;
    engine.draw();
    isRunningRef.current = false;
    setIsRunning(false);
  }, [code, stageConfig]);

  const handleReset = useCallback(() => {
    if (!engineRef.current || !stageConfig || isRunningRef.current) return;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    const e = engineRef.current;
    
    // ★ リセット時にも基準時間を直す
    e.startTime = Date.now();
    e.state.playerX = -150; e.state.playerY = -150;
    e.state.enemyHP = stageConfig.enemyHP;
    e.state.gameOver = false; e.state.gameWon = false;
    e.state.coins.forEach((c, i) => {
      c.collected = false;
      c.hidden = stageConfig.coins[i]?.hidden ?? false;
    });
    e.state.attackPoints.forEach(a => a.hit = false);
    e.state.timeLeft = 0;
    e.state.damageEffects = [];
    setCollectedCoins(0);
    setTimeLeft(stageConfig.timeLimit);
    setStatus("idle");
    setMessage("リセットしました。ブロックをくんでじっこうしてね");
    setIsCleared(false);
    e.draw();
  }, [stageConfig]);

  const handleNextStage = () => {
    if (stageConfig?.nextStageId) {
      router.push(`/lesson/${stageConfig.nextStageId}`);
    }
  };

  if (!stageConfig) return (
    <div className="text-white text-center py-20">ステージがみつかりません</div>
  );

  const stageNum = stageConfig.stage;
  const stageColor = stageNum === 1 ? "from-blue-600 to-blue-800"
    : stageNum === 2 ? "from-green-600 to-green-800"
    : "from-red-600 to-red-800";

  const stageIcon = stageNum === 1 ? "🪙" : stageNum === 2 ? "🪙🪙🪙🪙" : "🔥";

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }} className="bg-slate-900 relative">

      {/* ヘッダー */}
      <div className={`bg-gradient-to-r ${stageColor} px-4 py-3 shrink-0`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-2xl">{stageIcon}</span>
              <h1 className="text-xl font-bold text-white">
                Stage {stageNum}-{stageConfig.area}：{stageConfig.title}
              </h1>
            </div>
            <p className="text-white text-opacity-90 text-xs">{stageConfig.story}</p>
          </div>
          <div className="flex gap-2 items-center shrink-0 ml-4">
            {stageConfig.timeLimit > 0 && (
              <div className={`px-3 py-1 rounded text-sm font-bold transition-colors ${
                timeLeft <= 2 ? "bg-red-500 animate-pulse" :
                timeLeft <= 4 ? "bg-orange-500" : "bg-black bg-opacity-30"
              } text-white`}>
                ⏰ {timeLeft.toFixed(1)}びょう
              </div>
            )}
            <div className="bg-black bg-opacity-30 text-white px-3 py-1 rounded text-sm font-bold">
              🪙 {collectedCoins}/{stageConfig.coins.length}
            </div>
            <div className={`px-2 py-1 rounded text-xs font-bold ${
              stageConfig.showCoordLabels
                ? "bg-blue-500 text-white"
                : "bg-gray-600 text-gray-200"
            }`}>
              {stageConfig.showCoordLabels ? "📍ざひょうあり" : "🙈ざひょうなし"}
            </div>
          </div>
        </div>
      </div>

      {/* ヒント */}
      <div className="bg-slate-700 px-4 py-1.5 border-b border-slate-600 shrink-0">
        <p className="text-yellow-300 text-xs font-medium">
          {stageNum === 1 && "💡 ヒント：「Ｘを〇〇 Ｙを〇〇 にうごく」ブロックをつかってコインのざひょうにうごこう！"}
          {stageNum === 2 && "💡 ヒント：「まつ」ブロックをつかうとうごきのあいだにじかんをおくことができるよ！いろいろためしてみよう！"}
          {stageNum === 3 && `💡 ヒント：「まつ」のデフォルトは${stageConfig.defaultWaitSec}びょう！このままだとじかんぎれになるぞ！へらしてみよう！`}
        </p>
      </div>

      {/* 実行バー */}
      <div className="bg-slate-700 px-4 py-2 flex items-center gap-3 border-b border-slate-600 shrink-0">
        <button
          onClick={handleRun}
          disabled={isRunning || !code.trim() || isCleared}
          className="bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white font-bold py-2 px-6 rounded-lg text-sm transition"
        >
          {isRunning ? "⏳ じっこうちゅう..." : "▶ じっこう"}
        </button>
        <button
          onClick={handleReset}
          disabled={isRunning}
          className="bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white font-bold py-2 px-4 rounded-lg text-sm transition"
        >
          🔄 リセット
        </button>
        <button
          onClick={() => window.history.back()}
          className="bg-slate-500 hover:bg-slate-400 text-white font-bold py-2 px-4 rounded-lg text-sm transition"
        >
          ← もどる
        </button>
        <span className={`text-sm ml-1 font-medium ${
          status === "win" ? "text-yellow-300 font-bold" :
          status === "lose" ? "text-red-400 font-bold" : "text-slate-300"
        }`}>{message}</span>
      </div>

      {/* メインエリア */}
      <div style={{ display: "flex", flex: 1, gap: "12px", padding: "12px", overflow: "hidden" }}>
        {/* Blockly */}
        <div className="bg-slate-800 rounded-lg p-3 flex flex-col" style={{ width: "44%" }}>
          <h2 className="text-sm font-bold text-white mb-2">
            🧩 ブロックエディタ
            <span className="text-slate-400 text-xs ml-2 font-normal">（ひだりのブロックをドラッグ）</span>
          </h2>
          <BlocklyEditor
            onCodeChange={setCode}
            stageBlocks={stageConfig.blocklyBlocks}
            allowWait={stageConfig.allowWait}
            defaultWaitSec={stageConfig.defaultWaitSec}
          />
        </div>

        {/* Canvas */}
        <div className="bg-slate-800 rounded-lg p-3 flex flex-col flex-1 relative">
          <h2 className="text-sm font-bold text-white mb-2">
            🎮 シミュレーター
            {stageConfig.showCoordLabels
              ? <span className="text-blue-300 text-xs ml-2">（ざひょうがみえるよ）</span>
              : <span className="text-red-300 text-xs ml-2">（ざひょうがみえないぞ！）</span>
            }
          </h2>
          <Canvas width={800} height={500} ref={canvasRef} />

          {/* クリアモーダル */}
          {isCleared && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg z-50 backdrop-blur-sm">
              <div className="bg-slate-800 p-8 rounded-xl text-center shadow-2xl border-4 border-yellow-400 max-w-md w-full">
                <div className="text-5xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-yellow-400 mb-2">クリア！</h2>
                <p className="text-white mb-8">すばらしい！よくできました！</p>
                <div className="flex flex-col gap-3">
                  {stageConfig.nextStageId && (
                    <button 
                      onClick={handleNextStage}
                      className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold text-lg shadow-lg transition-transform active:scale-95"
                    >
                      つぎのステージへ ▶
                    </button>
                  )}
                  <button 
                    onClick={handleReset}
                    className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-bold shadow-lg transition-transform active:scale-95"
                  >
                    もういちどプレイする 🔄
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 生成コード（確認用） */}
      {code.trim() && (
        <div className="mx-3 mb-2 bg-slate-800 p-2 rounded text-xs shrink-0 z-10">
          <span className="text-slate-400">📄 コード：</span>
          <pre className="text-green-300 font-mono overflow-auto max-h-14 mt-1">{code}</pre>
        </div>
      )}
    </div>
  );
}