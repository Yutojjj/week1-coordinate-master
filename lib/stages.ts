export interface AttackPoint {
  id: number;
  x: number;
  y: number;
  radius: number;
}

export interface StageConfig {
  week: number;
  stage: number;
  area: number;           // エリア番号を追加
  title: string;
  story: string;
  goal: string;           // 学習目的（先生・保護者向け）
  timeLimit: number;      // 秒 (0=なし)
  enemyType: "none" | "slime" | "orc";
  enemyHP: number;
  attackPoints: AttackPoint[];
  coins: Array<{ x: number; y: number }>;
  enemySpeed: number;
  blocklyBlocks: string[];
  allowWait: boolean;
  showCoordLabels: boolean;
  defaultWaitSec: number; // waitブロックのデフォルト値（秒）
  nextStageId: string | null; // ★ 次のステージへ遷移するためのIDを追加
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
    enemyType: "none", enemyHP: 0,
    attackPoints: [],
    coins: [
      { x: 100, y: 80 } 
    ],
    enemySpeed: 0,
    blocklyBlocks: ["move_xy", "move_x", "move_y", "move_dx", "move_dy"],
    allowWait: false,
    showCoordLabels: true,
    defaultWaitSec: 1,
    nextStageId: "1-1-2", // 次のエリアへ
  },
  "1-1-2": {
    week: 1, stage: 1, area: 2,
    title: "コインをあつめろ！(エリア2)",
    story: "コインがふえたぞ！じゅんばんにうごいてとりにいこう！",
    goal: "複数の移動ブロックをつなげる（順次処理）",
    timeLimit: 0,
    enemyType: "none", enemyHP: 0,
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
    nextStageId: "1-1-3", // 次のエリアへ
  },
  "1-1-3": {
    week: 1, stage: 1, area: 3,
    title: "たくさんあつめろ！(エリア3)",
    story: "コインがたくさんあるぞ！さいごのしれんだ！",
    goal: "少し複雑な配置での順次処理マスター",
    timeLimit: 0,
    enemyType: "none", enemyHP: 0,
    attackPoints: [],
    coins: [
      { x: -100, y: 100 },
      { x: 100, y: 100 },
      { x: -100, y: -100 },
      { x: 100, y: -100 }
    ],
    enemySpeed: 0,
    blocklyBlocks: ["move_xy", "move_x", "move_y", "move_dx", "move_dy"],
    allowWait: false,
    showCoordLabels: true,
    defaultWaitSec: 1,
    nextStageId: "1-2-1", // 次のステージ（Stage 2）へ
  },

  // ─────────────────────────────────────────────────────────
  // Week 1, Stage 2：時間をあやつる洞窟（待機ブロックと制限時間）
  // ─────────────────────────────────────────────────────────
  "1-2-1": {
    week: 1, stage: 2, area: 1,
    title: "まつブロックをつかおう！(エリア1)",
    story: "コインをとるあいだに「まつ」ブロックをつかってみよう！",
    goal: "待つブロックの使い方を習得する",
    timeLimit: 0,
    enemyType: "none", enemyHP: 0,
    attackPoints: [],
    coins: [
      { x: -150, y: 120 },
      { x: 150, y: 120 }
    ],
    enemySpeed: 0,
    blocklyBlocks: ["move_xy", "move_x", "move_y", "move_dx", "move_dy", "wait"],
    allowWait: true,
    showCoordLabels: true,
    defaultWaitSec: 1,
    nextStageId: "1-2-2",
  },
  "1-2-2": {
    week: 1, stage: 2, area: 2,
    title: "じかんぎれにちゅうい！(エリア2)",
    story: "「まつ」じかんをへらさないと、じかんぎれになるぞ！",
    goal: "待つ時間を調整して制限時間内にクリアする",
    timeLimit: 6,
    enemyType: "none", enemyHP: 0,
    attackPoints: [],
    coins: [
      { x: -100, y: 0 },
      { x: 100, y: 0 },
      { x: 0, y: 100 }
    ],
    enemySpeed: 0,
    blocklyBlocks: ["move_xy", "move_x", "move_y", "move_dx", "move_dy", "wait"],
    allowWait: true,
    showCoordLabels: true,
    defaultWaitSec: 1,
    nextStageId: "1-2-3",
  },
  "1-2-3": {
    week: 1, stage: 2, area: 3,
    title: "ざひょうなし！(エリア3)",
    story: "こんどはざひょうがみえないぞ！じぶんでかんがえてみよう！",
    goal: "座標を自分で考える・時間調整の総仕上げ",
    timeLimit: 8,
    enemyType: "none", enemyHP: 0,
    attackPoints: [],
    coins: [
      { x: -150, y: 100 },
      { x: 150, y: 100 },
      { x: 0, y: 0 },
      { x: -100, y: -130 },
      { x: 100, y: -130 }
    ],
    enemySpeed: 0,
    blocklyBlocks: ["move_xy", "move_x", "move_y", "move_dx", "move_dy", "wait"],
    allowWait: true,
    showCoordLabels: false,
    defaultWaitSec: 1,
    nextStageId: "2-1-1", // Week 2へ
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
    enemyType: "slime", enemyHP: 1,
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
  },
  "2-1-2": {
    week: 2, stage: 1, area: 2,
    title: "にげたスライムをおえ！(エリア2)",
    story: "スライムのほうをむいてから、まっすぐすすんでこうげきだ！",
    goal: "向いている方向を基準にした相対的な移動（前進）を習得する",
    timeLimit: 0,
    enemyType: "slime", enemyHP: 1,
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
  },
  "2-1-3": {
    week: 2, stage: 1, area: 3,
    title: "スライムが2ひき！(エリア3)",
    story: "むきをかえてすすむ、をくりかえして2ひきたおそう！",
    goal: "向き変更と相対移動の連続処理を習得する",
    timeLimit: 0,
    enemyType: "slime", enemyHP: 2,
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
    enemyType: "orc", enemyHP: 3,
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
    nextStageId: null, // 次のステージがない場合はnull
  },
};

// 呼び出し関数もID指定に変更しています
export function getStage(id: string): StageConfig | null {
  return STAGES[id] || null;
}