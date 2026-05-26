// Blockly設定（ブロック定義はBlocklyEditor.tsx内で動的に行う）
// このファイルはステージ共通の設定のみ

export const BLOCK_COLORS = {
  set_coordinate: 200,
  change_coordinate: 160,
  control: 260,
  number: 280,
};

export const STAGE_BLOCK_LIST = {
  "1-1": ["set_x", "set_y", "change_x", "change_y"],
  "1-2": ["set_x", "set_y", "change_x", "change_y", "wait"],
  "1-3": ["set_x", "set_y", "change_x", "change_y", "wait", "repeat"],
};
