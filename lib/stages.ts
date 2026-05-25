export interface AttackPoint {
  id: number;
  x: number;
  y: number;
  radius: number;
}

export interface StageConfig {
  week: number;
  stage: number;
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
}

export const STAGES: Record<string, StageConfig> = {

  // ─────────────────────────────────────────────────────────
  // Stage 1-1：コイン1枚・座標あり・待つなし
  // 目的：「Xを〇〇、Yを〇〇にしてうごく」の基本操作に慣れる
  // ─────────────────────────────────────────────────────────
  "1-1": {
    week: 1, stage: 1,
    title: "コインをとろう！",
    story: "ゆうしゃよ！まほうのコインがあるぞ！ざひょうをみてとりにいこう！",
    goal: "X・Y座標を指定してキャラを動かす基本操作を習得する",
    timeLimit: 0,
    enemyType: "none", enemyHP: 0,
    attackPoints: [],
    coins: [
      { x: 100, y: 80 }, // 画面右上あたり（わかりやすい場所に1枚）
    ],
    enemySpeed: 0,
    blocklyBlocks: ["move_xy", "move_x", "move_y", "move_dx", "move_dy"],
    allowWait: false,
    showCoordLabels: true,
    defaultWaitSec: 1,
  },

  // ─────────────────────────────────────────────────────────
  // Stage 1-2：コイン4枚・座標あり・待つあり
  // 目的：複数の座標を順番に指定する + 待つブロックを体験
  // ─────────────────────────────────────────────────────────
  "1-2": {
    week: 1, stage: 2,
    title: "コインを4まいあつめろ！",
    story: "コインが4まいちらばっているぞ！ざひょうをみながらぜんぶあつめよう！「まつ」ブロックもつかってみてね！",
    goal: "複数座標の順番指定・待つブロックの使い方を習得する",
    timeLimit: 0,
    enemyType: "none", enemyHP: 0,
    attackPoints: [],
    coins: [
      { x: -150, y:  120 },
      { x:  150, y:  120 },
      { x: -150, y: -120 },
      { x:  150, y: -120 },
    ],
    enemySpeed: 0,
    blocklyBlocks: ["move_xy", "move_x", "move_y", "move_dx", "move_dy", "wait"],
    allowWait: true,
    showCoordLabels: true,
    defaultWaitSec: 1,
  },

  // ─────────────────────────────────────────────────────────
  // Stage 1-3：コイン5枚・座標なし・制限時間あり・待つあり
  // 目的：座標を自分で考える + 待つを短くしないと時間切れになる設計
  // デフォルト1秒待つ × 5回移動 = 最低5秒かかる
  // 制限時間を5秒より少し短く設定 → 待つを0.1秒などに変えないと間に合わない
  // ─────────────────────────────────────────────────────────
  "1-3": {
    week: 1, stage: 3,
    title: "ざひょうなし！はやくコインをとれ！",
    story: "こんどはざひょうがみえないぞ！そして「まつ」ブロックのじかんをへらさないとじかんぎれになるぞ！",
    goal: "座標を自分で考える・待つ時間を調整して制限時間内にクリアする",
    timeLimit: 8,  // 8秒（デフォルト1秒待つ×5移動=最低5秒+移動時間でギリギリ無理な設計）
    enemyType: "none", enemyHP: 0,
    attackPoints: [],
    coins: [
      { x: -150, y:  100 },
      { x:  150, y:  100 },
      { x:    0, y:    0 },
      { x: -100, y: -130 },
      { x:  100, y: -130 },
    ],
    enemySpeed: 0,
    blocklyBlocks: ["move_xy", "move_x", "move_y", "move_dx", "move_dy", "wait"],
    allowWait: true,
    showCoordLabels: false,   // 座標ラベルなし！
    defaultWaitSec: 1,        // waitブロックのデフォルト値（これを0.1などに変えないと間に合わない）
  },
};

export function getStage(week: number, stage: number): StageConfig | null {
  return STAGES[`${week}-${stage}`] || null;
}