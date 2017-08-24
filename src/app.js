'use strict';
var GAME_WIDTH = CONFIG.getConfig('GAME_WIDTH');
var GAME_HEIGHT = CONFIG.getConfig('GAME_HEIGHT');
var IS_MUTE = CONFIG.getConfig('DEFAULT_MUTE');
var SOUND_ON_OFF_BUTTON_X = CONFIG.getConfig('SOUND_ONOFF_BUTTON_X');
var SOUND_ON_OFF_BUTTON_Y = CONFIG.getConfig('SOUND_ONOFF_BUTTON_Y');
var CLOSE_BUTTON_X = CONFIG.getConfig('CLOSE_BUTTON_X');
var CLOSE_BUTTON_Y = CONFIG.getConfig('CLOSE_BUTTON_Y');
var GAME_MODE = 'NORMAL'; // DEPLOY, NORMAL

var MY_UNIT_NAME_ARRAY = ['axeman','swordman','swordman'];
var MAX_MY_UNIT_COUNT = MY_UNIT_NAME_ARRAY.length;
var UNIT_CONFIG = CONFIG.getConfig('UNIT_CONFIG');
var MY_UNIT_PANEL_XY = CONFIG.getConfig('MY_UNIT_PANEL_XY');
var ENEMY_UNIT_PANEL_XY = CONFIG.getConfig('ENEMY_UNIT_PANEL_XY');
var ENEMIES_NAME_ARRAY = ['craw',null,null,null,'skel',null,null,'craw',null];

var MY_DEPLOYED_UNIT_COUNT = 0;
var MY_UNIT_POSITION = [null,null,null,null,null,null,null,null,null ];
var ENEMY_UNIT_POSITION = [null,null,null,null,null,null,null,null,null ];
var ROUND = 0;
var CURRENT_TURN = 0;
var GAME_ALL_MASK = {};
var GAME_MASK = {};
var GAME_RED_MASK = {};
var START_EFFECT = {};
var BOMB_EFFECT = {};
var DISPLAY_ROUND = {};
var BG_ROUND = {};
var SPEED_SPRITE = {};
var KO_SPRITE_01 = {};
var KO_SPRITE_02 = {};
var KO_SPRITE_03 = {};
var LEFT_BATTLE_UNIT_PANEL = {};
var RIGHT_BATTLE_UNIT_PANEL = {};
var SKILL_TEXT = {};
var MY_UNIT_ATTACK_READY_PANEL = {};
var DEPLOYED_MY_UNITS = [];
var DEPLOYED_ENEMIES = [];

var TURN_ORDER = [];
var MY_UNITS = [];
var SELECTABLE_PANELS = [];
var DEPLOY_MODE_BUTTON = {};
var BATTLE_START_BUTTON = {};
var DEPLOY_MODE_FOOTER = {};
var ACTIVE_PANEL = {};
var SMALL_TIP = {};
var TUTORIAL_MOVIE = {};
var TUTORIAL_BUTTON = {};

var GAME = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.CANVAS, '',
{
  preload: preload,
  create: create,
  update: update
}, false, false);

function preload() {
  var images = IMAGE_RESOURCE.images;
  var spritesheets = IMAGE_RESOURCE.spritesheets;
  for(var i = 0 ; i < images.length ; i++) {
    var image = images[i];
    GAME.load.image(image.name, image.path);
  }
  for(var i = 0 ; i < spritesheets.length ; i++) {
    var sheet = spritesheets[i];
    GAME.load.spritesheet(sheet.name, sheet.path, sheet.width, sheet.height, sheet.frame);
  }
  GAME.load.script('BlurX', 'src/BlurX.js');
  GAME.load.script('BlurY', 'src/BlurY.js');
}

function create() {
  GAME.world.setBounds(0, 0, 820, 1230);
  GAME.physics.setBoundsToWorld();
  GAME.camera.x = 50;
  //  GAME에서 커서가 떠나도 게임이 정지하지 않는다.
  GAME.stage.disableVisibilityChange = true;
  GAME.add.sprite(0, 0, 'background');
  var bg1 = GAME.add.sprite(0, 0, 'bg_1');
  var bg2 = GAME.add.sprite(0, 0, 'bg_2');
  GAME.time.events.loop(Phaser.Timer.SECOND / 2, function(){
    if(bg2.visible) {
      bg2.visible = false;
    } else {
      bg2.visible = true;
    }
  }, this);

  GAME_MASK = GAME.add.graphics(0, 0);
  GAME_MASK.beginFill(0x000000);
  GAME_MASK.drawRect(0, 0, 820, 1350);
  GAME_MASK.alpha = 0.0;

  MY_UNIT_ATTACK_READY_PANEL = GAME.add.sprite(0, 0, 'attack_panel');
  MY_UNIT_ATTACK_READY_PANEL.alpha = 0;

  ACTIVE_PANEL = GAME.add.sprite(10 + 50, 332, 'active_panel');
  ACTIVE_PANEL.visible = false;
  SELECTABLE_PANELS = createSelectablePanels();
  // GAME.add.sprite(32, 100, 'tip_01');

  var normalModefooter = GAME.add.sprite(0 + 50, 840, 'footer_ui_basic');
  DEPLOY_MODE_FOOTER = GAME.add.sprite(0 + 50, 755, 'footer_ui_select');
  DEPLOY_MODE_FOOTER.visible = false;

  START_EFFECT = GAME.add.sprite(0, 0, 'battleStart');
  START_EFFECT.animations.add('battleEffect', [0,1,2,3,4,5,6,7,8,9,10], 11, false);
  START_EFFECT.animations.getAnimation('battleEffect').onComplete.add(function(sprite, ani) {
    START_EFFECT.visible = false;
  }, this);
  START_EFFECT.visible = false;

  BOMB_EFFECT = GAME.add.sprite(0, 0, 'boomb');
  BOMB_EFFECT.animations.add('explosion', [0,1,2,3,4,5,6,7], 8, false);
  BOMB_EFFECT.animations.getAnimation('explosion').onComplete.add(function(sprite, ani) {
    BOMB_EFFECT.visible = false;
  }, this);
  BOMB_EFFECT.visible = false;

  LEFT_BATTLE_UNIT_PANEL = GAME.add.sprite(0, 0, 'left_battle_unit_panel');
  RIGHT_BATTLE_UNIT_PANEL = GAME.add.sprite(0, 0, 'right_battle_unit_panel');
  LEFT_BATTLE_UNIT_PANEL.visible = false;
  RIGHT_BATTLE_UNIT_PANEL.visible = false;

  for(var i = 0 ; i < MY_UNIT_NAME_ARRAY.length ; i++) {
    var properties = {
      game: GAME,
      position: null,
      unitData: UNIT_CONFIG[MY_UNIT_NAME_ARRAY[i]],
      buttonClickHandler: initUnitButton
    };
    var unit = new MyUnit(properties);
    MY_UNITS.push(unit);
  }
  sortUnitButton();

  DEPLOY_MODE_BUTTON = GAME.add.button(360 + 50, 985, 'btn_member_0', null, this);
  DEPLOY_MODE_BUTTON.anchor.set(0.5, 0.5);
  DEPLOY_MODE_BUTTON.inputEnabled = true;
  DEPLOY_MODE_BUTTON.events.onInputDown.add(function(me){
    GAME.add.tween(me.scale).to({x: 1.03, y: 1.03}, 100, Phaser.Easing.Linear.None, true, 0, 0, true);
    if(GAME_MODE === 'NORMAL') {
      changeGameMode('DEPLOY');
    } else {
      changeGameMode('NORMAL');
    }
  }, DEPLOY_MODE_BUTTON);

  BATTLE_START_BUTTON = GAME.add.button(360 + 50, 1122, 'btn_start', null, this);
  BATTLE_START_BUTTON.anchor.set(0.5, 0.5);
  BATTLE_START_BUTTON.inputEnabled = true;
  BATTLE_START_BUTTON.events.onInputDown.add(function(me){
    GAME.add.tween(me.scale).to({x: 1.03, y: 1.03}, 100, Phaser.Easing.Linear.None, true, 0, 0, true);
    if(DEPLOYED_MY_UNITS.length <= 0) {
      alert('배치된 유닛이 없습니다.');
      return;
    }
    CURRENT_TURN = 0;
    for(var i = 0 ; i < DEPLOYED_MY_UNITS.length ; i++) {
      TURN_ORDER[i] = DEPLOYED_MY_UNITS[i];
    }
    for(var i = 0 ; i < DEPLOYED_ENEMIES.length ; i++) {
      TURN_ORDER.splice((i * 2) + 1, 0, DEPLOYED_ENEMIES[i]);
    }
    changeGameMode('WAIT');
    ROUND = 1;
    fsn.util.alertStartRound(ROUND);
    GAME.time.events.add(2000, function() {
      changeGameMode('BATTLE');
    }, this);

  }, BATTLE_START_BUTTON);

  SMALL_TIP = GAME.add.sprite(266 + 50, 843, 'small_tip');
  var tween = GAME.add.tween(SMALL_TIP).to( { y:  SMALL_TIP.y - 10 }, 300, Phaser.Easing.Linear.None, false, 0, -1, true);
  tween.interpolation(function(v, k){
    return Phaser.Math.bezierInterpolation(v, k);
  });
  tween.start();

  GAME.sound.mute = IS_MUTE;
  var soundButtonImage = 'sound-button-enable';
  if(GAME.sound.mute) {
    soundButtonImage = 'sound-button-disable';
  }

  fsn.components.SoundOnOffButton({
      game: GAME,
      x: SOUND_ON_OFF_BUTTON_X,
      y: SOUND_ON_OFF_BUTTON_Y,
      imageName: soundButtonImage
  });
  GAME.time.events.add(Phaser.Timer.SECOND * 5, showCloseButton, this);

  createEnemies();

  GAME.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  GAME.scale.pageAlignHorizontally = true;
  GAME.scale.pageAlignVertically = true;

  DISPLAY_ROUND = GAME.add.sprite(116, 327, 'round_1');
  DISPLAY_ROUND.alpha = 0;
  BG_ROUND = GAME.add.sprite(50, 755, 'bg_round_1');
  BG_ROUND.visible = false;
  SPEED_SPRITE = GAME.add.sprite(346, 1003, 'speedX2');
  SPEED_SPRITE.animations.add('run', [0,1,2,3,4,5,6], 7, true);
  SPEED_SPRITE.visible = false;

  KO_SPRITE_01 = GAME.add.sprite(0, 0, 'ko');
  KO_SPRITE_01.animations.add('run', [0,1,2,3,4,5,6], 6, false);
  KO_SPRITE_01.animations.getAnimation('run').onComplete.add(function(sprite, ani) {
    KO_SPRITE_01.visible = false;
  }, this);
  KO_SPRITE_01.visible = false;

  KO_SPRITE_02 = GAME.add.sprite(0, 0, 'ko');
  KO_SPRITE_02.animations.add('run', [0,1,2,3,4,5,6], 6, false);
  KO_SPRITE_02.animations.getAnimation('run').onComplete.add(function(sprite, ani) {
    KO_SPRITE_02.visible = false;
  }, this);
  KO_SPRITE_02.visible = false;

  KO_SPRITE_03 = GAME.add.sprite(0, 0, 'ko');
  KO_SPRITE_03.animations.add('run', [0,1,2,3,4,5,6], 6, false);
  KO_SPRITE_03.animations.getAnimation('run').onComplete.add(function(sprite, ani) {
    KO_SPRITE_03.visible = false;
  }, this);
  KO_SPRITE_03.visible = false;

  SKILL_TEXT = GAME.add.sprite(144, 650, 'skill_axeman');
  SKILL_TEXT.visible = false;

  TUTORIAL_BUTTON = GAME.add.button(82, 100, 'tip_01', function() {
    plyaTutorial();
  }, this);
  TUTORIAL_BUTTON.inputEnabled = true;

  GAME_RED_MASK = GAME.add.graphics(0, 0);
  GAME_RED_MASK.beginFill(0xFF0000);
  GAME_RED_MASK.drawRect(0, 0, 820, 1350);
  GAME_RED_MASK.alpha = 0.0;

  GAME_ALL_MASK = GAME.add.graphics(0, 0);
  GAME_ALL_MASK.beginFill(0x000000);
  GAME_ALL_MASK.drawRect(0, 0, 820, 1350);
  GAME_ALL_MASK.alpha = 0.0;
  GAME_ALL_MASK.events.onInputDown.add(function(){
    return;
  }, this);

  TUTORIAL_MOVIE = GAME.add.sprite(50, 200, 'tutorial_1');
  TUTORIAL_MOVIE.visible = false;
  changeGameMode('NORMAL');
}

function plyaTutorial() {
  var loopCount = 0;
  var imageIndex = 1;
  GAME_ALL_MASK.alpha = 0.9;
  GAME_ALL_MASK.inputEnabled = true;
  var closeButton = GAME.add.button(675, 569, 'popup_close', function() {
    closeButton.destroy();
    closeTutorial();
  }, this);

  GAME.world.bringToTop(GAME_ALL_MASK);
  GAME.world.bringToTop(TUTORIAL_MOVIE);
  GAME.world.bringToTop(closeButton);
  TUTORIAL_MOVIE.visible = true;
  var timeEvent = GAME.time.events.loop(Phaser.Timer.SECOND / 3, function(){
    loopCount++;
    if(loopCount > 4) {
      TUTORIAL_MOVIE.loadTexture('tutorial_' + imageIndex, 0);
      imageIndex++;
      if(imageIndex >= 22) {
        GAME.time.events.remove(timeEvent);
      }
    }
  }, this);
}

function closeTutorial() {
  GAME_ALL_MASK.alpha = 0.0;
  GAME_ALL_MASK.inputEnabled = false;
  TUTORIAL_MOVIE.visible = false;
}

function createSelectablePanels() {
  var SELECTABLE_PANELS = [];
  for(var i = 0 ; i < 9 ; i++) {
    var position = MY_UNIT_PANEL_XY[i];
    var button = GAME.add.button(position.x, position.y, 'panel_selected', null, this);
    var index = i;
    button.inputEnabled = true;
    button.alpha = 0;
    button.data = {
      'unit': null,
      'index': index
    };
    button.events.onInputOver.add(function(me){
      if(GAME_MODE === 'DEPLOY') {
        me.alpha = 1;
      }
    }, button);
    button.events.onInputOut.add(function(me){
      if(GAME_MODE === 'DEPLOY') {
        if(!me.data['unit']) {
          me.alpha = 0;
        }
      }
    }, button);
    // button
    button.events.onInputDown.add(function(panel){
      if(GAME_MODE === 'DEPLOY') {
        deployMyUnit(panel);
      }
    }, button);
    // button
    SELECTABLE_PANELS.push(button);
  }
  return SELECTABLE_PANELS;
}

function deployMyUnit(panel) {
  if(panel.data['unit']) {
    return;
  }
  for(var i = 0 ; i < MY_UNITS.length ; i++) {
    if(MY_UNITS[i].isButtonSelected) {
      var success = MY_UNITS[i].deployUnit(panel.x, panel.y);
      if(success) {
        DEPLOYED_MY_UNITS[MY_DEPLOYED_UNIT_COUNT] = MY_UNITS[i];
        MY_DEPLOYED_UNIT_COUNT++;
        panel.data['unit'] = MY_UNITS[i];
        DEPLOY_MODE_BUTTON.loadTexture('btn_member_' + MY_DEPLOYED_UNIT_COUNT, 0);
        MY_UNIT_POSITION[panel.data['index']] = MY_UNITS[i];
        MY_UNITS[i].updateFlag(MY_DEPLOYED_UNIT_COUNT);
        MY_UNITS[i].panelPositionIndex = panel.data['index'];
        sortUnit();
        sortUnitButton();
      }
      break;
    }
  }
}

function changeGameMode(mode) {
  GAME_MODE = mode;
  if(mode === 'DEPLOY') {
    fsn.util.showMask();
    SMALL_TIP.visible = true;
    DEPLOY_MODE_FOOTER.visible = true;
    ACTIVE_PANEL.visible = true;
    GAME.add.tween(ACTIVE_PANEL).to({alpha: 0.1}, 800, Phaser.Easing.Linear.None, true, 0, 5000, true);
  } else if(GAME_MODE === 'WAIT') {
    fsn.util.hideMask();
    SMALL_TIP.destroy();
    DEPLOY_MODE_FOOTER.destroy();
    ACTIVE_PANEL.destroy();
    DEPLOY_MODE_BUTTON.destroy();
    BATTLE_START_BUTTON.destroy();
    TUTORIAL_BUTTON.destroy();
    for(var i = 0 ; i < DEPLOYED_MY_UNITS.length ; i++) {
      DEPLOYED_MY_UNITS[i].flag.visible = false;
      DEPLOYED_MY_UNITS[i].hpGrp.visible = true;
      DEPLOYED_MY_UNITS[i].updateHpBar();
    }
    for(var i = 0 ; i < DEPLOYED_ENEMIES.length ; i++) {
      DEPLOYED_ENEMIES[i].flag.visible = false;
      DEPLOYED_ENEMIES[i].hpGrp.visible = true;
    }
    for(var i = 0 ; i < SELECTABLE_PANELS.length ; i++) {
      SELECTABLE_PANELS[i].visible = false;
    }
  } else {
    // NORMAL MODE
    fsn.util.hideMask();
    SMALL_TIP.visible = true;
    DEPLOY_MODE_FOOTER.visible = false;
    ACTIVE_PANEL.visible = false;
  }
  setUnitDeployButton();
}

function setUnitDeployButton() {
  if(GAME_MODE === 'DEPLOY') {
    MY_UNITS.forEach(function(myUnit) {
      if(!myUnit.deployed) {
        myUnit.showUnitButton();
      }
    });
  } else {
    MY_UNITS.forEach(function(myUnit) {
      myUnit.hideUnitButton();
    });
  }
}

function showCloseButton() {
  fsn.components.GameCloseButton({
      game: GAME,
      x: CLOSE_BUTTON_X,
      y: CLOSE_BUTTON_Y,
      imageName: 'close-button'
  });
}

function sortUnit() {
  for(var i = 0 ; i < SELECTABLE_PANELS.length ; i++) {
    var panle = SELECTABLE_PANELS[i];
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
  for(var i = 0 ; i < MY_UNITS.length ; i++) {
    var unit = MY_UNITS[i];
    if(!unit.deployed) {
      unit.moveButtonPosition(firstX + (index * 130), firstY);
      index++;
    }
  }
}

function initUnitButton() {
  for(var i = 0 ; i < MY_UNITS.length; i++) {
    if(MY_UNITS[i].isButtonSelected) {
      MY_UNITS[i].deselectUnitButton();
    }
  }
}

function createEnemies() {
  var enemyCount = 0;
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
      DEPLOYED_ENEMIES.push(enemy);
      ENEMY_UNIT_POSITION[i] = enemy;
    }
  }
}

function update(){
  if(GAME_MODE === 'BATTLE') {
    var currentTurnUnit = TURN_ORDER[CURRENT_TURN];
    if(!currentTurnUnit) {
      return;
    }

    if(currentTurnUnit.isEndTurn || !currentTurnUnit.alive) {
      CURRENT_TURN++;
      if(currentTurnUnit.isEndTurn) {
        currentTurnUnit.initActionState();
      }
    } else {
      currentTurnUnit.update();
    }
    if(CURRENT_TURN >= TURN_ORDER.length) {
      var enemies = fsn.util.getAliveEnemies('my');
      var myUnits = fsn.util.getAliveEnemies('enemy');
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

      GAME_MODE = 'WAIT';
      ROUND++;
      GAME.time.events.add(500, function() {
        fsn.util.alertStartRound(ROUND);

        GAME.time.events.add(1000, function() {
          CURRENT_TURN = 0;
          GAME_MODE = 'BATTLE';
        }, this);

      }, this);
      // game.paused = true;
      // GAME_MODE = 'NORMAL';
    }
  } else {
    if(MY_DEPLOYED_UNIT_COUNT >= MAX_MY_UNIT_COUNT) {
      SMALL_TIP.visible = false;
    }
  }
}

function gameOver(type) {
  var pop = null;
  GAME_ALL_MASK.alpha = 0.9
  if(type === 'WIN') {
    pop = GAME.add.sprite(86, 212, 'win_pop');
  } else {
    fsn.util.showMask();
    pop = GAME.add.sprite(86, 212, 'lose_pop');
  }
  var buttonY = 790;
  GAME.add.button(146, buttonY, 'continue_btn', function(){
    alert('스토어로 이동합니다.');
  }, this);
  GAME.add.button(146, buttonY + 114, 'replay_btn', function(){
    GAME.world.removeAll();

    MY_DEPLOYED_UNIT_COUNT = 0;
    MY_UNIT_POSITION = [null,null,null,null,null,null,null,null,null ];
    ENEMY_UNIT_POSITION = [null,null,null,null,null,null,null,null,null ];
    ROUND = 0;
    CURRENT_TURN = 0;
    GAME_ALL_MASK = {};
    GAME_MASK = {};
    GAME_RED_MASK = {};
    START_EFFECT = {};
    BOMB_EFFECT = {};
    DISPLAY_ROUND = {};
    BG_ROUND = {};
    SPEED_SPRITE = {};
    KO_SPRITE_01 = {};
    KO_SPRITE_02 = {};
    KO_SPRITE_03 = {};
    LEFT_BATTLE_UNIT_PANEL = {};
    RIGHT_BATTLE_UNIT_PANEL = {};
    SKILL_TEXT = {};
    MY_UNIT_ATTACK_READY_PANEL = {};
    DEPLOYED_MY_UNITS = [];
    DEPLOYED_ENEMIES = [];
    TURN_ORDER = [];
    MY_UNITS = [];
    SELECTABLE_PANELS = [];
    DEPLOY_MODE_BUTTON = {};
    BATTLE_START_BUTTON = {};
    DEPLOY_MODE_FOOTER = {};
    ACTIVE_PANEL = {};
    SMALL_TIP = {};
    TUTORIAL_MOVIE = {};
    TUTORIAL_BUTTON = {};

    GAME.state.restart();
  }, this);
  SPEED_SPRITE.visible = false;
}
