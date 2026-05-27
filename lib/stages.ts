export interface AttackPoint {
  id: number;
  x: number;
  y: number;
  radius: number;
}

export interface Trap {
  id: number;
  x: number;
  y: number;
  radius: number;
  type: "lightning" | "fire"; // ★ トラップの種類
  activePhase: number;        // ★ 何秒間 危険（落ちる）か
  inactivePhase: number;      // ★ 何秒間 安全（休む）か
  offset: number;             // ★ タイマーのズレ（交互にするため）
}

export interface StageConfig {
  week: number;
  stage: number;
  area: number;
  title: string;
  story: string;
  goal: string;
  timeLimit: number;
  enemyType: "none" | "slime" | "orc" | "bat";
  enemyHP: number;
  enemyX: number;
  enemyY: number;
  attackPoints: AttackPoint[];
  coins: Array<{ x: number; y: number; hidden?: boolean }>;
  enemySpeed: number;
  blocklyBlocks: string[];
  allowWait: boolean;
  showCoordLabels: boolean;
  defaultWaitSec: number;
  nextStageId: string | null;
  traps: Trap[];
}

export const STAGES: Record<string, StageConfig> = {

  // ─────────────────────────────────────────────────────────
  // Week 1, Stage 1：はじまりの森（順次処理の基本）
  // ─────────────────────────────────────────────────────────
  "1-1-1": {
    week: 1, stage: 1, area: 1,
    title: "コインをとろう！(エリア1)",
    story: "ゆうしゃよ！まほうのコインがあるぞ！ざひょうをみてとりにいこう！",
    goal: "X・Y座標を指定してキャラを動かす基本操作を習得する",
    timeLimit: 0,
    enemyType: "none", enemyHP: 0, enemyX: 0, enemyY: 0,
    attackPoints: [],
    coins: [
      { x: 100, y: 80 } 
    ],
    enemySpeed: 0,
    blocklyBlocks: ["move_xy", "move_x", "move_y", "move_dx", "move_dy"],
    allowWait: false,
    showCoordLabels: true,
    defaultWaitSec: 1,
    nextStageId: "1-1-2",
    traps: [],
  },
  "1-1-2": {
    week: 1, stage: 1, area: 2,
    title: "コインをあつめろ！(エリア2)",
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
    blocklyBlocks: ["move_xy", "move_x", "move_y", "move_dx", "move_dy"],
    allowWait: false,
    showCoordLabels: true,
    defaultWaitSec: 1,
    nextStageId: "1-1-3",
    traps: [],
  },
  "1-1-3": {
    week: 1, stage: 1, area: 3,
    title: "たくさんあつめろ！(エリア3)",
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
    blocklyBlocks: ["move_xy", "move_x", "move_y", "move_dx", "move_dy"],
    allowWait: false,
    showCoordLabels: false,
    defaultWaitSec: 1,
    nextStageId: "1-2-1",
    traps: [],
  },

  // ─────────────────────────────────────────────────────────
  // Week 1, Stage 2：時間をあやつる洞窟（待機ブロックと制限時間）
  // ─────────────────────────────────────────────────────────
  "1-2-1": {
    week: 1, stage: 2, area: 1,
    title: "まほうじんでチャージ！(エリア1)",
    story: "コインのまえにコウモリがいるぞ！赤丸（まほうじん）のうえで「まつ」ブロックをつかって3びょうかんエネルギーをチャージし、コウモリをたおそう！",
    goal: "特定の場所に移動し、指定時間待機（wait）することでギミックを作動させる",
    timeLimit: 0,
    enemyType: "bat", enemyHP: 3, 
    enemyX: 100, enemyY: -100, 
    attackPoints: [
      { id: 1, x: 0, y: -100, radius: 20 }
    ],
    coins: [
      { x: 160, y: -100, hidden: true }
    ],
    enemySpeed: 0,
    blocklyBlocks: ["move_xy", "move_x", "move_y", "move_dx", "move_dy", "wait"],
    allowWait: true,
    showCoordLabels: true,
    defaultWaitSec: 3,
    nextStageId: "1-2-2",
    traps: [],
  },
  "1-2-2": {
    week: 1, stage: 2, area: 2,
    // ★ タイトル・ストーリー・ギミックを「交互落雷」に更新！
    title: "カミナリをよけろ！(エリア2)",
    story: "オークがカミナリのまほうをうってくるぞ！「まつ」をつかって、カミナリがおちるのをやりすごそう！",
    goal: "待つ時間を調整して制限時間内にトラップを回避しクリアする",
    timeLimit: 0, // 制限時間なし
    enemyType: "orc", enemyHP: 9, enemyX: 0, enemyY: 150, // X軸100以内にいる間ダメージを与えて倒す
    attackPoints: [],
    coins: [],
    enemySpeed: 0,
    blocklyBlocks: ["move_xy", "move_x", "move_y", "move_dx", "move_dy", "wait"],
    allowWait: true,
    showCoordLabels: true,
    defaultWaitSec: 3,
    nextStageId: "2-1-1",
    traps: [
      // 完全交互: 左3秒ON→両方OFF→右3秒ON→両方OFF を繰り返す(cycle=7秒)
      // 移動中(0.5秒)は無敵なのでブロック: 3秒待つ→X=-50(3秒)→X=50(3秒)→X=-50(3秒) でクリア
      { id: 1, x: -50, y: 0, radius: 45, type: "lightning", activePhase: 3, inactivePhase: 4, offset: 0 },
      { id: 2, x: 50, y: 0, radius: 45, type: "lightning", activePhase: 3, inactivePhase: 4, offset: 3.5 }
    ],
  },
  // ─────────────────────────────────────────────────────────
  // Week 2, Stage 1：スライム討伐（向きの変更と相対移動）
  // ─────────────────────────────────────────────────────────
  "2-1-1": {
    week: 2, stage: 1, area: 1,
    title: "スライムをたおせ！(エリア1)",
    story: "スライムがあらわれた！ほうげきばしょ（赤丸）までいどうして、スライムのほうをむこう！",
    goal: "ターゲットに向けて角度（向き）を変える操作を習得する",
    timeLimit: 0,
    enemyType: "slime", enemyHP: 1, enemyX: 0, enemyY: 0,
    attackPoints: [
      { id: 1, x: 0, y: -100, radius: 20 }
    ],
    coins: [],
    enemySpeed: 0,
    blocklyBlocks: ["move_xy", "move_x", "move_y", "move_dx", "move_dy", "point_in_direction", "wait"], 
    allowWait: true,
    showCoordLabels: true,
    defaultWaitSec: 1,
    nextStageId: "2-1-2",
    traps: [],
  },
  "2-1-2": {
    week: 2, stage: 1, area: 2,
    title: "にげたスライムをおえ！(エリア2)",
    story: "スライムのほうをむいてから、まっすぐすすんでこうげきだ！",
    goal: "向いている方向を基準にした相対的な移動（前進）を習得する",
    timeLimit: 0,
    enemyType: "slime", enemyHP: 1, enemyX: 100, enemyY: 150,
    attackPoints: [
      { id: 1, x: 100, y: 100, radius: 20 }
    ],
    coins: [],
    enemySpeed: 0,
    blocklyBlocks: ["move_xy", "point_in_direction", "move_steps", "wait"], 
    allowWait: true,
    showCoordLabels: true,
    defaultWaitSec: 1,
    nextStageId: "2-1-3",
    traps: [],
  },
  "2-1-3": {
    week: 2, stage: 1, area: 3,
    title: "スライムが2ひき！(エリア3)",
    story: "むきをかえてすすむ、をくりかえして2ひきたおそう！",
    goal: "向き変更と相対移動の連続処理を習得する",
    timeLimit: 0,
    enemyType: "slime", enemyHP: 2, enemyX: 0, enemyY: 0,
    attackPoints: [
      { id: 1, x: -100, y: 100, radius: 20 },
      { id: 2, x: 100, y: -100, radius: 20 }
    ],
    coins: [],
    enemySpeed: 0,
    blocklyBlocks: ["move_xy", "point_in_direction", "move_steps", "wait"], 
    allowWait: true,
    showCoordLabels: true,
    defaultWaitSec: 1,
    nextStageId: "2-2-1",
    traps: [],
  },

  // ─────────────────────────────────────────────────────────
  // Week 2, Stage 2：オークの群れ（繰り返しの活用）
  // ─────────────────────────────────────────────────────────
  "2-2-1": {
    week: 2, stage: 2, area: 1,
    title: "オークのむれ！(エリア1)",
    story: "オークがならんでいるぞ。「くりかえす」ブロックをつかおう！",
    goal: "ループ処理（反復）を利用してコードを短くする",
    timeLimit: 0,
    enemyType: "orc", enemyHP: 3, enemyX: 0, enemyY: 0,
    attackPoints: [
      { id: 1, x: -100, y: -50, radius: 20 },
      { id: 2, x: 0, y: -50, radius: 20 },
      { id: 3, x: 100, y: -50, radius: 20 }
    ],
    coins: [],
    enemySpeed: 0,
    blocklyBlocks: ["move_steps", "point_in_direction", "repeat_times", "wait"], 
    allowWait: true,
    showCoordLabels: true,
    defaultWaitSec: 0.5,
    nextStageId: null,
    traps: [],
  },
};

export function getStage(id: string): StageConfig | null {
  return STAGES[id] || null;
}