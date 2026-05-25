"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  params: { week: string; stage: string };
}

export default function StagePage({ params }: PageProps) {
  const week = parseInt(params.week);
  const stage = parseInt(params.stage);
  const stageConfig = getStage(week, stage);

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

  // Canvas初期化
  useEffect(() => {
    if (!stageConfig || !canvasRef.current) return;
    if (animRafRef.current) { cancelAnimationFrame(animRafRef.current); }
    if (timerRef.current) { clearInterval(timerRef.current); }

    const coins = stageConfig.coins.map(c => ({ ...c, collected: false }));
    const attackPoints = stageConfig.attackPoints.map(a => ({ ...a, hit: false }));

    const initialState: GameState = {
      playerX: -150, playerY: -150,
      enemyX: -9999, enemyY: -9999,
      enemyHP: 0, enemyMaxHP: 0,
      coins, attackPoints,
      gameOver: false, gameWon: false,
      damageEffects: [],
      explosionFrame: 0, explosionX: 0, explosionY: 0, showExplosion: false,
      showCoordLabels: stageConfig.showCoordLabels,
      timeLeft: 0,
    };

    const engine = new CanvasEngine(canvasRef.current, initialState);
    engineRef.current = engine;
    setTimeLeft(stageConfig.timeLimit);

    engine.loadAllSprites().then(() => {
      engine.draw();
      const loop = () => {
        if (!isRunningRef.current) {
          engine.tickDamageEffects();
          engine.draw();
        }
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

    const engine = engineRef.current;

    // リセット
    engine.state.playerX = -150;
    engine.state.playerY = -150;
    engine.state.gameOver = false;
    engine.state.gameWon = false;
    engine.state.coins.forEach(c => c.collected = false);
    engine.state.timeLeft = stageConfig.timeLimit;
    engine.state.damageEffects = [];
    setCollectedCoins(0);
    setTimeLeft(stageConfig.timeLimit);
    engine.draw();

    // タイマー（timeLimit > 0 のみ）
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

    // movePlayer：毎回タイムアウトチェック
    const movePlayer = async (x: number, y: number) => {
      if (timedOut) return;
      x = Math.max(-200, Math.min(200, Number(x)));
      y = Math.max(-200, Math.min(200, Number(y)));
      await engine.movePlayer(x, y);

      const got = engine.checkCoinCollection();
      if (got > 0) {
        const total = engine.state.coins.filter(c => c.collected).length;
        setCollectedCoins(total);
        setMessage(`🪙 コインをゲット！ (${total}/${engine.state.coins.length})`);
      }
    };

    // wait：allowWait=trueのみ実際に待つ
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
      setMessage("❌ エラー: " + e.message);
    }

    // タイマー停止
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }

    // タイムアウト判定
    if (timedOut && !engine.state.gameWon) {
      engine.state.gameOver = true;
      engine.draw();
      setStatus("lose");
      setMessage("⏰ じかんぎれ！「まつ」のじかんをへらしてみよう！");
    } else if (!engine.state.gameWon) {
      // クリア判定
      const left = engine.state.coins.filter(c => !c.collected).length;
      if (left === 0) {
        engine.state.gameWon = true;
        engine.draw();
        setStatus("win");
        setMessage("🎉 ぜんぶのコインをとった！クリア！");
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
    e.state.playerX = -150; e.state.playerY = -150;
    e.state.gameOver = false; e.state.gameWon = false;
    e.state.coins.forEach(c => c.collected = false);
    e.state.timeLeft = 0;
    e.state.damageEffects = [];
    setCollectedCoins(0);
    setTimeLeft(stageConfig.timeLimit);
    setStatus("idle");
    setMessage("リセットしました。ブロックをくんでじっこうしてね");
    e.draw();
  }, [stageConfig]);

  if (!stageConfig) return (
    <div className="text-white text-center py-20">ステージがみつかりません</div>
  );

  // ステージごとの色テーマ
  const stageColor = stage === 1 ? "from-blue-600 to-blue-800"
    : stage === 2 ? "from-green-600 to-green-800"
    : "from-red-600 to-red-800";

  const stageIcon = stage === 1 ? "🪙" : stage === 2 ? "🪙🪙🪙🪙" : "🔥";

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }} className="bg-slate-900">

      {/* ヘッダー */}
      <div className={`bg-gradient-to-r ${stageColor} px-4 py-3 shrink-0`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-2xl">{stageIcon}</span>
              <h1 className="text-xl font-bold text-white">
                Stage {stage}：{stageConfig.title}
              </h1>
            </div>
            <p className="text-white text-opacity-90 text-xs">{stageConfig.story}</p>
          </div>
          <div className="flex gap-2 items-center shrink-0 ml-4">
            {/* タイマー */}
            {stageConfig.timeLimit > 0 && (
              <div className={`px-3 py-1 rounded text-sm font-bold transition-colors ${
                timeLeft <= 2 ? "bg-red-500 animate-pulse" :
                timeLeft <= 4 ? "bg-orange-500" : "bg-black bg-opacity-30"
              } text-white`}>
                ⏰ {timeLeft.toFixed(1)}びょう
              </div>
            )}
            {/* コイン数 */}
            <div className="bg-black bg-opacity-30 text-white px-3 py-1 rounded text-sm font-bold">
              🪙 {collectedCoins}/{stageConfig.coins.length}
            </div>
            {/* 座標ラベルの有無を表示 */}
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

      {/* ヒント（ステージ別） */}
      <div className="bg-slate-700 px-4 py-1.5 border-b border-slate-600 shrink-0">
        <p className="text-yellow-300 text-xs font-medium">
          {stage === 1 && "💡 ヒント：「Ｘを〇〇 Ｙを〇〇 にうごく」ブロックをつかってコインのざひょうにうごこう！"}
          {stage === 2 && "💡 ヒント：「まつ」ブロックをつかうとうごきのあいだにじかんをおくことができるよ！いろいろためしてみよう！"}
          {stage === 3 && `💡 ヒント：「まつ」のデフォルトは${stageConfig.defaultWaitSec}びょう！このままだとじかんぎれになるぞ！へらしてみよう！`}
        </p>
      </div>

      {/* 実行バー */}
      <div className="bg-slate-700 px-4 py-2 flex items-center gap-3 border-b border-slate-600 shrink-0">
        <button
          onClick={handleRun}
          disabled={isRunning || !code.trim()}
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
        <div className="bg-slate-800 rounded-lg p-3 flex flex-col flex-1">
          <h2 className="text-sm font-bold text-white mb-2">
            🎮 シミュレーター
            {stageConfig.showCoordLabels
              ? <span className="text-blue-300 text-xs ml-2">（ざひょうがみえるよ）</span>
              : <span className="text-red-300 text-xs ml-2">（ざひょうがみえないぞ！）</span>
            }
          </h2>
          <Canvas width={800} height={500} ref={canvasRef} />
        </div>
      </div>

      {/* 生成コード */}
      {code.trim() && (
        <div className="mx-3 mb-2 bg-slate-800 p-2 rounded text-xs shrink-0">
          <span className="text-slate-400">📄 コード：</span>
          <pre className="text-green-300 font-mono overflow-auto max-h-14 mt-1">{code}</pre>
        </div>
      )}
    </div>
  );
}