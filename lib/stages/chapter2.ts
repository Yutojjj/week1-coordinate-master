import { StageConfig } from "../stages";

export const chapter2Stages: Record<string, StageConfig> = {
  // ─────────────────────────────────────────────────────────
  // 第2章, Stage 1：スライム討伐（向きの変更と相対移動）
  // ─────────────────────────────────────────────────────────
  "2-1-1": {
    chapter: 2, stage: 1, area: 1,
    title: "スライムをたおせ！",
    story: "スライムがあらわれた！その場でスライムのほう（90ど）をむいて「まつ」ブロックでこうげきだ！",
    goal: "ターゲットに向けて角度（向き）を変える操作を習得する",
    timeLimit: 0,
    enemyType: "slime", enemyHP: 1, enemyX: -150, enemyY: -50,
    attackPoints: [
      { id: 1, x: -150, y: -150, radius: 30 } // 初期位置のまま攻撃できる魔法陣
    ],
    coins: [{ x: -50, y: -150, hidden: true }],
    enemySpeed: 0,
    blocklyBlocks: ["point_in_direction", "wait"], 
    allowWait: true,
    showCoordLabels: true,
    defaultWaitSec: 1,
    nextStageId: "2-1-2",
    traps: [],
  },
  "2-1-2": {
    chapter: 2, stage: 1, area: 2,
    title: "にげたスライムをおえ！",
    story: "スライムのほう（0ど：うえ）をむいてから、まっすぐ「ほ うごかす」で進んでやっつけよう！",
    goal: "向いている方向を基準にした相対的な移動（前進）を習得する",
    timeLimit: 0,
    enemyType: "slime", enemyHP: 1, enemyX: 50, enemyY: -150,
    attackPoints: [
      { id: 1, x: -50, y: -150, radius: 30 } // 進んだ先にある攻撃ポイント
    ],
    coins: [{ x: 150, y: -150, hidden: true }],
    enemySpeed: 0,
    blocklyBlocks: ["point_in_direction", "move_steps", "wait"], 
    allowWait: true,
    showCoordLabels: true,
    defaultWaitSec: 1,
    nextStageId: "2-1-3",
    traps: [],
  },
  "2-1-3": {
    chapter: 2, stage: 1, area: 3,
    title: "スライムが2ひき！",
    story: "むきをかえてすすむ、をくりかえして2ひきともたいじだ！ざひょうラベルはないぞ！",
    goal: "向き変更と相対移動の連続処理を習得する",
    timeLimit: 0,
    enemyType: "slime", enemyHP: 2, enemyX: 0, enemyY: 0,
    attackPoints: [
      { id: 1, x: -50, y: -50, radius: 25 },
      { id: 2, x: 50, y: 50, radius: 25 }
    ],
    coins: [{ x: 150, y: 150, hidden: true }],
    enemySpeed: 0,
    blocklyBlocks: ["point_in_direction", "move_steps", "wait"], 
    allowWait: true,
    showCoordLabels: false,
    defaultWaitSec: 1,
    nextStageId: "2-2-1",
    traps: [],
  },

  // ─────────────────────────────────────────────────────────
  // 第2章, Stage 2：オークの群れ（繰り返しの活用）
  // ─────────────────────────────────────────────────────────
  "2-2-1": {
    chapter: 2, stage: 2, area: 1,
    title: "オークのむれ！",
    story: "オークが規則正しくならんでいるぞ。「くりかえす」ブロックでまとめてやっつけろ！",
    goal: "ループ処理（反復）を利用してコードを短くする",
    timeLimit: 0,
    enemyType: "orc", enemyHP: 3, enemyX: 0, enemyY: 0,
    attackPoints: [
      { id: 1, x: -100, y: -50, radius: 20 },
      { id: 2, x: 0, y: -50, radius: 20 },
      { id: 3, x: 100, y: -50, radius: 20 }
    ],
    coins: [{ x: 150, y: -50, hidden: true }],
    enemySpeed: 0,
    blocklyBlocks: ["point_in_direction", "move_steps", "wait", "repeat_times"], 
    allowWait: true,
    showCoordLabels: true,
    defaultWaitSec: 0.5,
    nextStageId: null,
    traps: [],
  },
};