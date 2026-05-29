/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";

interface BlocklyEditorProps {
  onCodeChange?: (code: string) => void;
  stageBlocks: string[];
  allowWait: boolean;
  defaultWaitSec: number;
  pointToTargets?: [string, string][];
  initialCode?: string;
}

export default function BlocklyEditor({
  onCodeChange,
  stageBlocks,
  allowWait,
  defaultWaitSec,
  pointToTargets,
  initialCode,
}: BlocklyEditorProps) {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<any>(null);

  useEffect(() => {
    if (!blocklyDiv.current) return;

    const _stageBlocks = stageBlocks;
    const _allowWait = allowWait;
    const _defaultWaitSec = defaultWaitSec;
    const _pointToTargets = pointToTargets;
    const _initialCode = initialCode;

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

      Blockly.Blocks["point_in_direction"] = {
        init(this: any) {
          let angleField: any;
          try {
            angleField = new Blockly.FieldAngle(90, null, { clockwise: true, offset: 90 });
          } catch {
            angleField = new Blockly.FieldNumber(90, -360, 360);
          }
          this.appendDummyInput()
            .appendField(angleField, "ANGLE")
            .appendField("どにむける");
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setColour(200);
        },
      };

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

      const targetOpts: [string, string][] =
        _pointToTargets && _pointToTargets.length > 0 ? _pointToTargets : [["てき", "enemy"]];

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

      Blockly.Blocks["event_when_key_pressed"] = {
        init(this: any) {
          this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([
              ["右むきやじるし", "RIGHT"],
              ["左むきやじるし", "LEFT"],
              ["上むきやじるし", "UP"],
              ["下むきやじるし", "DOWN"],
            ]), "KEY")
            .appendField("キーが おされたとき");
          this.setPreviousStatement(false, null);
          this.setNextStatement(true, null);
          this.setColour(60); 
        },
      };

      Blockly.Blocks["event_when_sprite_clicked"] = {
        init(this: any) {
          this.appendDummyInput()
            .appendField("このスプライトが おされたとき");
          this.setPreviousStatement(false, null);
          this.setNextStatement(true, null);
          this.setColour(60);
        },
      };

      Blockly.Blocks["change_x_event"] = {
        init(this: any) {
          this.appendDummyInput()
            .appendField(xLabel())
            .appendField(new Blockly.FieldNumber(10, -10, 10), "VALUE")
            .appendField("ずつかえる");
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setColour(160);
        },
      };

      Blockly.Blocks["change_y_event"] = {
        init(this: any) {
          this.appendDummyInput()
            .appendField(yLabel())
            .appendField(new Blockly.FieldNumber(10, -10, 10), "VALUE")
            .appendField("ずつかえる");
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setColour(160);
        },
      };

      Blockly.Blocks["cast_barrier"] = {
        init(this: any) {
          this.appendDummyInput()
            .appendField("🛡️ バリアをはる");
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setColour(290);
        },
      };

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
        return _allowWait ? `await wait(${t} * 1000);\n` : `/* まつはつかえません */\n`;
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
      gen.forBlock["point_in_direction"] = (block: any) => {
        const raw = block.getFieldValue("ANGLE") ?? "90";
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

      gen.forBlock["on_run"] = () => "";
      gen.forBlock["event_when_key_pressed"] = () => "";
      gen.forBlock["event_when_sprite_clicked"] = () => "";

      gen.forBlock["change_x_event"] = (block: any) => {
        const v = block.getFieldValue("VALUE") ?? "10";
        return `playerX = playerX + (${v}); await engine.movePlayerInstantly(playerX, playerY);\n`;
      };
      gen.forBlock["change_y_event"] = (block: any) => {
        const v = block.getFieldValue("VALUE") ?? "10";
        return `playerY = playerY + (${v}); await engine.movePlayerInstantly(playerX, playerY);\n`;
      };
      gen.forBlock["cast_barrier"] = () => {
        return `await engine.castBarrier();\n`;
      };

      // ── ツールボックス ──────────────────────────

      const contents: any[] = [];
      const hasEvents = _stageBlocks.some(b => b.startsWith("event_"));

      contents.push({ kind: "label", text: "🟢 イベント" });
      if (!hasEvents) {
        contents.push({ kind: "block", type: "on_run" });
      }
      if (_stageBlocks.includes("event_when_key_pressed")) {
        contents.push({ kind: "block", type: "event_when_key_pressed" });
      }
      if (_stageBlocks.includes("event_when_sprite_clicked")) {
        contents.push({ kind: "block", type: "event_when_sprite_clicked" });
      }

      if (_stageBlocks.includes("move_xy") || _stageBlocks.includes("change_x_event") || _stageBlocks.includes("change_y_event")) {
        contents.push({ kind: "label", text: "📍 うごく" });
        if (_stageBlocks.includes("move_xy")) contents.push({ kind: "block", type: "move_xy" });
        if (_stageBlocks.includes("change_x_event")) contents.push({ kind: "block", type: "change_x_event" });
        if (_stageBlocks.includes("change_y_event")) contents.push({ kind: "block", type: "change_y_event" });
      }

      if (_stageBlocks.includes("point_in_direction")) {
        contents.push({ kind: "label", text: "🧭 むく" });
        contents.push({ kind: "block", type: "point_in_direction" });
      }
      if (_stageBlocks.includes("point_to_target") || _stageBlocks.includes("point_to_coin")) {
        if (!_stageBlocks.includes("point_in_direction")) contents.push({ kind: "label", text: "🧭 むく" });
        contents.push({ kind: "block", type: "point_to_target" });
      }

      if (_stageBlocks.includes("move_steps")) {
        contents.push({ kind: "label", text: "👣 ほうごかす" });
        contents.push({ kind: "block", type: "move_steps" });
      }

      if (_stageBlocks.includes("wait")) {
        contents.push({ kind: "label", text: _allowWait ? "⏳ まつ" : "⏳ まつ（つかえません）" });
        contents.push({ kind: "block", type: "wait_sec" });
      }

      if (_stageBlocks.includes("repeat_times")) {
        contents.push({ kind: "label", text: "🔁 くりかえす" });
        contents.push({ kind: "block", type: "repeat_times" });
      } else if (_stageBlocks.includes("repeat")) {
        contents.push({ kind: "label", text: "🔁 くりかえす" });
        contents.push({ kind: "block", type: "repeat_n" });
      }

      if (_stageBlocks.includes("cast_barrier")) {
        contents.push({ kind: "label", text: "🛡️ ぼうぎょ" });
        contents.push({ kind: "block", type: "cast_barrier" });
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

      // ★ タイポ修正（parseFromString）
      if (_initialCode) {
        try {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(_initialCode, "text/xml");
          Blockly.Xml.domToWorkspace(xmlDoc.documentElement, ws);
        } catch (e) {
          console.error("Failed to load initial code:", e);
        }
      }

      workspaceRef.current = ws;

      ws.addChangeListener(() => {
        const topBlocks = ws.getTopBlocks(true);
        let finalCode = "";
        let hasValidStart = false;

        for (const tb of topBlocks) {
          if (tb.type === "on_run") {
            hasValidStart = true;
            const next = tb.getNextBlock();
            if (next) finalCode += gen.blockToCode(next) || "";
          } else if (tb.type === "event_when_key_pressed") {
            hasValidStart = true;
            const key = tb.getFieldValue("KEY") || "RIGHT";
            const next = tb.getNextBlock();
            const body = next ? gen.blockToCode(next) : "";
            // ★ キー方向に応じてプレイヤーの向きを変える
            const dirAngle: Record<string, number> = { RIGHT: 90, LEFT: 270, UP: 0, DOWN: 180 };
            const angle = dirAngle[key] ?? 90;
            finalCode += `engine.onKeyPressed("${key}", async () => {\nengine.state.playerAngle = ${angle};\n${body}});\n`;
          } else if (tb.type === "event_when_sprite_clicked") {
            hasValidStart = true;
            const next = tb.getNextBlock();
            const body = next ? gen.blockToCode(next) : "";
            finalCode += `engine.onSpriteClicked(async () => {\n${body}});\n`;
          }
        }

        onCodeChange?.(hasValidStart ? finalCode : `__NO_EVENT_BLOCK__\n${finalCode}`);
      });
    };

    initBlockly();

    return () => {
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
        workspaceRef.current = null;
      }
    };
  }, [stageBlocks, allowWait, defaultWaitSec, pointToTargets, initialCode]);

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