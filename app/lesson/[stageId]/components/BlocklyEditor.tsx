/* eslint-disable @typescript-eslint/no-explicit-any */
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

    // props のスナップショットをクロージャに閉じ込める
    const _stageBlocks = stageBlocks;
    const _allowWait = allowWait;
    const _defaultWaitSec = defaultWaitSec;

    const initBlockly = async () => {
      const BlocklyModule = await import("blockly");
      const Blockly: any = BlocklyModule.default || BlocklyModule;
      const { javascriptGenerator } = await import("blockly/javascript");
      const gen: any = javascriptGenerator;

      // ── ブロック定義 ──────────────────────────

      const xLabel = () => new Blockly.FieldLabel("Ｘを", "blockly-label-x");
      const yLabel = () => new Blockly.FieldLabel("Ｙを", "blockly-label-y");

      Blockly.Blocks["move_xy"] = {
        init(this: any) {
          this.appendDummyInput()
            .appendField(xLabel())
            .appendField(new Blockly.FieldNumber(0, -200, 200), "VX")
            .appendField(yLabel())
            .appendField(new Blockly.FieldNumber(0, -200, 200), "VY")
            .appendField("にうごく");
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setColour(160);
        },
      };

      Blockly.Blocks["move_x"] = {
        init(this: any) {
          this.appendDummyInput()
            .appendField(xLabel())
            .appendField(new Blockly.FieldNumber(0, -200, 200), "VALUE")
            .appendField("にうごく");
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setColour(200);
        },
      };

      Blockly.Blocks["move_y"] = {
        init(this: any) {
          this.appendDummyInput()
            .appendField(yLabel())
            .appendField(new Blockly.FieldNumber(0, -200, 200), "VALUE")
            .appendField("にうごく");
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setColour(200);
        },
      };

      Blockly.Blocks["move_dx"] = {
        init(this: any) {
          this.appendDummyInput()
            .appendField(xLabel())
            .appendField(new Blockly.FieldNumber(50, -200, 200), "VALUE")
            .appendField("ずつかえる");
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setColour(200);
        },
      };

      Blockly.Blocks["move_dy"] = {
        init(this: any) {
          this.appendDummyInput()
            .appendField(yLabel())
            .appendField(new Blockly.FieldNumber(50, -200, 200), "VALUE")
            .appendField("ずつかえる");
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setColour(200);
        },
      };

      Blockly.Blocks["wait_sec"] = {
        init(this: any) {
          this.appendDummyInput()
            .appendField(new Blockly.FieldNumber(_defaultWaitSec, 0.1, 10, 0.1), "TIME")
            .appendField("びょうまつ");
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setColour(260);
        },
      };

      Blockly.Blocks["repeat_n"] = {
        init(this: any) {
          this.appendDummyInput()
            .appendField(new Blockly.FieldNumber(3, 1, 100), "TIMES")
            .appendField("かいくりかえす");
          this.appendStatementInput("DO").setCheck(null);
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setColour(260);
        },
      };

      Blockly.Blocks["repeat_times"] = {
        init(this: any) {
          this.appendDummyInput()
            .appendField(new Blockly.FieldNumber(2, 1, 10), "TIMES")
            .appendField("かいくりかえす");
          this.appendStatementInput("DO").setCheck(null);
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setColour(120);
        },
      };

      Blockly.Blocks["on_run"] = {
        init(this: any) {
          this.appendDummyInput()
            .appendField("🟢 じっこうが おされたとき");
          this.setNextStatement(true, null);
          this.setColour(35);
        },
      };

      // 第2章：〇度にむける（コンパス入力）
      Blockly.Blocks["point_in_direction"] = {
        init(this: any) {
          let angleField: any;
          try {
            // clockwise=true, offset=90 で「右=90, 上=0, 左=-90/270, 下=180」に設定
            angleField = new Blockly.FieldAngle(90, null, {
              clockwise: true,
              offset: 90,
            });
          } catch {
            angleField = new Blockly.FieldNumber(90, -360, 360);
          }
          this.appendDummyInput()
            .appendField(angleField, "ANGLE")
            .appendField("どにむける");
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setColour(200);
          this.setTooltip("していしたかくど（上=0, 右=90, 下=180, 左=-90）にむきをかえます");
        },
      };

      // 第2章：〇歩動かす
      Blockly.Blocks["move_steps"] = {
        init(this: any) {
          this.appendDummyInput()
            .appendField(new Blockly.FieldNumber(100, 1, 500), "STEPS")
            .appendField("ほうごかす");
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setColour(160);
        },
      };

      // 第2章：〇へむける（オートエイム）
      const isCoinStage = _stageBlocks.includes("point_to_coin");
      const hasOrc = _stageBlocks.includes("point_to_target") && !isCoinStage;
      const targetOpts: [string, string][] = isCoinStage
        ? [["ポーション", "coin0"], ["むらびと", "coin1"]]
        : hasOrc
        ? [["まほうじん1", "circle1"], ["まほうじん2", "circle2"], ["オーク", "orc"]]
        : [["スライム", "slime"], ["オーク", "orc"], ["まほうじん1", "circle1"], ["まほうじん2", "circle2"]];

      Blockly.Blocks["point_to_target"] = {
        init(this: any) {
          this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown(targetOpts), "TARGET")
            .appendField("へむける");
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setColour(290);
        },
      };
      Blockly.Blocks["point_to_coin"] = Blockly.Blocks["point_to_target"];

      // ── コード生成 ──────────────────────────

      gen.forBlock["move_xy"] = (block: any) => {
        const vx = block.getFieldValue("VX") ?? "0";
        const vy = block.getFieldValue("VY") ?? "0";
        return `playerX = ${vx}; playerY = ${vy}; await movePlayer(playerX, playerY);\n`;
      };
      gen.forBlock["move_x"] = (block: any) => {
        const v = block.getFieldValue("VALUE") ?? "0";
        return `playerX = ${v}; await movePlayer(playerX, playerY);\n`;
      };
      gen.forBlock["move_y"] = (block: any) => {
        const v = block.getFieldValue("VALUE") ?? "0";
        return `playerY = ${v}; await movePlayer(playerX, playerY);\n`;
      };
      gen.forBlock["move_dx"] = (block: any) => {
        const v = block.getFieldValue("VALUE") ?? "0";
        return `playerX = playerX + (${v}); await movePlayer(playerX, playerY);\n`;
      };
      gen.forBlock["move_dy"] = (block: any) => {
        const v = block.getFieldValue("VALUE") ?? "0";
        return `playerY = playerY + (${v}); await movePlayer(playerX, playerY);\n`;
      };
      gen.forBlock["wait_sec"] = (block: any) => {
        const t = block.getFieldValue("TIME") ?? _defaultWaitSec;
        return _allowWait
          ? `await wait(${t} * 1000);\n`
          : `/* まつはつかえません */\n`;
      };
      gen.forBlock["repeat_n"] = (block: any) => {
        const n = block.getFieldValue("TIMES") ?? "1";
        const body = gen.statementToCode(block, "DO");
        return `for(let _i=0;_i<(${n});_i++){\n${body}}\n`;
      };
      gen.forBlock["repeat_times"] = (block: any) => {
        const n = block.getFieldValue("TIMES") ?? "2";
        const body = gen.statementToCode(block, "DO");
        return `for(let _ri=0;_ri<(${n});_ri++){\n${body}}\n`;
      };
      gen.forBlock["on_run"] = () => "";
      gen.forBlock["point_in_direction"] = (block: any) => {
        const raw = block.getFieldValue("ANGLE") ?? "90";
        // FieldAngle の値をそのままゲームに渡す（右=90度）
        return `await pointInDirection(${raw});\n`;
      };
      gen.forBlock["move_steps"] = (block: any) => {
        const steps = block.getFieldValue("STEPS") ?? "100";
        return `await moveSteps(${steps});\n`;
      };
      gen.forBlock["point_to_target"] = (block: any) => {
        const target = block.getFieldValue("TARGET") ?? "enemy";
        return `await pointToTarget("${target}");\n`;
      };
      gen.forBlock["point_to_coin"] = gen.forBlock["point_to_target"];

      // ── ツールボックス ──────────────────────────

      const contents: any[] = [
        { kind: "label", text: "🟢 イベント" },
        { kind: "block", type: "on_run" },
      ];

      // うごく（第1章）
      if (_stageBlocks.includes("move_xy")) {
        contents.push({ kind: "label", text: "📍 うごく" });
        contents.push({ kind: "block", type: "move_xy" });
      }

      // むく（第2章）
      if (_stageBlocks.includes("point_in_direction")) {
        contents.push({ kind: "label", text: "🧭 むく" });
        contents.push({ kind: "block", type: "point_in_direction" });
      }
      if (_stageBlocks.includes("point_to_target") || _stageBlocks.includes("point_to_coin")) {
        if (!_stageBlocks.includes("point_in_direction")) {
          contents.push({ kind: "label", text: "🧭 むく" });
        }
        contents.push({ kind: "block", type: "point_to_target" });
      }

      // ほうごかす（第2章）
      if (_stageBlocks.includes("move_steps")) {
        contents.push({ kind: "label", text: "👣 ほうごかす" });
        contents.push({ kind: "block", type: "move_steps" });
      }

      // まつ
      if (_stageBlocks.includes("wait")) {
        contents.push({
          kind: "label",
          text: _allowWait ? "⏳ まつ" : "⏳ まつ（このステージではつかえません）",
        });
        contents.push({ kind: "block", type: "wait_sec" });
      }

      // くりかえす
      if (_stageBlocks.includes("repeat_times")) {
        contents.push({ kind: "label", text: "🔁 くりかえす" });
        contents.push({ kind: "block", type: "repeat_times" });
      } else if (_stageBlocks.includes("repeat")) {
        contents.push({ kind: "label", text: "🔁 くりかえす" });
        contents.push({ kind: "block", type: "repeat_n" });
      }

      const toolbox = { kind: "flyoutToolbox", contents };

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
        const allBlocks = ws.getAllBlocks(false);
        const onRunBlock = allBlocks.find((b: any) => b.type === "on_run");
        const hasOnRun = !!onRunBlock;

        let code = "";
        if (onRunBlock) {
          // on_runのgetNextBlock()で繋がった最初のブロックを取得
          // blockToCodeは再帰的に次のブロックも処理するので1回だけ呼ぶ
          const firstBlock: any = onRunBlock.getNextBlock ? onRunBlock.getNextBlock() : null;
          if (firstBlock) {
            code = gen.blockToCode(firstBlock) || "";
          }
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