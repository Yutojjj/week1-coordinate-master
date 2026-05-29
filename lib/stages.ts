import { chapter1Stages } from "./stages/chapter1";
import { chapter2Stages } from "./stages/chapter2";
import { chapter3Stages } from "./stages/chapter3";

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
  type: "lightning" | "fire" | "spike";
  activePhase: number;
  inactivePhase: number;
  offset: number;
}

export interface StageConfig {
  chapter: number;
  stage: number;
  area: number;
  title: string;
  story: string;
  goal: string;
  timeLimit: number;
  enemyType: "none" | "slime" | "orc" | "bat" | "villager" | "flag";
  enemyHP: number;
  enemyX: number;
  enemyY: number;
  attackPoints: AttackPoint[];
  coins: Array<{ x: number; y: number; hidden?: boolean; sprite?: string; label?: string }>;
  potions?: Array<{ x: number; y: number; collected?: boolean }>;
  bgImage?: string; 
  enemySpeed: number;
  blocklyBlocks: string[];
  allowWait: boolean;
  showCoordLabels: boolean;
  defaultWaitSec: number;
  nextStageId: string | null;
  traps: Trap[];
  showHintButton?: boolean;
  initialCode?: string;
  requireCoinOrder?: boolean;
  // ★ ステージごとの初期位置設定を追加
  playerStartX?: number;
  playerStartY?: number;
}

export const STAGES: Record<string, StageConfig> = {
  ...chapter1Stages,
  ...chapter2Stages,
  ...chapter3Stages,
};

export function getStage(id: string): StageConfig | null {
  return STAGES[id] || null;
}