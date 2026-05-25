"use client";

import { useEffect, useRef } from "react";

interface BlocklyEditorProps {
  onCodeChange?: (code: string) => void;
  stageBlocks: string[];
  allowWait: boolean;
  defaultWaitSec: number;
}

export default function BlocklyEditor({
  onCodeChange,
  stageBlocks,
  allowWait,
  defaultWaitSec,
}: BlocklyEditorProps) {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<any>(null);

  useEffect(() => {
    if (!blocklyDiv.current) return;

    const initBlockly = async () => {
      const BlocklyModule = await import("blockly");
      const Blockly = BlocklyModule.default || BlocklyModule;
      const { javascriptGenerator } = await import("blockly/javascript");

      // ── ブロック定義 ──────────────────────────

      // ★ 新規追加：「じっこうがおされたとき」のイベントブロック（ハットブロック）
      Blockly.Blocks["event_start"] = {
        init: function () {
          this.appendDummyInput()
            .appendField("🚩 じっこうが おされたとき");
          this.setNextStatement(true, null);
          this.setColour(65);
          this.setDeletable(false); // ★ ゴミ箱に捨てられないようにする
          this.setTooltip("ここからプログラムがはじまります。このブロックの下につなげてください。");
        },
      };

      Blockly.Blocks["move_xy"] = {
        init: function () {
          this.appendDummyInput()
            .appendField("Ｘを")
            .appendField(new Blockly.FieldNumber(0, -200, 200), "VX")
            .appendField("Ｙを")
            .appendField(new Blockly.FieldNumber(0, -200, 200), "VY")
            .appendField("にうごく");
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setColour(160);
          this.setTooltip("ＸとＹのざひょうをいっきにしていしてうごきます");
        },
      };

      Blockly.Blocks["move_x"] = {
        init: function () {
          this.appendDummyInput()
            .appendField("Ｘを")
            .appendField(new Blockly.FieldNumber(0, -200, 200), "VALUE")
            .appendField("にうごく");
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setColour(200);
          this.setTooltip("Ｘざひょうだけしていしてうごきます");
        },
      };

      Blockly.Blocks["move_y"] = {
        init: function () {
          this.appendDummyInput()
            .appendField("Ｙを")
            .appendField(new Blockly.FieldNumber(0, -200, 200), "VALUE")
            .appendField("にうごく");
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setColour(200);
          this.setTooltip("Ｙざひょうだけしていしてうごきます");
        },
      };

      Blockly.Blocks["move_dx"] = {
        init: function () {
          this.appendDummyInput()
            .appendField("Ｘを")
            .appendField(new Blockly.FieldNumber(50, -200, 200), "VALUE")
            .appendField("ずつかえる");
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setColour(200);
          this.setTooltip("いまのＸから〇〇だけうごきます（マイナスもOK）");
        },
      };

      Blockly.Blocks["move_dy"] = {
        init: function () {
          this.appendDummyInput()
            .appendField("Ｙを")
            .appendField(new Blockly.FieldNumber(50, -200, 200), "VALUE")
            .appendField("ずつかえる");
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setColour(200);
          this.setTooltip("いまのＹから〇〇だけうごきます（マイナスもOK）");
        },
      };

      Blockly.Blocks["wait_sec"] = {
        init: function () {
          this.appendDummyInput()
            .appendField(new Blockly.FieldNumber(defaultWaitSec, 0.1, 10, 0.1), "TIME")
            .appendField("びょうまつ");
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setColour(260);
          this.setTooltip(
            allowWait
              ? `していしたびょうすうまちます（デフォルト${defaultWaitSec}びょう）`
              : "このステージではつかえません"
          );
        },
      };

      Blockly.Blocks["point_in_direction"] = {
        init: function () {
          this.appendDummyInput()
            .appendField(new Blockly.FieldAngle(90), "ANGLE")
            .appendField("どにむける");
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setColour(160);
          this.setTooltip("キャラクターのむきをかえます");
        },
      };

      Blockly.Blocks["move_steps"] = {
        init: function () {
          this.appendDummyInput()
            .appendField(new Blockly.FieldNumber(50, -200, 200), "STEPS")
            .appendField("ほ うごかす");
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setColour(160);
          this.setTooltip("むいているほうこうに うごきます");
        },
      };

      Blockly.Blocks["repeat_times"] = {
        init: function () {
          this.appendDummyInput()
            .appendField(new Blockly.FieldNumber(3, 1, 100), "TIMES")
            .appendField("かいくりかえす");
          this.appendStatementInput("DO").setCheck(null);
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setColour(260);
          this.setTooltip("なかのブロックをくりかえします");
        },
      };

      // ── コード生成 ──────────────────────────

      // ★ event_start 自体はコードを出さず、続くブロックを評価する
      javascriptGenerator.forBlock["event_start"] = (block: any) => {
        return ""; 
      };

      javascriptGenerator.forBlock["move_xy"] = (block: any) => {
        const vx = block.getFieldValue("VX") ?? "0";
        const vy = block.getFieldValue("VY") ?? "0";
        return `playerX = ${vx}; playerY = ${vy}; await movePlayer(playerX, playerY);\n`;
      };
      javascriptGenerator.forBlock["move_x"] = (block: any) => {
        const v = block.getFieldValue("VALUE") ?? "0";
        return `playerX = ${v}; await movePlayer(playerX, playerY);\n`;
      };
      javascriptGenerator.forBlock["move_y"] = (block: any) => {
        const v = block.getFieldValue("VALUE") ?? "0";
        return `playerY = ${v}; await movePlayer(playerX, playerY);\n`;
      };
      javascriptGenerator.forBlock["move_dx"] = (block: any) => {
        const v = block.getFieldValue("VALUE") ?? "0";
        return `playerX = playerX + (${v}); await movePlayer(playerX, playerY);\n`;
      };
      javascriptGenerator.forBlock["move_dy"] = (block: any) => {
        const v = block.getFieldValue("VALUE") ?? "0";
        return `playerY = playerY + (${v}); await movePlayer(playerX, playerY);\n`;
      };
      javascriptGenerator.forBlock["wait_sec"] = (block: any) => {
        const t = block.getFieldValue("TIME") ?? defaultWaitSec;
        return allowWait
          ? `await wait(${t} * 1000);\n`
          : `/* まつは このステージではつかえません */\n`;
      };
      javascriptGenerator.forBlock["point_in_direction"] = (block: any) => {
        const angle = block.getFieldValue("ANGLE") ?? "90";
        return `await pointInDirection(${angle});\n`;
      };
      javascriptGenerator.forBlock["move_steps"] = (block: any) => {
        const steps = block.getFieldValue("STEPS") ?? "50";
        return `await moveSteps(${steps});\n`;
      };
      javascriptGenerator.forBlock["repeat_times"] = (block: any) => {
        const n = block.getFieldValue("TIMES") ?? "1";
        const body = javascriptGenerator.statementToCode(block, "DO");
        return `for(let _i=0;_i<(${n});_i++){\n${body}}\n`;
      };

      // ── ツールボックス ──────────────────────────

      const contents: any[] = [
        { kind: "label", text: "📍 ざひょうをしていしてうごく" },
        { kind: "block", type: "move_xy" },
        { kind: "block", type: "move_x" },
        { kind: "block", type: "move_y" },
        { kind: "label", text: "↔️ いまのざひょうからうごく" },
        { kind: "block", type: "move_dx" },
        { kind: "block", type: "move_dy" },
      ];

      if (stageBlocks.includes("point_in_direction")) {
        contents.push(
          { kind: "label", text: "🔄 むきをかえる" },
          { kind: "block", type: "point_in_direction" }
        );
      }
      if (stageBlocks.includes("move_steps")) {
        contents.push(
          { kind: "label", text: "👣 まっすぐすすむ" },
          { kind: "block", type: "move_steps" }
        );
      }
      if (stageBlocks.includes("wait")) {
        contents.push(
          {
            kind: "label",
            text: allowWait ? "⏳ まつ" : "⏳ まつ（このステージではつかえません）",
          },
          { kind: "block", type: "wait_sec" }
        );
      }
      if (stageBlocks.includes("repeat_times")) {
        contents.push(
          { kind: "label", text: "🔁 くりかえす" },
          { kind: "block", type: "repeat_times" }
        );
      }

      const toolbox = { kind: "flyoutToolbox", contents };

      // ── ワークスペース初期化 ──────────────────────────

      if (workspaceRef.current) {
        workspaceRef.current.dispose();
        workspaceRef.current = null;
      }

      const ws = Blockly.inject(blocklyDiv.current!, {
        toolbox,
        scrollbars: true,
        trashcan: true,
        zoom: { controls: true, wheel: true, startScale: 0.9, maxScale: 2, minScale: 0.4 },
        grid: { spacing: 20, length: 3, colour: "#555", snap: true },
        renderer: "zelos",
      });

      // ★ 初期配置：「じっこうが おされたとき」を置く
      if (ws.getBlocksByType("event_start", false).length === 0) {
        const startBlock = ws.newBlock("event_start");
        startBlock.initSvg();
        startBlock.render();
        startBlock.moveBy(20, 20);
      }

      workspaceRef.current = ws;

      // ★ コード生成ルールの変更：繋がっているものだけを生成
      ws.addChangeListener(() => {
        const startBlocks = ws.getBlocksByType("event_start", false);
        if (startBlocks.length > 0) {
          const nextBlock = startBlocks[0].getNextBlock();
          if (nextBlock) {
            const code = javascriptGenerator.blockToCode(nextBlock) as string;
            onCodeChange?.(code);
          } else {
            onCodeChange?.("");
          }
        } else {
          onCodeChange?.("");
        }
      });
    };

    initBlockly();

    return () => {
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
        workspaceRef.current = null;
      }
    };
  }, [stageBlocks, allowWait, defaultWaitSec]);

  // ★ クリアボタンの挙動を変更（event_start だけは残す）
  const handleClearBlocks = () => {
    if (workspaceRef.current) {
      const ws = workspaceRef.current;
      const blocks = ws.getAllBlocks();
      blocks.forEach((b: any) => {
        if (b.type !== "event_start") {
          b.dispose(false);
        }
      });
    }
  };

  return (
    <div className="flex flex-col gap-2 h-full">
      <div
        ref={blocklyDiv}
        style={{ width: "100%", height: "460px", borderRadius: "6px", border: "2px solid #374151" }}
      />
      <button
        onClick={handleClearBlocks}
        className="bg-slate-600 hover:bg-slate-500 text-white text-sm font-bold py-1 px-4 rounded self-end transition-colors"
      >
        🗑️ クリア
      </button>
    </div>
  );
}