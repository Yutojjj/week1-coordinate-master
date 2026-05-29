import { StageConfig } from "../stages";

export const chapter3Stages: Record<string, StageConfig> = {
  "3-1-1": {
    chapter: 3, stage: 1, area: 1,
    title: "右と左へ動こう",
    story: "「右キーが押されたとき」のプログラムは完成しているぞ。\nこれを参考にして、「左キーが押されたとき」にX座標を「-10」ずつ変えるプログラムを自分で作ろう！\n準備ができたらキーボードの左右キーを押してコインを拾おう。",
    goal: "キー操作によるイベント駆動と、マイナス方向への座標変更を学ぶ",
    timeLimit: 0,
    enemyType: "none", enemyHP: 0, enemyX: 0, enemyY: 0,
    attackPoints: [],
    coins: [
      { x: 100, y: 0 },
      { x: -100, y: 0 }
    ],
    enemySpeed: 0,
    blocklyBlocks: ["event_when_key_pressed", "change_x_event"], 
    allowWait: false,
    showCoordLabels: true,
    defaultWaitSec: 0,
    nextStageId: "3-1-2",
    traps: [],
    // ★ プレイヤーの初期位置を真ん中 (0,0) に設定
    playerStartX: 0,
    playerStartY: 0,
    initialCode: `<xml xmlns="https://developers.google.com/blockly/xml">
      <block type="event_when_key_pressed" x="40" y="40">
        <field name="KEY">RIGHT</field>
        <next>
          <block type="change_x_event">
            <field name="VALUE">10</field>
          </block>
        </next>
      </block>
    </xml>`
  },
  "3-1-2": {
    chapter: 3, stage: 1, area: 2,
    title: "バリアの秘法をうばえ！",
    story: "コウモリが「バリアの秘法」のはいった宝箱をもっているぞ！\n上下左右のキー操作を作って、ランダムにとんでくる炎をよけよう！\nたまにあらわれる魔法陣を踏めば、自動で反撃できるぞ！",
    goal: "上下左右すべてのキー操作を実装し、敵の攻撃を避けながら反撃する",
    timeLimit: 0,
    enemyType: "bat", enemyHP: 25, enemyX: 0, enemyY: 150,
    attackPoints: [], // Canvas側で動的に魔法陣を生成
    coins: [],
    enemySpeed: 0,
    blocklyBlocks: ["event_when_key_pressed", "change_x_event", "change_y_event"], 
    allowWait: false,
    showCoordLabels: false,
    defaultWaitSec: 0,
    nextStageId: "3-2-1",
    traps: [],
    playerStartX: 0,
    playerStartY: -100,
  },
  "3-2-1": {
    chapter: 3, stage: 2, area: 1,
    title: "魔法のバリア",
    story: "オークが避けられない強力な炎の魔法を撃ってくる！動いて避けることはできない。\n「このスプライトが押されたとき」と「バリアをはる」ブロックを繋げて、魔法が当たる直前にキャラクターをクリックして防げ！",
    goal: "クリックイベントと用意された関数（バリア）の呼び出しを学ぶ",
    timeLimit: 0,
    enemyType: "orc", enemyHP: 1, enemyX: 0, enemyY: 150,
    attackPoints: [],
    coins: [],
    enemySpeed: 0,
    blocklyBlocks: ["event_when_sprite_clicked", "cast_barrier"], 
    allowWait: false,
    showCoordLabels: false,
    defaultWaitSec: 0,
    nextStageId: "3-2-2",
    traps: [],
    playerStartX: 0,
    playerStartY: -150,
  },
  "3-2-2": {
    chapter: 3, stage: 2, area: 2,
    title: "ボス・オークキングとの死闘",
    story: "ボス戦だ！ランダムに現れる魔法陣を踏むと自動でボスを攻撃できるぞ！\n左手（キー操作）で移動して通常攻撃を避け、右手（クリック）で全体カミナリをバリアで防げ！",
    goal: "キー操作とクリック操作を組み合わせた総合的なアクション処理",
    timeLimit: 0,
    enemyType: "orc", enemyHP: 4, enemyX: 0, enemyY: 150, 
    attackPoints: [], // Canvas側で動的に魔法陣と予告円を生成
    coins: [],
    enemySpeed: 0,
    blocklyBlocks: ["event_when_key_pressed", "change_x_event", "change_y_event", "event_when_sprite_clicked", "cast_barrier"], 
    allowWait: false,
    showCoordLabels: false,
    defaultWaitSec: 0,
    nextStageId: null,
    traps: [],
    playerStartX: 0,
    playerStartY: -150,
  }
};