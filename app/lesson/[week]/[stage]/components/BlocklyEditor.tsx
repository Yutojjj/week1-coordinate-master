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

      Blockly.Blocks["repeat_n"] = {
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
        // allowWait=falseの場合は待たない（0ms）
        return allowWait
          ? `await wait(${t} * 1000);\n`
          : `/* まつは このステージではつかえません */\n`;
      };
      javascriptGenerator.forBlock["repeat_n"] = (block: any) => {
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

      // 待つ（allowWaitに関わらず表示するがコードは変わる）
      if (stageBlocks.includes("wait")) {
        contents.push(
          {
            kind: "label",
            text: allowWait ? "⏳ まつ" : "⏳ まつ（このステージではつかえません）",
          },
          { kind: "block", type: "wait_sec" }
        );
      }

      if (stageBlocks.includes("repeat")) {
        contents.push(
          { kind: "label", text: "🔁 くりかえす" },
          { kind: "block", type: "repeat_n" }
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

      workspaceRef.current = ws;

      ws.addChangeListener(() => {
        const code = javascriptGenerator.workspaceToCode(ws);
        onCodeChange?.(code);
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

  return (
    <div className="flex flex-col gap-2 h-full">
      <div
        ref={blocklyDiv}
        style={{ width: "100%", height: "460px", borderRadius: "6px", border: "2px solid #374151" }}
      />
      <button
        onClick={() => workspaceRef.current?.clear()}
        className="bg-slate-600 hover:bg-slate-500 text-white text-sm font-bold py-1 px-4 rounded self-end"
      >
        🗑️ クリア
      </button>
    </div>
  );
}