import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

// 座標設定ブロック
Blockly.Blocks['set_x'] = {
  init: function() {
    this.appendValueInput('VALUE')
      .setCheck('Number')
      .appendField('X座標を');
    this.appendDummyInput()
      .appendField('に設定');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip('プレイヤーのX座標を設定します');
  }
};

Blockly.Blocks['set_y'] = {
  init: function() {
    this.appendValueInput('VALUE')
      .setCheck('Number')
      .appendField('Y座標を');
    this.appendDummyInput()
      .appendField('に設定');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip('プレイヤーのY座標を設定します');
  }
};

Blockly.Blocks['move'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('移動する');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip('設定した座標へ移動します');
  }
};

Blockly.Blocks['wait'] = {
  init: function() {
    this.appendValueInput('TIME')
      .setCheck('Number')
      .appendField('ミリ秒待つ');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(260);
    this.setTooltip('指定時間待機します');
  }
};

Blockly.Blocks['repeat'] = {
  init: function() {
    this.appendValueInput('TIMES')
      .setCheck('Number')
      .appendField('次を');
    this.appendDummyInput()
      .appendField('回くり返す');
    this.appendStatementInput('DO')
      .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(260);
    this.setTooltip('中のブロックを指定回数実行します');
  }
};

// JavaScript コード生成
javascriptGenerator['set_x'] = function(block) {
  const value = javascriptGenerator.valueToCode(block, 'VALUE', javascriptGenerator.ORDER_ATOMIC);
  return `playerX = ${value};\n`;
};

javascriptGenerator['set_y'] = function(block) {
  const value = javascriptGenerator.valueToCode(block, 'VALUE', javascriptGenerator.ORDER_ATOMIC);
  return `playerY = ${value};\n`;
};

javascriptGenerator['move'] = function(block) {
  return `await movePlayer(playerX, playerY);\n`;
};

javascriptGenerator['wait'] = function(block) {
  const time = javascriptGenerator.valueToCode(block, 'TIME', javascriptGenerator.ORDER_ATOMIC);
  return `await wait(${time});\n`;
};

javascriptGenerator['repeat'] = function(block) {
  const times = javascriptGenerator.valueToCode(block, 'TIMES', javascriptGenerator.ORDER_ATOMIC);
  const statements = javascriptGenerator.statementToCode(block, 'DO');
  return `for(let i = 0; i < ${times}; i++) {\n${statements}}\n`;
};

export const toolbox = {
  kind: 'flyoutToolbox',
  contents: [
    {
      kind: 'category',
      name: '移動',
      colour: 230,
      contents: [
        { kind: 'block', type: 'set_x', inputs: { VALUE: { shadow: { type: 'math_number', fields: { NUM: 100 } } } } },
        { kind: 'block', type: 'set_y', inputs: { VALUE: { shadow: { type: 'math_number', fields: { NUM: 100 } } } } },
        { kind: 'block', type: 'move' },
      ],
    },
    {
      kind: 'category',
      name: '制御',
      colour: 260,
      contents: [
        { kind: 'block', type: 'wait', inputs: { TIME: { shadow: { type: 'math_number', fields: { NUM: 500 } } } } },
        { kind: 'block', type: 'repeat', inputs: { TIMES: { shadow: { type: 'math_number', fields: { NUM: 3 } } } } },
      ],
    },
    {
      kind: 'sep',
    },
    {
      kind: 'category',
      name: '数値',
      colour: 280,
      contents: [
        { kind: 'block', type: 'math_number', fields: { NUM: 0 } },
        { kind: 'block', type: 'math_arithmetic' },
      ],
    },
  ],
};

export { Blockly, javascriptGenerator };
