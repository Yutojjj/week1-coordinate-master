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

      // カラーラベルヘルパー（X=赤, Y=青）
      const xLabel = () => new Blockly.FieldLabel("Ｘを", "blockly-label-x");
      const yLabel = () => new Blockly.FieldLabel("Ｙを", "blockly-label-y");

      Blockly.Blocks["move_xy"] = {
        init: function () {
          this.appendDummyInput()
            .appendField(xLabel())
            .appendField(new Blockly.FieldNumber(0, -200, 200), "VX")
            .appendField(yLabel())
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
            .appendField(xLabel())
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
            .appendField(yLabel())
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
            .appendField(xLabel())
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
            .appendField(yLabel())
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

      // ── 「じっこうがおされたとき」ハットブロック ──
      Blockly.Blocks["on_run"] = {
        init: function () {
          this.appendDummyInput()
            .appendField("🟢 じっこうが おされたとき");
          this.setNextStatement(true, null);
          this.setColour(35);
          this.setTooltip("▶じっこうボタンがおされたときにうごきます");
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
      // ハットブロック自体はコードを出力しない
      javascriptGenerator.forBlock["on_run"] = (_block: any) => {
        return "";
      };

      // ── ツールボックス ──────────────────────────

      const contents: any[] = [
        { kind: "label", text: "🟢 イベント" },
        { kind: "block", type: "on_run" },
        { kind: "label", text: "📍 うごく" },
        { kind: "block", type: "move_xy" },
      ];

      if (stageBlocks.includes("wait")) {
        contents.push(
          {
            kind: "label",
            text: allowWait ? "⏳ まつ" : "⏳ まつ（このステージではつかえません）",
          },
          { kind: "block", type: "wait_sec" }
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
        zoom: { controls: true, wheel: true, startScale: 0.75, maxScale: 2, minScale: 0.4 },
        grid: { spacing: 20, length: 3, colour: "#555", snap: true },
        renderer: "zelos",
      });

      workspaceRef.current = ws;

      ws.addChangeListener(() => {
        // on_runブロックにつながっているブロックのみコードを生成
        const allBlocks = ws.getAllBlocks(false);
        const onRunBlock = allBlocks.find((b: any) => b.type === "on_run");
        const hasOnRun = !!onRunBlock;

        let code = "";
        if (onRunBlock) {
          // on_runの子ブロック（DOステートメント）だけをコード化
          const body = javascriptGenerator.statementToCode(onRunBlock, "DO") ||
                       javascriptGenerator.statementToCode(onRunBlock, "NEXT") || "";
          // next接続されているブロックを順にコード化
          let next = onRunBlock.getNextBlock?.();
          let nextCode = "";
          while (next) {
            nextCode += javascriptGenerator.blockToCode(next) || "";
            next = next.getNextBlock?.();
          }
          code = body + nextCode;
        }

        onCodeChange?.(hasOnRun ? code : `__NO_EVENT_BLOCK__\n${code}`);
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
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", height: "100%" }}>
      <style>{`
        .blockly-label-x { fill: #ff6b6b !important; font-weight: bold !important; }
        .blockly-label-y { fill: #74b9ff !important; font-weight: bold !important; }
        .blocklyText.blockly-label-x { fill: #ff6b6b !important; }
        .blocklyText.blockly-label-y { fill: #74b9ff !important; }
      `}</style>
      <div
        ref={blocklyDiv}
        style={{ width: "100%", flex: 1, minHeight: 0, borderRadius: "6px", border: "2px solid #e5e7eb" }}
      />
      <button
        onClick={() => workspaceRef.current?.clear()}
        style={{ alignSelf: "flex-end", background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "4px 12px", fontSize: "12px", color: "#6b7280", cursor: "pointer" }}
      >
        🗑️ クリア
      </button>
    </div>
  );
}