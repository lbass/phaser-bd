'use strict';
var gameWidthX = CONFIG.getConfig('GAME_WIDTH');
var gameHeightX = CONFIG.getConfig('GAME_HEIGHT');
var isMute = CONFIG.getConfig('DEFAULT_MUTE');
var soundOnOffButtonX = CONFIG.getConfig('SOUND_ONOFF_BUTTON_X');
var soundOnOffButtonY = CONFIG.getConfig('SOUND_ONOFF_BUTTON_Y');
var closeButtonX = CONFIG.getConfig('CLOSE_BUTTON_X');
var closeButtonY = CONFIG.getConfig('CLOSE_BUTTON_Y');
var isGameover = false;
var gameMode = 'NORMAL'; // DEPLOY, NORMAL

var UNIT_CONFIG = {
  'valkyrie': {
    name: 'valkyrie',
    hp:100,
    power:100,
    armor:100,
    agility:100,
    icon_image: 'icon_01',
    unit_image: 'valkyrie',
    mercenary: false
  },
  'footman': {
    name: 'footman',
    hp:100,
    power:100,
    armor:100,
    agility:100,
    icon_image: 'icon_02',
    unit_image: 'footman',
    mercenary: true
  },
  'spearman': {
    name: 'spearman',
    hp:100,
    power:100,
    armor:100,
    agility:100,
    icon_image: 'icon_03',
    unit_image: 'footman',
    mercenary: true
  }
};
var myUnitsArray = ['valkyrie','footman','spearman'];
var MAX_UNIT_COUNT = myUnitsArray.length;
var unitCount = 0;

var ENEMY_CONFIG = {
  'bombermen': {
    name: 'bombermen',
    hp:100,
    power:100,
    armor:100,
    agility:100,
    unit_image: 'bombermen'
  },
  'thief' :{
    name: 'thief',
    hp:100,
    power:100,
    armor:100,
    agility:100,
    unit_image: 'thief'
  }
};
var enemiesArray = ['thief',null,null,null,'bombermen',null,null,null,'thief'];
var enemiesCount = enemiesArray.length;
var enemyPanels = [
  { x: 664, y: 330 },
  { x: 574, y: 330 },
  { x: 484, y: 330 },
  { x: 687, y: 414 },
  { x: 597, y: 414 },
  { x: 507, y: 414 },
  { x: 710, y: 498 },
  { x: 620, y: 498 },
  { x: 530, y: 498 }]

var deployedUnits = [];
var deployedEnemies = [];
var selectedPanels = [];
var deployModeButton = {};
var deployModefooter = {};
var activePanel = {};
var smallTip = {};

var game = new Phaser.Game(gameWidthX, gameHeightX, Phaser.CANVAS, '',
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

  game.load.image('valkyrie', 'assets/착한놈.png');
  game.load.image('footman', 'assets/착한졸병1.png');

  game.load.image('bombermen', 'assets/나쁜해골.png');
  game.load.image('thief', 'assets/나쁜놈1.png');

  game.load.image('flag_1', 'assets/flag_1.png');
  game.load.image('flag_2', 'assets/flag_2.png');
  game.load.image('flag_3', 'assets/flag_3.png');

}

function create() {
  var margin = 50;
  var x = -margin;
  var y = -margin;
  var w = game.world.width + margin * 2;
  var h = game.world.height + margin * 2;
  game.world.setBounds(x, y, w, h);
  game.physics.setBoundsToWorld();
  //  Game에서 커서가 떠나도 게임이 정지하지 않는다.
  game.stage.disableVisibilityChange = true;
  game.add.sprite(0, 0, 'background');
  var bg1 = game.add.sprite(0, 0, 'bg_1');
  var bg2 = game.add.sprite(0, 0, 'bg_2');
  game.time.events.loop(Phaser.Timer.SECOND, function(){
    if(bg2.alpha === 0) {
      bg2.alpha = 1;
    } else {
      bg2.alpha = 0;
    }
  }, this);

  activePanel = game.add.sprite(10, 330, 'active_panel');
  activePanel.alpha = 0;
  selectedPanels = createSelectedPanels();
  game.add.sprite(32, 100, 'tip_01');

  var normalModefooter = game.add.sprite(0, 840, 'footer_ui_basic');
  deployModefooter = game.add.sprite(0, 755, 'footer_ui_select');
  deployModefooter.alpha = 0;

  for(var i = 0 ; i < myUnitsArray.length ; i++) {
    var properties = {
      game: game,
      unitData: UNIT_CONFIG[myUnitsArray[i]],
      buttonClickHandler: initUnitButton
    };
    var unit = new Unit(properties);
    deployedUnits.push(unit);
  }
  sortUnitButton();

  deployModeButton = game.add.sprite(42, 922, 'btn_member_0');
  deployModeButton.inputEnabled = true;
  deployModeButton.events.onInputDown.add(function(me){
    if(gameMode === 'NORMAL') {
      gameMode = 'DEPLOY';
    } else {
      gameMode = 'NORMAL';
    }
  }, this);
  game.add.sprite(42, 1065, 'btn_start');
  smallTip = game.add.sprite(266, 843, 'small_tip');
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
    game.add.sprite(56, 330, 'panel_selected'),
    game.add.sprite(146, 330, 'panel_selected'),
    game.add.sprite(236, 330, 'panel_selected'),
    game.add.sprite(33, 414, 'panel_selected'),
    game.add.sprite(123, 414, 'panel_selected'),
    game.add.sprite(213, 414, 'panel_selected'),
    game.add.sprite(10, 498, 'panel_selected'),
    game.add.sprite(100, 498, 'panel_selected'),
    game.add.sprite(190, 498, 'panel_selected')
  ]

  for(var i =0 ; i < selectedPanels.length ; i++) {
    selectedPanels[i].inputEnabled = true;
    selectedPanels[i].alpha = 0;
    selectedPanels[i].data= {
      'unit': null
    };

    selectedPanels[i].events.onInputOver.add(function(me){
      if(gameMode === 'DEPLOY') {
        me.alpha = 1;
      }
    }, this);
    selectedPanels[i].events.onInputOut.add(function(me){
      if(gameMode === 'DEPLOY') {
        if(!me.data['unit']) {
          me.alpha = 0;
        }
      }
    }, this);
    selectedPanels[i].events.onInputDown.add(function(me){
      if(gameMode === 'DEPLOY') {
        for(var i = 0 ; i < deployedUnits.length ; i++) {
          if(deployedUnits[i].isButtonSelected) {
            var success = deployedUnits[i].deployUnit(me.x, me.y);
            if(success) {
              unitCount++;
              me.data['unit'] = deployedUnits[i];
              deployModeButton.loadTexture('btn_member_' + unitCount, 0);
              deployedUnits[i].updateFlag(unitCount)
              sortUnit();
              sortUnitButton();
            }
            break;
          }
        }
      }
    }, this);
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
  var firstX = 44;
  var firstY = 798;
  var index = 0;
  for(var i = 0 ; i < deployedUnits.length ; i++) {
    var unit = deployedUnits[i];
    if(!unit.deployed) {
      unit.moveButtonPosition(firstX + (index * 130), firstY);
      index++;
    }
  }
}

function initUnitButton() {
  for(var i = 0 ; i < deployedUnits.length; i++) {
    if(deployedUnits[i].isButtonSelected) {
      deployedUnits[i].deselectUnitButton();
    }
  }
}

function createEnemies() {
  for(var i = 0 ; i < enemiesArray.length ; i++) {
    var enemyName = enemiesArray[i];
    if(enemyName != null && enemyName !== '') {
      var properties = {
        game: game,
        enemyData: ENEMY_CONFIG[enemiesArray[i]],
        positionIndex: enemyPanels[i]
      };
      var enemy = new Enemy(properties);
      deployedEnemies.push(enemy);
    }
  }
}

function update(){
  if(gameMode === 'DEPLOY') {
    smallTip.alpha = 0;
    deployModefooter.alpha = 1;
    activePanel.alpha = 1;
    for(var i = 0 ; i < deployedUnits.length ; i++) {
      if(!deployedUnits[i].deployed) {
        var unitButton = deployedUnits[i].getUnitButton();
        unitButton.alpha = 1;
      }
    }
  } else {
    if(MAX_UNIT_COUNT > unitCount) {
      smallTip.alpha = 1;
    }
    deployModefooter.alpha = 0;
    activePanel.alpha = 0;
    for(var i = 0 ; i < deployedUnits.length ; i++) {
      var unitButton = deployedUnits[i].getUnitButton();
      unitButton.alpha = 0;
    }
  }
}
