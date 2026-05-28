import { chapter1Stages } from "./stages/chapter1";
import { chapter2Stages } from "./stages/chapter2";

export interface AttackPoint {
  id: number;
  x: number;
  y: number;
  radius: number;
}

export interface Trap {
  id: number;
  x: number;
  y: number;
  radius: number;
  type: "lightning" | "fire";
  activePhase: number;
  inactivePhase: number;
  offset: number;
}

export interface StageConfig {
  chapter: number; // ★ week から chapter に変更
  stage: number;
  area: number;
  title: string;
  story: string;
  goal: string;
  timeLimit: number;
  enemyType: "none" | "slime" | "orc" | "bat";
  enemyHP: number;
  enemyX: number;
  enemyY: number;
  attackPoints: AttackPoint[];
  coins: Array<{ x: number; y: number; hidden?: boolean }>;
  enemySpeed: number;
  blocklyBlocks: string[];
  allowWait: boolean;
  showCoordLabels: boolean;
  defaultWaitSec: number;
  nextStageId: string | null;
  traps: Trap[];
  showHintButton?: boolean;
}

// ★ 章ごとのステージデータを統合
export const STAGES: Record<string, StageConfig> = {
  ...chapter1Stages,
  ...chapter2Stages,
};

export function getStage(id: string): StageConfig | null {
  return STAGES[id] || null;
}