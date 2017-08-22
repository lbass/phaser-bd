'use strict';
var gameWidthX = CONFIG.getConfig('GAME_WIDTH');
var gameHeightX = CONFIG.getConfig('GAME_HEIGHT');
var isMute = CONFIG.getConfig('DEFAULT_MUTE');
var soundOnOffButtonX = CONFIG.getConfig('SOUND_ONOFF_BUTTON_X');
var soundOnOffButtonY = CONFIG.getConfig('SOUND_ONOFF_BUTTON_Y');
var closeButtonX = CONFIG.getConfig('CLOSE_BUTTON_X');
var closeButtonY = CONFIG.getConfig('CLOSE_BUTTON_Y');
var isGameover = false;
var isBattling = false;
var gameMode = 'NORMAL'; // DEPLOY, NORMAL

var UNIT_CONFIG = {
  'valkyrie': {
    name: 'valkyrie',
    hp:100,
    power:60,
    armor:100,
    agility:100,
    icon_image: 'icon_01',
    unit_image: 'valkyrie',
    animations: {
      normal: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      attack: [0, 14, 15, 16, 17],
      attacked: [0, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
      selected: [0, 34, 35, 36, 37, 38, 39, 40, 41 ,42, 43, 44, 45, 46, 47]
    }
  },
  'footman': {
    name: 'footman',
    hp:100,
    power:40,
    armor:100,
    agility:100,
    icon_image: 'icon_02',
    unit_image: 'footman',
    animations: {
      normal: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      attack: [0, 14, 15, 16, 17, 18],
      attacked: [0, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32],
      selected: [0, 33, 34, 35, 36, 37, 38, 39, 40, 41 ,42, 43, 44, 45, 46]
    }
  },
  'spearman': {
    name: 'spearman',
    hp:100,
    power:40,
    armor:100,
    agility:100,
    icon_image: 'icon_03',
    unit_image: 'footman',
    animations: {
      normal: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      attack: [0, 14, 15, 16, 17, 18],
      attacked: [0, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32],
      selected: [0, 33, 34, 35, 36, 37, 38, 39, 40, 41 ,42, 43, 44, 45, 46]
    }
  }
};
var myUnitsArray = ['valkyrie','footman','spearman'];
var MAX_UNIT_COUNT = myUnitsArray.length;
var unitCount = 0;

var ENEMY_CONFIG = {
  'bombermen': {
    name: 'bombermen',
    hp:100,
    power:40,
    armor:100,
    agility:100,
    unit_image: 'bombermen',
    animations: {
      normal: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      attack: [0, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41 ,42, 43, 44, 45],
      attacked: [0, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59 ],
      selected: [0]
    }
  },
  'thief' :{
    name: 'thief',
    hp:100,
    power:100,
    armor:100,
    agility:100,
    unit_image: 'thief',
    animations: {
      normal: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      attack: [0, 14, 15, 16, 17, 18, 19, 20],
      attacked: [0, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34],
      selected: [0]
    }
  }
};
var enemiesArray = ['thief',null,null,null,'bombermen',null,null,null,'thief'];
var enemiesCount = enemiesArray.length;
var enemyPanels = [
  { x: 664 + 50, y: 330 },
  { x: 574 + 50, y: 330 },
  { x: 484 + 50, y: 330 },
  { x: 687 + 50, y: 414 },
  { x: 597 + 50, y: 414 },
  { x: 507 + 50, y: 414 },
  { x: 710 + 50, y: 498 },
  { x: 620 + 50, y: 498 },
  { x: 530 + 50, y: 498 }];

var currentTurn = 0;
var turnOrder = [];
var myUnits = [];
var deployedMyUnits = [];
var deployedEnemies = [];
var selectedPanels = [];
var deployModeButton = {};
var deployModefooter = {};
var activePanel = {};
var smallTip = {};
var blurX;
var blurY;

var game = new Phaser.Game(gameWidthX, gameHeightX, Phaser.CANVAS_FILTER, '',
{
  preload: preload,
  create: create,
  update: update
}, false, false);

function preload() {
  game.load.image('background', 'assets/bg_pattern.jpg');
  game.load.image('bg_1', 'assets/bg_1.png');
  game.load.image('bg_2', 'assets/bg_2.png');
  game.load.image('close-button', 'assets/close.png');
  game.load.image('sound-button-enable', 'assets/v_on.png');
  game.load.image('sound-button-disable', 'assets/v_off.png');

  game.load.image('tip_01', 'assets/tip_1.png');

  game.load.image('footer_ui_basic', 'assets/footer_ui_basic.png');
  game.load.image('footer_ui_select', 'assets/footer_ui_select.png');

  game.load.image('icon_01', 'assets/icon_1.png');
  game.load.image('icon_02', 'assets/icon_2.png');
  game.load.image('icon_03', 'assets/icon_3.png');
  game.load.image('icon_selected', 'assets/select_blue.png');

  game.load.image('btn_start', 'assets/btn_start.png');
  game.load.image('btn_member_0', 'assets/btn_member0.png');
  game.load.image('btn_member_1', 'assets/btn_member1.png');
  game.load.image('btn_member_2', 'assets/btn_member2.png');
  game.load.image('btn_member_3', 'assets/btn_member3.png');
  game.load.image('small_tip', 'assets/말풍선.png');

  game.load.image('active_panel', 'assets/말판on_ani.png');
  game.load.image('panel_selected', 'assets/빨간판.png');

  game.load.spritesheet('valkyrie', '/assets/도끼_sprite.png', 210, 210, 48);
  game.load.spritesheet('footman', '/assets/swordman.png', 210, 210, 47);
  // game.load.image('valkyrie', 'assets/착한놈.png');
  // game.load.image('footman', 'assets/착한졸병1.png');

  game.load.spritesheet('bombermen', 'assets/skel.png', 200, 200, 60);
  game.load.spritesheet('thief', 'assets/craw.png', 200, 200, 35);

  game.load.image('flag_1', 'assets/flag_1.png');
  game.load.image('flag_2', 'assets/flag_2.png');
  game.load.image('flag_3', 'assets/flag_3.png');

  game.load.script('BlurX', 'src/BlurX.js');
  game.load.script('BlurY', 'src/BlurY.js');

}

function create() {
  game.world.setBounds(0, 0, 820, 1230);
  game.physics.setBoundsToWorld();
  game.camera.x = 50;
  //  Game에서 커서가 떠나도 게임이 정지하지 않는다.
  game.stage.disableVisibilityChange = true;
  game.add.sprite(0, 0, 'background');
  var bg1 = game.add.sprite(0, 0, 'bg_1');
  var bg2 = game.add.sprite(0, 0, 'bg_2');
  game.time.events.loop(Phaser.Timer.SECOND / 2, function(){
    if(bg2.visible) {
      bg2.visible = false;
    } else {
      bg2.visible = true;
    }
  }, this);

  activePanel = game.add.sprite(10 + 50, 330, 'active_panel');
  activePanel.visible = false;
  activePanel.alpha = 0.5;
  selectedPanels = createSelectedPanels();
  // game.add.sprite(32, 100, 'tip_01');

  var normalModefooter = game.add.sprite(0 + 50, 840, 'footer_ui_basic');
  deployModefooter = game.add.sprite(0 + 50, 755, 'footer_ui_select');
  deployModefooter.visible = false;

  for(var i = 0 ; i < myUnitsArray.length ; i++) {
    var properties = {
      game: game,
      position: null,
      unitData: UNIT_CONFIG[myUnitsArray[i]],
      buttonClickHandler: initUnitButton
    };
    var unit = new MyUnit(properties);
    myUnits.push(unit);
  }
  sortUnitButton();

  deployModeButton = game.add.button(360 + 50, 985, 'btn_member_0', null, this);
  deployModeButton.anchor.set(0.5, 0.5);
  deployModeButton.inputEnabled = true;
  deployModeButton.events.onInputDown.add(function(me){
    game.add.tween(me.scale).to({x: 1.03, y: 1.03}, 100, Phaser.Easing.Linear.None, true, 0, 0, true);
    if(gameMode === 'NORMAL') {
      gameMode = 'DEPLOY';
    } else {
      gameMode = 'NORMAL';
    }
  }, deployModeButton);

  var startButton = game.add.button(360 + 50, 1122, 'btn_start', null, this);
  startButton.anchor.set(0.5, 0.5);
  startButton.inputEnabled = true;
  startButton.events.onInputDown.add(function(me){
    game.add.tween(me.scale).to({x: 1.03, y: 1.03}, 100, Phaser.Easing.Linear.None, true, 0, 0, true);
    gameMode = 'BATTLE';
    setTurn();
  }, startButton);

  smallTip = game.add.sprite(266 + 50, 843, 'small_tip');
  var tween = game.add.tween(smallTip).to( { y:  smallTip.y - 10 }, 300, Phaser.Easing.Linear.None, false, 0, -1, true);
  tween.interpolation(function(v, k){
    return Phaser.Math.bezierInterpolation(v, k);
  });
  tween.start();

  game.sound.mute = isMute;
  var soundButtonImage = 'sound-button-enable';
  if(game.sound.mute) {
    soundButtonImage = 'sound-button-disable';
  }
  fsn.components.SoundOnOffButton({
      game: game,
      x: soundOnOffButtonX,
      y: soundOnOffButtonY,
      imageName: soundButtonImage
  });
  game.time.events.add(Phaser.Timer.SECOND * 5, showCloseButton, this);

  createEnemies();

  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  game.scale.pageAlignHorizontally = true;
  game.scale.pageAlignVertically = true;

}

function createSelectedPanels() {
  var selectedPanels = [
    game.add.button(56 + 50, 330, 'panel_selected', null, this),
    game.add.button(146 + 50, 330, 'panel_selected', null, this),
    game.add.button(236 + 50, 330, 'panel_selected', null, this),
    game.add.button(33 + 50, 414, 'panel_selected', null, this),
    game.add.button(123 + 50, 414, 'panel_selected', null, this),
    game.add.button(213 + 50, 414, 'panel_selected', null, this),
    game.add.button(10 + 50, 498, 'panel_selected', null, this),
    game.add.button(100 + 50, 498, 'panel_selected', null, this),
    game.add.button(190 + 50, 498, 'panel_selected', null, this)
  ]

  for(var i = 0 ; i < selectedPanels.length ; i++) {
    selectedPanels[i].inputEnabled = true;
    selectedPanels[i].alpha = 0;
    selectedPanels[i].data = {
      'unit': null
    };

    selectedPanels[i].events.onInputOver.add(function(me){
      if(gameMode === 'DEPLOY') {
        for(var i = 0 ; i < myUnits.length ; i++) {
          if(myUnits[i].isButtonSelected) {
          }
        }
        me.alpha = 1;
      }
    }, selectedPanels[i]);

    selectedPanels[i].events.onInputOut.add(function(me){
      if(gameMode === 'DEPLOY') {
        if(!me.data['unit']) {
          me.alpha = 0;
        }
      }
    }, selectedPanels[i]);

    selectedPanels[i].events.onInputDown.add(function(panel){
      if(gameMode === 'DEPLOY') {
        for(var i = 0 ; i < myUnits.length ; i++) {
          if(myUnits[i].isButtonSelected) {
            var success = myUnits[i].deployUnit(panel.x, panel.y);
            if(success) {
              deployedMyUnits[unitCount] = myUnits[i];
              unitCount++;
              panel.data['unit'] = myUnits[i];
              deployModeButton.loadTexture('btn_member_' + unitCount, 0);
              myUnits[i].updateFlag(unitCount)
              sortUnit();
              sortUnitButton();
            }
            break;
          }
        }
      }
    }, selectedPanels[i]);
  }

  return selectedPanels;
}

function showCloseButton() {
  fsn.components.GameCloseButton({
      game: game,
      x: closeButtonX,
      y: closeButtonY,
      imageName: 'close-button'
  });
}

function sortUnit() {
  for(var i = 0 ; i < selectedPanels.length ; i++) {
    var panle = selectedPanels[i];
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
  for(var i = 0 ; i < myUnits.length ; i++) {
    var unit = myUnits[i];
    if(!unit.deployed) {
      unit.moveButtonPosition(firstX + (index * 130), firstY);
      index++;
    }
  }
}

function initUnitButton() {
  for(var i = 0 ; i < myUnits.length; i++) {
    if(myUnits[i].isButtonSelected) {
      myUnits[i].deselectUnitButton();
    }
  }
}

function createEnemies() {
  var enemyCount = 0;
  for(var i = 0 ; i < enemiesArray.length ; i++) {
    var enemyName = enemiesArray[i];
    if(enemyName != null && enemyName !== '') {
      var properties = {
        game: game,
        unitData: ENEMY_CONFIG[enemiesArray[i]],
        position: enemyPanels[i]
      };
      var enemy = new Unit(properties);
      enemyCount++;
      enemy.updateFlag(enemyCount);
      deployedEnemies.push(enemy);
    }
  }
}

function update(){
  if(gameMode === 'DEPLOY') {
    smallTip.visible = false;
    deployModefooter.visible = true;
    activePanel.visible = true;
    if(activePanel.alpha === 0.5) {
      game.add.tween(activePanel).to({alpha: 1}, 800, Phaser.Easing.Linear.None, true, 0, 0, true);
    }
    for(var i = 0 ; i < myUnits.length ; i++) {
      if(!myUnits[i].deployed) {
        myUnits[i].showUnitButton();
      }
    }
  } else {
    if(MAX_UNIT_COUNT > unitCount) {
      smallTip.visible = true;
    }
    deployModefooter.visible = false;
    activePanel.alpha = 0.5;
    activePanel.visible = false;
    for(var i = 0 ; i < myUnits.length ; i++) {
      myUnits[i].hideUnitButton();
    }
    if(gameMode === 'BATTLE') {
      var currentTurnUnit = turnOrder[currentTurn];
      if(!currentTurnUnit) {
        return;
      }

      var target = getTarget(currentTurnUnit);
      if(currentTurnUnit.isEndOfTurn) {
        currentTurn++;
        currentTurnUnit.isEndOfTurn = false;
      } else {
        currentTurnUnit.attackEnemy(target);
      }

      if(currentTurn >= turnOrder.length) {
        currentTurn = 0;
        // gameMode = 'NORMAL';
      }
    }
  }
}

function getTarget(turnUnit) {
  if(turnUnit instanceof MyUnit) {
    var index = Math.floor(Math.random() * deployedEnemies.length);
    return deployedEnemies[index].unit;
  } else {
    var index = Math.floor(Math.random() * deployedMyUnits.length);
    return deployedMyUnits[index].unit;
  }
}

function setTurn() {
  currentTurn = 0;
  for(var i = 0 ; i < deployedMyUnits.length ; i++) {
    turnOrder[i] = deployedMyUnits[i];
    deployedMyUnits[i].isEndOfTurn = false;
  }
  for(var i = 0 ; i < deployedEnemies.length ; i++) {
    turnOrder.splice((i * 2) + 1, 0, deployedEnemies[i]);
    deployedEnemies[i].isEndOfTurn = false;
  }

}
