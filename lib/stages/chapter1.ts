import { StageConfig } from "../stages";

export const chapter1Stages: Record<string, StageConfig> = {
  // ─────────────────────────────────────────────────────────
  // 第1章, Stage 1：はじまりの森（順次処理の基本）
  // ─────────────────────────────────────────────────────────
  "1-1-1": {
    chapter: 1, stage: 1, area: 1,
    title: "コインをとろう！",
    story: "ゆうしゃよ！まほうのコインがあるぞ！ざひょうをみてとりにいこう！",
    goal: "X・Y座標を指定してキャラを動かす基本操作を習得する",
    timeLimit: 0,
    enemyType: "none", enemyHP: 0, enemyX: 0, enemyY: 0,
    attackPoints: [],
    coins: [
      { x: 100, y: 80 } 
    ],
    enemySpeed: 0,
    blocklyBlocks: ["move_xy"],
    allowWait: false,
    showCoordLabels: true,
    defaultWaitSec: 1,
    nextStageId: "1-1-2",
    traps: [],
  },
  "1-1-2": {
    chapter: 1, stage: 1, area: 2,
    title: "コインをあつめろ！",
    story: "コインがふえたぞ！じゅんばんにうごいてとりにいこう！",
    goal: "複数の移動ブロックをつなげる（順次処理）",
    timeLimit: 0,
    enemyType: "none", enemyHP: 0, enemyX: 0, enemyY: 0,
    attackPoints: [],
    coins: [
      { x: -100, y: 100 },
      { x: 100, y: -100 }
    ],
    enemySpeed: 0,
    blocklyBlocks: ["move_xy"],
    allowWait: false,
    showCoordLabels: true,
    defaultWaitSec: 1,
    nextStageId: "1-1-3",
    traps: [],
  },
  "1-1-3": {
    chapter: 1, stage: 1, area: 3,
    title: "たくさんあつめろ！",
    story: "ざひょうがみえないぞ！グリッドをよくみて、ばらばらのコインをぜんぶあつめよう！",
    goal: "少し複雑な配置での順次処理マスター・座標の自己推測",
    timeLimit: 0,
    enemyType: "none", enemyHP: 0, enemyX: 0, enemyY: 0,
    attackPoints: [],
    coins: [
      { x: -120, y: 80 },
      { x: 140, y: 110 },
      { x: -60, y: -150 },
      { x: 80, y: -40 }
    ],
    enemySpeed: 0,
    blocklyBlocks: ["move_xy"],
    allowWait: false,
    showCoordLabels: false,
    showHintButton: true,
    defaultWaitSec: 1,
    nextStageId: "1-2-1",
    traps: [],
  },

  // ─────────────────────────────────────────────────────────
  // 第1章, Stage 2：時間をあやつる洞窟（待機ブロックと制限時間）
  // ─────────────────────────────────────────────────────────
  "1-2-1": {
    chapter: 1, stage: 2, area: 1,
    title: "まほうじんでチャージ！",
    story: "コインのまえにコウモリがいるぞ！赤丸（まほうじん）のうえで「まつ」ブロックをつかって3びょうかんエネルギーをチャージし、コウモリをたおそう！",
    goal: "特定の場所に移動し、指定時間待機（wait）することでギミックを作動させる",
    timeLimit: 0,
    enemyType: "bat", enemyHP: 12, 
    enemyX: 100, enemyY: -100, 
    attackPoints: [
      { id: 1, x: 0, y: -100, radius: 45 }
    ],
    coins: [
      { x: 160, y: -100, hidden: true }
    ],
    enemySpeed: 0,
    blocklyBlocks: ["move_xy", "wait"],
    allowWait: true,
    showCoordLabels: true,
    defaultWaitSec: 1.5,
    nextStageId: "1-2-2",
    traps: [],
  },
  "1-2-2": {
    chapter: 1, stage: 2, area: 2,
    title: "⚡ 魔法使いの試練！カミナリをかわせ！",
    story: "オークの魔法でカミナリが交互に落ちるぞ！「まつ」と「くりかえし」を使って効率よく進もう！",
    goal: "待機と移動、繰り返しの組み合わせ",
    timeLimit: 40, 
    enemyType: "orc", enemyHP: 15, enemyX: 0, enemyY: 100,
    attackPoints: [
      { id: 1, x: -50, y: 0, radius: 20 },
      { id: 2, x: 50, y: 0, radius: 20 }
    ],
    coins: [
      { x: 150, y: 0, hidden: true } 
    ],
    enemySpeed: 0,
    blocklyBlocks: ["move_xy", "wait"],
    allowWait: true,
    showCoordLabels: true,
    defaultWaitSec: 1.5,
    nextStageId: "2-1-1", // ★ 第2章へ接続
    traps: [
      { id: 1, x: -50, y: 0, radius: 45, type: "lightning", activePhase: 1, inactivePhase: 2, offset: 0 },
      { id: 2, x: 50, y: 0, radius: 45, type: "lightning", activePhase: 1, inactivePhase: 2, offset: 1.5 }
    ],
  },
};