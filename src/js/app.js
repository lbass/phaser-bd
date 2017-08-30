'use strict';
let GAME = {};
let func = {};
let CONFIG = null;

let GAME_WIDTH = 0;
let GAME_HEIGHT = 0;
let IS_MUTE;
let SOUND_ON_OFF_BUTTON_X = 0;
let SOUND_ON_OFF_BUTTON_Y = 0;
let CLOSE_BUTTON_X = 0;
let CLOSE_BUTTON_Y = 0;
let MY_UNIT_PANEL_XY = [];
let ENEMY_UNIT_PANEL_XY = [];
let UNIT_CONFIG = {};
let IMAGES = [];
let SPRITE_SHEETS = [];

const MY_UNIT_NAME_ARRAY = ['axeman','swordman','swordman'];
const ENEMIES_NAME_ARRAY = ['craw',null,null,null,'skel',null,null,null, 'craw'];

// data preload
let request = new XMLHttpRequest();
request.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {

    CONFIG = JSON.parse(this.responseText);
    IMAGES = CONFIG.images;
    SPRITE_SHEETS = CONFIG.sprite_sheets;
    UNIT_CONFIG = CONFIG.unit_config;

    var gameConfig = CONFIG.game_config;
    SOUND_ON_OFF_BUTTON_X = gameConfig.sound_onoff_button_x;
    SOUND_ON_OFF_BUTTON_Y = gameConfig.sound_onoff_button_y;
    CLOSE_BUTTON_X = gameConfig.close_button_x;
    CLOSE_BUTTON_Y = gameConfig.close_button_y;
    MY_UNIT_PANEL_XY = gameConfig.my_unit_panel_xy;
    ENEMY_UNIT_PANEL_XY = gameConfig.enemy_unit_panel_xy;
    GAME = new Phaser.Game(gameConfig.game_width, gameConfig.game_height, Phaser.CANVAS, '',
    {
      preload: preload,
      create: create,
      update: update
    }, false, false);
    GAME.data = {
      game_mode: 'NORMAL', // DEPLOY, NORMAL
      my_units: [],
      left_unit_bottom_panels: [],
      right_unit_bottom_panels: [],
      deployed_my_units: [],
      my_deployed_unit_count: 0,
      max_my_unit_count: MY_UNIT_NAME_ARRAY.length,
      deployed_my_units: [],
      deployed_enemies: [],
      my_unit_position: [null,null,null,null,null,null,null,null,null],
      enemy_unit_position: [null,null,null,null,null,null,null,null,null],
      round: 0,
      current_turn: 0
    };
    GAME.func = func;
    GAME.member = new Member();
  }
};
request.open('GET', './data/data.json', true);
request.send();

var TURN_ORDER = [];

function preload() {
  for(var i = 0 ; i < IMAGES.length ; i++) {
    let image = IMAGES[i];
    GAME.load.image(image.name, image.path);
  }
  for(var i = 0 ; i < SPRITE_SHEETS.length ; i++) {
    let sheet = SPRITE_SHEETS[i];
    GAME.load.spritesheet(sheet.name, sheet.path, sheet.width, sheet.height, sheet.frame);
  }
}

function create() {
  GAME.world.setBounds(0, 0, 820, 1230);
  GAME.physics.setBoundsToWorld();
  GAME.camera.x = 50;
  //  GAME에서 커서가 떠나도 게임이 정지하지 않는다.
  GAME.stage.disableVisibilityChange = true;
  GAME.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  GAME.scale.pageAlignHorizontally = true;
  GAME.scale.pageAlignVertically = true;

  GAME.member.add(new BdSprite({game: GAME, x: 0, y: 0, image_key: 'background', id: 'background'}));
  GAME.member.add(new BdSprite({game: GAME, x: 0, y: 0, image_key: 'bg_1', id: 'bg_1'}));
  GAME.member.add(new BdSprite({game: GAME, x: 0, y: 0, image_key: 'bg_2', id: 'bg_2'}));
  let bg = GAME.member.get('bg_2');
  GAME.time.events.loop(Phaser.Timer.SECOND / 2, function(){
    if(bg.getDisplayState()) bg.changeDisplayState(false);
    else bg.changeDisplayState(true);
  }, this);

  GAME.member.add(new BdMask({ game: GAME, x: 0, y: 0, color: 0x000000, id: 'mask', default_alpha: 0.0}));
  GAME.member.add(new BdSprite({game: GAME, x: 0, y: 0, image_key: 'attack_panel', id: 'attack_bottom_panel', default_alpha: 0}));

  GAME.member.add(new BdSprite({ game: GAME, x: 60, y: 332, image_key: 'active_panel', id: 'active_panel', visible: false}));
  GAME.member.get('active_panel').startTween({alpha: 0.1}, 800, 0, 5000);

  for(var i = 0 ; i < 9 ; i++) {
    var position = MY_UNIT_PANEL_XY[i];
    var index = i;
    var bdSprite = new BdSprite({ game: GAME, x: position.x, y: position.y, image_key: 'panel_selected', id: 'panel_selected_' + index, default_alpha: 0});
    GAME.member.add(bdSprite);
    bdSprite.changeInputEnableState(true);
    bdSprite.setData({
      'unit': null,
      'index': index
    });
    GAME.data.left_unit_bottom_panels.push(bdSprite);
  }

  for(var i = 0 ; i < 9 ; i++) {
    var position = ENEMY_UNIT_PANEL_XY[i];
    var bdSprite = new BdSprite({ game: GAME, x: position.x, y: position.y, image_key: 'right_battle_unit_panel', id: 'right_unit_panel_' + index, default_alpha: 0});
    GAME.data.right_unit_bottom_panels.push(bdSprite);
  }

  GAME.member.add(new BdSprite({ game: GAME, x: 50, y: 840, image_key: 'footer_ui_basic', id: 'normal_mode_footer'}));
  GAME.member.add(new BdSprite({ game: GAME, x: 50, y: 755, image_key: 'footer_ui_select', id: 'deploy_mode_footer', visible: false}));

  let props = { game: GAME, x: 0, y: 0, image_key: 'battleStart', id: 'start_effect', visible: false, animations: { 'battleEffect' : { data: [0,1,2,3,4,5,6,7,8,9,10], is_loop: false } }};
  GAME.member.add(new BdSprite(props));
  props = { game: GAME, x: 0, y: 0, image_key: 'boomb', id: 'boom_effect', visible: false, animations: { 'explosion' : { data: [0,1,2,3,4,5,6,7], is_loop: false } }};
  GAME.member.add(new BdSprite(props));

  for(var i = 0 ; i < MY_UNIT_NAME_ARRAY.length ; i++) {
    var properties = {
      game: GAME,
      position: null,
      unitData: UNIT_CONFIG[MY_UNIT_NAME_ARRAY[i]],
      buttonClickHandler: initUnitButton
    };
    var unit = new MyUnit(properties);
    GAME.data.my_units.push(unit);
  }
  sortUnitButton();

  GAME.member.add(new BdButton({ game: GAME, x: 410, y: 985, image_key: 'btn_member_0', id: 'deploy_mode_button'}));
  GAME.member.add(new BdButton({ game: GAME, x: 410, y: 1122, image_key: 'btn_start', id: 'battle_start_button'}));

  GAME.member.add(new BdSprite({ game: GAME, x: 316, y: 843, image_key: 'small_tip', id: 'small_tip'}));
  let smallTip = GAME.member.get('small_tip');
  let smallTipPosition = smallTip.getPosition();
  smallTip.startTween({ y: smallTipPosition.y - 10 }, 300, 0, -1);

  GAME.sound.mute = IS_MUTE;
  GAME.member.add(new SoundButton({ game: GAME, x: SOUND_ON_OFF_BUTTON_X, y: SOUND_ON_OFF_BUTTON_Y}));
  GAME.member.add(new CloseButton({ game: GAME, x: CLOSE_BUTTON_X, y: CLOSE_BUTTON_Y}));

  createEnemies();

  GAME.member.add(new BdSprite({ game: GAME, x: 116, y: 327, image_key: 'round_1', id: 'display_round', default_alpha: 0}));
  GAME.member.add(new BdSprite({ game: GAME, x: 50, y: 755, image_key: 'bg_round_1', id: 'bg_round', visible: false}));
  GAME.member.add(new BdSprite({ game: GAME, x: 346, y: 1003, image_key: 'speedX2', id: 'speed_sprite', visible: false, animations: { 'run' : { data: [0,1,2,3,4,5,6], is_loop: true }}}));

  var koAniData = [0,1,2,3,4,5,6];
  props = {
    game: GAME,
    x: 0,
    y: 0,
    image_key: 'ko',
    animations: {
      'run' : {
        data: koAniData,
        is_loop: false
      }
    },
    visible: false
  };
  for(let i = 1 ; i <= 3 ; i++) {
    props['id'] = 'ko_sprite_' + i;
    GAME.member.add(new BdSprite(props));
  }

  GAME.member.add(new BdSprite({ game: GAME, x: 144, y: 650, image_key: 'skill_axeman', id: 'skill_text', visible: false}));
  GAME.member.add(new BdButton({ game: GAME, x: 410, y: 140, image_key: 'tip_01', id: 'tutorial_button'}));
  GAME.member.add(new BdMask({ game: GAME, x: 0, y: 0, color: 0xFF0000, id: 'red_mask', default_alpha: 0.0}));
  GAME.member.add(new BdMask({ game: GAME, x: 0, y: 0, color: 0x000000, id: 'all_mask', default_alpha: 0.0, event_enable: true}));

  GAME.member.add(new BdSprite({ game: GAME, x: 50, y: 383, image_key: 'tutorial_1', id: 'tutorial_movie', visible: false}));
  GAME.func.changeGameMode('PRESTART');
}

func.initForBattle = function() {
  let deployedMyUnits = GAME.data.deployed_my_units;
  if(deployedMyUnits.length <= 0) {
    let allMask = GAME.member.get('all_mask');
    allMask.setAlpha(0.9);
    allMask.changeInputEnableState(true);
    allMask.bringToTop();

    let warningMessage = GAME.add.sprite(105, 672, 'battle_warning_message');

    GAME.time.events.add(1000, function() {
      allMask.setAlpha(0);
      allMask.changeInputEnableState(false);
      warningMessage.destroy();
    }, this);
    return;
  }
  GAME.data.current_turn = 0;
  for(var i = 0 ; i < deployedMyUnits.length ; i++) {
    TURN_ORDER[i] = deployedMyUnits[i];
  }
  let deployedEnemies = GAME.data.deployed_enemies;
  for(var i = 0 ; i < deployedEnemies.length ; i++) {
    TURN_ORDER.splice((i * 2) + 1, 0, deployedEnemies[i]);
  }
  GAME.func.changeGameMode('WAIT');
  GAME.data.round = 1;
  GAME.func.alertStartRound(GAME.data.round);
  GAME.time.events.add(2000, function() {
    GAME.func.changeGameMode('BATTLE');
  }, this);
}

func.changeGameMode = function(mode) {
  GAME.data.game_mode = mode;
  if(mode === 'PRESTART') {
    var panel = GAME.add.button(50, 0, 'start_tutorial_1');
    var imageIndex = 1;
    var timeEvent = GAME.time.events.loop(Phaser.Timer.SECOND / 2,
      function(){
        if(imageIndex ===1) {
          imageIndex = 2;
        } else {
          imageIndex = 1;
        }
        panel.loadTexture('start_tutorial_' + imageIndex, 0);
      }, this);
    panel.inputEnabled = true;
    panel.events.onInputDown.add(function(){
      GAME.func.changeGameMode('NORMAL');
      panel.destroy();
      GAME.time.events.remove(timeEvent);
    });
  } else if(mode === 'DEPLOY') {
    func.showMask();
    let smallTip = GAME.member.get('small_tip');
    if(smallTip) {
      smallTip.destroy();
    }
    GAME.member.get('deploy_mode_footer').changeDisplayState(true);
    GAME.member.get('active_panel').changeDisplayState(true);
  } else if(mode === 'WAIT') {
    func.hideMask();
    GAME.member.get('deploy_mode_footer').destroy();
    GAME.member.get('active_panel').destroy();
    GAME.member.get('deploy_mode_button').destroy();
    GAME.member.get('battle_start_button').destroy();
    GAME.member.get('tutorial_button').destroy();

    let deployedMyUnits = GAME.data.deployed_my_units;
    for(var i = 0 ; i < deployedMyUnits.length ; i++) {
      deployedMyUnits[i].flag.visible = false;
      deployedMyUnits[i].hpGrp.visible = true;
      deployedMyUnits[i].updateHpBar();
    }
    let deployedEnemies = GAME.data.deployed_enemies;
    for(var i = 0 ; i < deployedEnemies.length ; i++) {
      deployedEnemies[i].flag.visible = false;
      deployedEnemies[i].hpGrp.visible = true;
    }

    let leftUnitBottomPanels = GAME.data.left_unit_bottom_panels;
    for(var i = 0 ; i < leftUnitBottomPanels.length ; i++) {
      leftUnitBottomPanels[i].setAlpha(0);
    }
  } else if(mode === 'BATTLE'){
    // nothing
  } else {
    // NORMAL MODE
    func.hideMask();
    GAME.member.get('deploy_mode_footer').changeDisplayState(false);
    GAME.member.get('active_panel').changeDisplayState(false);
  }
  setUnitDeployButton();
}

func.showSkill = function(skillName) {
  var skillText = GAME.member.get('skill_text');
  skillText.changeImage(skillName);
  skillText.changeDisplayState(true);
}

func.hideSkill = function() {
  var skillText = GAME.member.get('skill_text');
  skillText.changeDisplayState(false);
}

func.showBattleUnitPanel = function(left, right) {
  let leftUnitBottomPanels = GAME.data.left_unit_bottom_panels;
  let rightUnitBottomPanels = GAME.data.right_unit_bottom_panels;
  if(left.constructor === Array) {
    for(var i = 0 ; i < left.length ; i++) {
      leftUnitBottomPanels[left[i]].setAlpha(1);
    }
  } else {
    leftUnitBottomPanels[left].setAlpha(1);
  }

  if(right.constructor === Array) {
  } else {
    rightUnitBottomPanels[right].setAlpha(1);
  }
}

func.hideBattleUnitPanel = function() {
  let leftUnitBottomPanels = GAME.data.left_unit_bottom_panels;
  let rightUnitBottomPanels = GAME.data.right_unit_bottom_panels;
  for(var i = 0 ; i < leftUnitBottomPanels.length ; i++) {
    leftUnitBottomPanels[i].setAlpha(0);
  }
  for(var i = 0 ; i < rightUnitBottomPanels.length ; i++) {
    rightUnitBottomPanels[i].setAlpha(0);
  }
}

func.plyaTutorial = function() {
  var loopCount = 0;
  var imageIndex = 1;
  let allMask = GAME.member.get('all_mask');
  let tutorialMovie = GAME.member.get('tutorial_movie');

  GAME.member.add(new BdButton({ game: GAME, x: 675, y: 333, image_key: 'popup_close', id: 'popup_close'}));
  let popupClose = GAME.member.get('popup_close');

  allMask.setAlpha(0.9);
  allMask.changeInputEnableState(true);
  tutorialMovie.changeDisplayState(true);

  allMask.bringToTop();
  tutorialMovie.bringToTop();
  popupClose.bringToTop();

  var timeEvent = GAME.time.events.loop(Phaser.Timer.SECOND / 3, function(){
    loopCount++;
    if(loopCount > 4) {
      tutorialMovie.changeImage('tutorial_' + imageIndex);
      imageIndex++;
      if(imageIndex >= 22) {
        GAME.time.events.remove(timeEvent);
      }
    }
  }, this);
}

func.closeTutorial = function() {
  let tutorialMovie = GAME.member.get('tutorial_movie');
  let allMask = GAME.member.get('all_mask');
  tutorialMovie.changeDisplayState(false);
  allMask.setAlpha(0);
  allMask.changeInputEnableState(false);
}

func.playKoAnimation = function(x, y) {
  var sprite1 = GAME.member.get('ko_sprite_1');
  var sprite2 = GAME.member.get('ko_sprite_2');
  var sprite3 = GAME.member.get('ko_sprite_3');
  if(!sprite1.getDisplayState()) {
    sprite1.bringToTop();
    sprite1.changeDisplayState(true);
    sprite1.setPosition(x, y);
    sprite1.playAnimation('run', 21);
    return;
  }
  if(!sprite2.getDisplayState()) {
    sprite2.bringToTop();
    sprite2.changeDisplayState(true);
    sprite2.setPosition(x, y);
    sprite2.playAnimation('run', 21);
    return;
  }
  if(!sprite3.getDisplayState()) {
    sprite3.bringToTop();
    sprite3.changeDisplayState(true);
    sprite3.setPosition(x, y);
    sprite3.playAnimation('run', 21);
    return;
  }
}

func.showMask = function() {
  GAME.member.get('mask').setAlpha(0.6);
}

func.hideMask = function() {
  GAME.member.get('mask').setAlpha(0);
}

func.showFadeOutMask= function(duration) {
  var mask = GAME.member.get('mask');
  var alpha = 0.8;
  var delay = 0;
  mask.fadeIn(alpha, duration, delay);
}

func.showRedMask = function() {
  GAME.member.get('red_mask').setAlpha(0.4);
}

func.hideRedMask = function() {
  GAME.member.get('red_mask').setAlpha(0);
}

func.playBoomEffect = function(x, y) {
  var bombEffect = GAME.member.get('boom_effect');
  bombEffect.bringToTop();
  bombEffect.changeDisplayState(true);
  bombEffect.setPosition(x, y);
  bombEffect.playAnimation('explosion', 21);
}

func.playBattleStartEffect = function(x, y) {
  var startEffect = GAME.member.get('start_effect');
  startEffect.changeDisplayState(true);
  startEffect.setPosition(x, y);
  startEffect.playAnimation('battleEffect', 20);
}

func.hideAttackReadyPannel = function() {
  GAME.member.get('attack_bottom_panel').changeDisplayState(false);
}
func.showAttackReadyPannel = function(x, y, duration) {
  var attackBottomPanel = GAME.member.get('attack_bottom_panel');
  attackBottomPanel.changeDisplayState(true);
  attackBottomPanel.setPosition(x, y);
  attackBottomPanel.startTween({alpha: 1}, duration, 0, 0);
}

func.alertStartRound = function(roundCount) {
  let displayRound = GAME.member.get('display_round');
  let bgRound = GAME.member.get('bg_round');
  let speedSprite = GAME.member.get('speed_sprite');
  displayRound.changeImage('round_' + roundCount);
  bgRound.changeImage('bg_round_' + roundCount);

  GAME.member.add(new BdMask({game: GAME, x: 0, y: 0, color:0x000000, id:'temp_mask', default_alpha: 0.8}))

  displayRound.bringToTop();
  displayRound.startTween({alpha: 1}, 400, 0, 0);
  bgRound.changeDisplayState(true);
  speedSprite.changeDisplayState(true);
  speedSprite.playAnimation('run');
}

func.deployUnit = function(x, y, panelIndex) {
  let result = null // unit
  let myUnits = GAME.data.my_units;
  let deployedMyUnits = GAME.data.deployed_my_units;
  let myUnitPosition = GAME.data.my_unit_position;
  let myDeployedUnitCount = GAME.data.my_deployed_unit_count;
  let maxMyUnitCount = GAME.data.max_my_unit_count;
  for(var i = 0 ; i < myUnits.length ; i++) {
    let unit = myUnits[i];
    if(unit.isButtonSelected) {
      unit.deployUnit(x, y);
      result = unit;
      deployedMyUnits[myDeployedUnitCount] = unit;
      myDeployedUnitCount++;
      GAME.data.my_deployed_unit_count = myDeployedUnitCount;
      myUnitPosition[panelIndex] = unit;
      unit.updateFlag(myDeployedUnitCount);
      unit.panelPositionIndex = panelIndex;
      sortUnit();
      sortUnitButton();
      let deployModeButton = GAME.member.get('deploy_mode_button');
      deployModeButton.changeImage('btn_member_' + myDeployedUnitCount);
      break;
    }
  }
  if(myDeployedUnitCount >= maxMyUnitCount) {
    GAME.func.changeGameMode('NORMAL');
  }
  return result;
}

func.getAliveEnemies = function(type) {
  let resultList = new Array();
  let targetList = null;
  if(type === 'my') {
    targetList = GAME.data.deployed_enemies;
  } else {
    targetList = GAME.data.deployed_my_units;
  }
  for(var i = 0 ; i < targetList.length; i++) {
    if(targetList[i].alive) {
      resultList.push(targetList[i]);
    }
  }
  return resultList;
}

function setUnitDeployButton() {
  let myUnits = GAME.data.my_units;
  if(GAME.data.game_mode === 'DEPLOY') {
    myUnits.forEach(function(myUnit) {
      if(!myUnit.deployed) {
        myUnit.showUnitButton();
      }
    });
  } else {
    myUnits.forEach(function(myUnit) {
      myUnit.hideUnitButton();
    });
  }
}

function sortUnit() {
  let leftUnitBottomPanels = GAME.data.left_unit_bottom_panels;
  for(var i = 0 ; i < leftUnitBottomPanels.length ; i++) {
    var panle = leftUnitBottomPanels[i];
    var unit = panle.data['unit'];
    if(unit) {
      unit.updateZindex();
    }
  }
}

function sortUnitButton() {
  var firstX = 44 + 50;
  var firstY = 798;
  var index = 0;
  let myUnits = GAME.data.my_units;
  for(var i = 0 ; i < myUnits.length ; i++) {
    var unit = myUnits[i];
    if(!unit.deployed) {
      unit.moveButtonPosition(firstX + (index * 130), firstY);
      index++;
    }
  }
}

function initUnitButton() {
  let myUnits = GAME.data.my_units;
  for(var i = 0 ; i < myUnits.length; i++) {
    if(myUnits[i].isButtonSelected) {
      myUnits[i].deselectUnitButton();
    }
  }
}

function createEnemies() {
  var enemyCount = 0;
  let deployedEnemies = GAME.data.deployed_enemies;
  let enemyUnitPosition = GAME.data.enemy_unit_position;
  for(var i = 0 ; i < ENEMIES_NAME_ARRAY.length ; i++) {
    var enemyName = ENEMIES_NAME_ARRAY[i];
    if(enemyName != null && enemyName !== '') {
      var unitData = UNIT_CONFIG[ENEMIES_NAME_ARRAY[i]];
      var properties = {
        game: GAME,
        unitData: unitData,
        position: ENEMY_UNIT_PANEL_XY[i]
      };
      var enemy = {};
      if(unitData.name === "skel") {
        enemy = new SkelUnit(properties);
      } else {
        enemy = new CommonUnit(properties);
      }
      enemyCount++;
      enemy.updateFlag(enemyCount);
      enemy.panelPositionIndex = i;
      deployedEnemies.push(enemy);
      enemyUnitPosition[i] = enemy;
    }
  }
}

function update(){
  if(GAME.data.game_mode === 'BATTLE') {
    var currentTurnUnit = TURN_ORDER[GAME.data.current_turn];
    if(!currentTurnUnit) {
      return;
    }

    if(currentTurnUnit.isEndTurn || !currentTurnUnit.alive) {
      GAME.data.current_turn++;
      if(currentTurnUnit.isEndTurn) {
        currentTurnUnit.initActionState();
      }
    } else {
      currentTurnUnit.update();
    }
    if(GAME.data.current_turn >= TURN_ORDER.length) {
      var enemies = GAME.func.getAliveEnemies('my');
      var myUnits = GAME.func.getAliveEnemies('enemy');
      if(enemies.length <= 0) {
        GAME.time.events.add(1000, function() {
          gameOver('WIN');
        }, this);
        return;
      }

      if(myUnits.length <= 0) {
        GAME.time.events.add(1000, function() {
          gameOver('LOSE');
        }, this);
        return;
      }

      GAME.data.game_mode = 'WAIT';
      GAME.data.round++;
      GAME.time.events.add(500, function() {
        GAME.func.alertStartRound(GAME.data.round);

        GAME.time.events.add(1000, function() {
          GAME.data.current_turn = 0;
          GAME.data.game_mode = 'BATTLE';
        }, this);

      }, this);
      // game.paused = true;
      // GAME.data.game_mode = 'NORMAL';
    }
  }
}

function gameOver(type) {
  var pop = null;
  let allMask = GAME.member.get('all_mask');
  allMask.setAlpha(0.9);
  if(type === 'WIN') {
    pop = GAME.add.sprite(86, 212, 'win_pop');
  } else {
    func.showMask();
    pop = GAME.add.sprite(86, 212, 'lose_pop');
  }
  var buttonY = 790;
  GAME.add.button(146, buttonY, 'continue_btn', function(){
    alert('스토어로 이동합니다.');
  }, this);
  GAME.add.button(146, buttonY + 114, 'replay_btn', function(){
    GAME.world.removeAll();
    GAME.data.current_turn = 0;
    TURN_ORDER = [];

    GAME.state.restart();
  }, this);
  GAME.member.get('speed_sprite').changeDisplayState(false);
}
