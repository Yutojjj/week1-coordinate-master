import { StageConfig } from "../stages";

export const chapter2Stages: Record<string, StageConfig> = {

  // ─────────────────────────────────────────────────────────
  // 第2章, Stage 1：コンパスの試練（〇どにむける）
  // ─────────────────────────────────────────────────────────
  "2-1-1": {
    chapter: 2, stage: 1, area: 1,
    title: "〇どにむけてこうげき！",
    story: "まほうじんの上でスライムのほうにむいて「まつ」でこうげきだ！はじめの向き（90ど）だとはずれるよ。75どくらいに調整してみよう！",
    goal: "向いた角度でファイアボール発射。75度で命中",
    timeLimit: 0,
    enemyType: "slime", enemyHP: 3,
    enemyX: 37, enemyY: -100,
    attackPoints: [{ id: 1, x: -150, y: -150, radius: 45 }],
    coins: [{ x: -100, y: 150, hidden: true }],
    enemySpeed: 0,
    blocklyBlocks: ["point_in_direction", "wait"],
    allowWait: true,
    showCoordLabels: true,
    defaultWaitSec: 1.5,
    nextStageId: "2-1-2",
    traps: [],
  },

  // エリア2：陣→スライムの角度がバラける配置
  // 陣(-120, 100) → スライム(120, -120)
  // 初期位置(-150,-150)→陣(-120,100)はほぼ真上
  // 陣(-120,100)→スライム(120,-120)はほぼ右上斜め45度より急角度
  "2-1-2": {
    chapter: 2, stage: 1, area: 2,
    title: "まほうじんからこうげき！",
    story: "①まほうじんのほうにむいて「ほうごかす」②スライムのほうにむいて「まつ」でこうげき！2かいむきをかえるぞ！",
    goal: "移動と攻撃で2回の角度調整を習得する",
    timeLimit: 0,
    enemyType: "slime", enemyHP: 3,
    enemyX: 118, enemyY: -136,
    attackPoints: [{ id: 1, x: -9, y: -9, radius: 30 }],
    coins: [{ x: -150, y: 150, hidden: true }],
    enemySpeed: 0,
    blocklyBlocks: ["point_in_direction", "move_steps", "wait"],
    allowWait: true,
    showCoordLabels: true,
    defaultWaitSec: 1.5,
    nextStageId: "2-2-1",
    traps: [],
  },

  // ─────────────────────────────────────────────────────────
  // 第2章, Stage 2：〇へむける（オートエイム体験）
  // ─────────────────────────────────────────────────────────
  "2-2-1": {
    chapter: 2, stage: 2, area: 1,
    title: "〇へむけてこうげき！",
    story: "まほうじんの上に立って「スライムへむける」ブロックをつかえば自動でむいてくれるぞ！あとは「まつ」でこうげき！",
    goal: "point_to_target ブロックの便利さを体験（ただしwaitは手動）",
    timeLimit: 0,
    enemyType: "slime", enemyHP: 3,
    enemyX: 120, enemyY: -100,
    attackPoints: [{ id: 1, x: -150, y: -150, radius: 45 }],
    coins: [{ x: 100, y: 100, hidden: true }],
    enemySpeed: 0,
    blocklyBlocks: ["point_to_target", "wait"],
    allowWait: true,
    showCoordLabels: true,
    defaultWaitSec: 1.5,
    nextStageId: "2-2-2",
    traps: [],
  },

  // エリア2：ポーション→村民（順序必須）
  "2-2-2": {
    chapter: 2, stage: 2, area: 2,
    title: "ふしょうした村民を救え！",
    story: "ポーションをひろってから、むらびとのもとへとどけろ！「むける」→「ほうごかす」をじゅんばんにつかおう！さきにむらびとへいってもクリアにならないよ！",
    goal: "複数ターゲットへの順序ある連続アクション。ポーション先取り必須",
    timeLimit: 0,
    enemyType: "none", enemyHP: 0, enemyX: 0, enemyY: 0,
    attackPoints: [],
    coins: [
      { x: -120, y: 100, sprite: "potion", label: "ポーション" },
      { x: 130, y: -80, sprite: "hushou", label: "村民" },
    ],
    enemySpeed: 0,
    blocklyBlocks: ["point_to_coin", "move_steps"],
    allowWait: false,
    showCoordLabels: true,
    defaultWaitSec: 1,
    nextStageId: "2-2-3",
    traps: [],
    requireCoinOrder: true,  // ポーション(0)→村民(1)の順序必須フラグ
  } as StageConfig & { requireCoinOrder?: boolean },

  // エリア3：魔法陣攻防（総合＋ループ、雷トラップ付き）
  "2-2-3": {
    chapter: 2, stage: 2, area: 3,
    title: "まほうじんの攻防！オークをたおせ！",
    story: "オークがあらわれた！まほうじん１・２をいったりきたりしながらまりょくをためてオークをそうげきせよ！雷が交互に落ちるぞ！気をつけろ！",
    goal: "魔法陣を行き来してHPを削る。交互雷トラップあり",
    timeLimit: 0,
    enemyType: "orc", enemyHP: 60,
    enemyX: 0, enemyY: -100,
    attackPoints: [
      { id: 1, x: -130, y: 100, radius: 45 },  // 魔法陣1（左）
      { id: 2, x: 130, y: 100, radius: 45 },   // 魔法陣2（右）
    ],
    coins: [{ x: 0, y: 160, hidden: true }],
    enemySpeed: 0,
    blocklyBlocks: ["point_to_target", "move_steps", "wait", "repeat_times"],
    allowWait: true,
    showCoordLabels: true,
    defaultWaitSec: 1.5,
    nextStageId: null,
    traps: [
      // 魔法陣1の上に雷（active2秒→inactive5秒）
      { id: 1, x: -130, y: 100, radius: 50, type: "lightning", activePhase: 2, inactivePhase: 5, offset: 0 },
      // 魔法陣2の上に雷（offset3.5でずらして交互に）
      { id: 2, x: 130, y: 100, radius: 50, type: "lightning", activePhase: 2, inactivePhase: 5, offset: 3.5 },
    ],
  },
};