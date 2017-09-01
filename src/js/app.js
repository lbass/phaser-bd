'use strict';
import { BdButton, BdMask, BdSprite, CommonUnit, MyUnit, SkelUnit } from './bd'
import { CloseButton, SoundButton, Member, Utils } from './fsnbase'

let GAME = {};
let func = {};
let IS_MUTE;
const MY_UNIT_NAME_ARRAY = ['axeman','swordman','swordman'];
const ENEMIES_NAME_ARRAY = [null,null,null,null,'skel',null,null,null,null];

// data preload
let request = new XMLHttpRequest();
request.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    let config = JSON.parse(this.responseText);
    let gameConfig = config.game_config;
    GAME = new Phaser.Game(gameConfig.game_width, gameConfig.game_height, Phaser.CANVAS, '',
    {
      preload: func.preload,
      create: func.create,
      update: func.update
    }, false, false);

    GAME.const = {
      sound_on_off_button_x: gameConfig.sound_onoff_button_x, // DEPLOY, NORMAL
      sound_on_off_button_y: gameConfig.sound_onoff_button_y,
      close_button_x:gameConfig.close_button_x,
      close_button_y: gameConfig.close_button_y,
      my_unit_panel_xy: gameConfig.my_unit_panel_xy,
      enemy_unit_panel_xy: gameConfig.enemy_unit_panel_xy,
      unit_config: config.unit_config,
      images: config.images,
      sprite_sheets: config.sprite_sheets
    };

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
      current_turn: 0,
      turn_order: [],
      tutorial_step: 0
    };
    GAME.func = func;
    GAME.member = new Member();
  }
};
request.open('GET', './assets/data.json', true);
request.send();

func.preload = function() {
  let images = GAME.const.images;
  for(let i = 0 ; i < images.length ; i++) {
    let image = images[i];
    GAME.load.image(image.name, image.path);
  }
  let spriteSheets = GAME.const.sprite_sheets;
  for(let i = 0 ; i < spriteSheets.length ; i++) {
    let sheet = spriteSheets[i];
    GAME.load.spritesheet(sheet.name, sheet.path, sheet.width, sheet.height, sheet.frame);
  }
}

func.create = function() {
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
  GAME.member.add(new BdSprite({game: GAME, x: 240, y: 498, image_key: 'attack_panel', id: 'attack_bottom_panel', default_alpha: 0}));
  GAME.member.add(new BdSprite({ game: GAME, x: 60, y: 332, image_key: 'active_panel', id: 'active_panel', visible: false}));
  GAME.member.get('active_panel').startTween({alpha: 0.1}, 800, 0, 5000);

  for(let i = 0 ; i < GAME.const.my_unit_panel_xy.length ; i++) {
    let position = GAME.const.my_unit_panel_xy[i];
    let index = i;
    let bdSprite = new BdSprite({ game: GAME, x: position.x, y: position.y, image_key: 'panel_selected', id: 'panel_selected_' + index, default_alpha: 0});
    GAME.member.add(bdSprite);
    bdSprite.changeInputEnableState(true);
    bdSprite.setData('unit', null);
    bdSprite.setData('index', index);
    GAME.data.left_unit_bottom_panels.push(bdSprite);
  }

  for(let i = 0 ; i < GAME.const.enemy_unit_panel_xy.length ; i++) {
    let index = i;
    let position = GAME.const.enemy_unit_panel_xy[i];
    let bdSprite = new BdSprite({ game: GAME, x: position.x, y: position.y, image_key: 'right_battle_unit_panel', id: 'right_unit_panel_' + index, default_alpha: 0});
    GAME.data.right_unit_bottom_panels.push(bdSprite);
  }

  GAME.member.add(new BdSprite({ game: GAME, x: 50, y: 840, image_key: 'footer_ui_basic', id: 'normal_mode_footer'}));
  GAME.member.add(new BdSprite({ game: GAME, x: 50, y: 755, image_key: 'footer_ui_select', id: 'deploy_mode_footer', visible: false}));

  let props = { game: GAME, x: 0, y: 0, image_key: 'battleStart', id: 'start_effect', visible: false, animations: { 'battleEffect' : { data: [0,1,2,3,4,5,6,7,8,9,10], is_loop: false } }};
  GAME.member.add(new BdSprite(props));
  props = { game: GAME, x: 0, y: 0, image_key: 'boomb', id: 'boom_effect', visible: false, animations: { 'explosion' : { data: [0,1,2,3,4,5,6,7], is_loop: false } }};
  GAME.member.add(new BdSprite(props));

  for(let i = 0 ; i < MY_UNIT_NAME_ARRAY.length ; i++) {
    let index = i;
    let properties = {
      game: GAME,
      position: null,
      unitData: GAME.const.unit_config[MY_UNIT_NAME_ARRAY[i]],
      id: index
    };
    GAME.data.my_units.push(new MyUnit(properties));
  }
  GAME.func.sortUnitButton();

  GAME.member.add(new BdButton({ game: GAME, x: 410, y: 985, image_key: 'btn_member_0', id: 'deploy_mode_button'}));
  GAME.member.add(new BdButton({ game: GAME, x: 410, y: 1122, image_key: 'btn_start', id: 'battle_start_button'}));

  GAME.sound.mute = IS_MUTE;
  GAME.member.add(new SoundButton({ game: GAME, x: GAME.const.sound_on_off_button_x, y: GAME.const.sound_on_off_button_y }));
  GAME.member.add(new CloseButton({ game: GAME, x: GAME.const.close_button_x, y: GAME.const.close_button_y }));

  GAME.func.createEnemies();

  GAME.member.add(new BdSprite({ game: GAME, x: 116, y: 327, image_key: 'round_1', id: 'display_round', default_alpha: 0}));
  GAME.member.add(new BdSprite({ game: GAME, x: 50, y: 755, image_key: 'bg_round_1', id: 'bg_round', visible: false}));
  GAME.member.add(new BdSprite({ game: GAME, x: 346, y: 1003, image_key: 'speedX2', id: 'speed_sprite', visible: false, animations: { 'run' : { data: [0,1,2,3,4,5,6], is_loop: true }}}));

  let koAniData = [0,1,2,3,4,5,6];
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
  func.setTutorialStep1();
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
  let turnOrder = GAME.data.turn_order;
  for(let i = 0 ; i < deployedMyUnits.length ; i++) {
    turnOrder[i] = deployedMyUnits[i];
  }
  let deployedEnemies = GAME.data.deployed_enemies;
  for(let i = 0 ; i < deployedEnemies.length ; i++) {
    turnOrder.splice((i * 2) + 1, 0, deployedEnemies[i]);
  }
  GAME.func.changeGameMode('WAIT');
  GAME.data.round = 1;
  GAME.func.alertStartRound(GAME.data.round);
  GAME.time.events.add(2000, function() {
    GAME.func.changeGameMode('BATTLE');
  }, this);
}

func.setTutorialStep1 = function() {
  // 용병 교체 버튼 선택 화면
  GAME.data.tutorial_step = 1;
  let mask = new BdMask({game: GAME, x: 0, y: 0, color:0x000000, id:'tutorial_mask', default_alpha: 0.6});
  mask.changeInputEnableState(true);
  GAME.member.add(mask);
  GAME.member.get('deploy_mode_button').body.input.priorityID = 99;
  GAME.member.add(new BdSprite({ game: GAME, x: 60, y: 333, image_key: 'tuto_all_red', id: 'tuto_all_red', default_alpha: 0}));
  GAME.member.add(new BdSprite( { game: GAME, x: 140, y: 581, image_key: 'tuto_text_1', id: 'tuto_text'}));

  let props = {
    game: GAME,
    x: 93,
    y: 922,
    image_key: 'tutorial_deploy_btn',
    id: 'tutorial_deploy_btn',
    animations: {
      'run' : { data: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34], is_loop: true }
    }
  };
  let tutorialDeployBtn = new BdSprite(props);
  GAME.member.add(tutorialDeployBtn);
  tutorialDeployBtn.playAnimation('run', 21);

  let clickHand = new BdSprite( { game: GAME, x: 450, y: 580, image_key: 'click_hand_1', id: 'click_hand' });
  GAME.member.add(clickHand);

  let imageIndex = 0;
  let timeEvent = GAME.time.events.loop(Phaser.Timer.SECOND / 2,
    function(){
      if(imageIndex === 2) {
        imageIndex = 1;
      } else {
        imageIndex++;
      }
      clickHand.changeImage('click_hand_' + imageIndex);
    }, this);
  timeEvent.o_id = 'start_tutorial_event';

  props = {
    game: GAME,
    x: 93,
    y: 1062,
    image_key: 'tutorial_start_btn',
    id: 'tutorial_start_btn',
    visible: true,
    animations: {
      'run' : { data: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20], is_loop: true }
    }
  };
  let tutorialStartBtn = new BdSprite(props);
  GAME.member.add(tutorialStartBtn);
}

func.setUnitSelectModeForTutorial= function(index) {
  let tutorialMask = GAME.member.get('tutorial_mask');
  let tutoText = GAME.member.get('tuto_text');
  let textPosition = tutoText.getPosition();

  tutorialMask.bringToTop();
  tutoText.setPosition(textPosition.x, textPosition.y - 115);
  tutoText.changeImage('tuto_text_2');
  tutoText.bringToTop();

  GAME.data.my_units[index].unit_button.bringToTop();
  GAME.data.my_units[index].unit_button_effect.bringToTop();
}

func.setUnitDeployModeForTutorial= function(index) {
  let tutorialMask = GAME.member.get('tutorial_mask');
  let tutoText = GAME.member.get('tuto_text');
  let textPosition = tutoText.getPosition();

  tutorialMask.bringToTop();
  tutoText.setPosition(textPosition.x, textPosition.y - 115);
  tutoText.changeImage('tuto_text_2');
  tutoText.bringToTop();

  GAME.data.my_units[index].unit_button.bringToTop();
  GAME.data.my_units[index].unit_button_effect.bringToTop();
}

func.setTutorialStep2 = function(index) {
  GAME.data.tutorial_step = 2;
  let tutorialDeployBtn = GAME.member.get('tutorial_deploy_btn');
  let deployModeButton = GAME.member.get('deploy_mode_button');
  let tutoText = GAME.member.get('tuto_text');
  deployModeButton.body.input.priorityID = 0;
  func.setUnitSelectModeForTutorial(0)
  tutorialDeployBtn.changeDisplayState(false);

  let clickHand = GAME.member.get('click_hand');
  clickHand.setPosition(40, 440);
  let props = {
    game: GAME,
    x: 90,
    y: 790,
    image_key: 'btn_select_animation',
    id: 'btn_select_animation_1',
    animations: {
      'run' : { data: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34], is_loop: true }
    }
  };
  let btnSelectAnimation = new BdSprite(props)
  GAME.member.add(btnSelectAnimation);
  btnSelectAnimation.playAnimation('run', 25);

  props.id = 'btn_select_animation_2'
  props.x = props.x + 130;
  btnSelectAnimation = new BdSprite(props);
  GAME.member.add(btnSelectAnimation);
  btnSelectAnimation.playAnimation('run', 25);

  props.id = 'btn_select_animation_3'
  props.x = props.x + 130;
  btnSelectAnimation = new BdSprite(props);
  GAME.member.add(btnSelectAnimation);
  btnSelectAnimation.playAnimation('run', 25);
  clickHand.bringToTop();

}

func.setTutorialStep3 = function() {
  // 배치 화면
  GAME.data.tutorial_step = 3;
  GAME.member.get('tutorial_mask').bringToTop();
  GAME.data.left_unit_bottom_panels[4].body.input.priorityID = 99;

  GAME.member.get('active_panel').changeDisplayState(false);
  GAME.member.get('btn_select_animation_1').changeDisplayState(false);
  GAME.member.get('btn_select_animation_2').changeDisplayState(false);
  GAME.member.get('btn_select_animation_3').changeDisplayState(false);

  let tutoText = GAME.member.get('tuto_text');
  tutoText.bringToTop();
  let clickHand = GAME.member.get('click_hand');
  let clickHandPosition = clickHand.getPosition();
  tutoText.changeImage('tuto_text_3');
  clickHand.setPosition(85, 30);
  let panel = new BdSprite({ game: GAME, x: 174, y: 416, image_key: 'panel_selected', id: 'tutorial_panel'});
  panel.changeInputEnableState(true);
  GAME.member.add(panel);
  clickHand.bringToTop();
}

func.setTutorialStep4 = function() {
  GAME.data.tutorial_step = 4;

  GAME.data.my_units[1].unit_button.bringToTop();
  GAME.data.my_units[2].unit_button.bringToTop();
  GAME.member.get('btn_select_animation_1').bringToTop();
  GAME.member.get('btn_select_animation_2').bringToTop();
  // 선택 화면
  let clickHand = GAME.member.get('click_hand');
  clickHand.changeDisplayState(false);
  GAME.member.get('tutorial_panel').destroy();
  let tutoText = GAME.member.get('tuto_text');
  tutoText.changeImage('tuto_text_2');
  GAME.member.get('btn_select_animation_1').changeDisplayState(true);
  GAME.member.get('btn_select_animation_2').changeDisplayState(true);

}

func.setTutorialStep5 = function() {
  // 기타 유닛 배치 화면
  GAME.data.tutorial_step = 5;
  let tutoText = GAME.member.get('tuto_text');
  let clickHand = GAME.member.get('click_hand');
  tutoText.changeImage('tuto_text_3');
  clickHand.setPosition(40, 440);
  GAME.member.get('btn_select_animation_1').changeDisplayState(false);
  GAME.member.get('btn_select_animation_2').changeDisplayState(false);

  let tweenConfig = { alpha: 1 };
  let delay = 0;
  let repeat = -1;
  let yoyo = true;
  let tutoAllRed = GAME.member.get('tuto_all_red')
  tutoAllRed.startTween(tweenConfig, 500, delay, repeat, yoyo);

  clickHand.bringToTop();
}

func.setTutorialStep6 = function() {
  // 기타 유닛 배치 화면
  GAME.data.tutorial_step = 6;
  GAME.member.get('active_panel').changeDisplayState(false);
  let tutoAllRed = GAME.member.get('tuto_all_red')
  tutoAllRed.changeDisplayState(false);
  let clickHand = GAME.member.get('click_hand');
  clickHand.changeDisplayState(false);
  let tutoText = GAME.member.get('tuto_text');
  tutoText.changeImage('tuto_text_2');
  GAME.member.get('btn_select_animation_1').changeDisplayState(true);
  GAME.member.get('btn_select_animation_2').changeDisplayState(false);
  clickHand.bringToTop();
}

func.setTutorialStep7 = function() {
  // 기타 유닛 배치 화면
  GAME.data.tutorial_step = 7;
  let tutoText = GAME.member.get('tuto_text');
  let clickHand = GAME.member.get('click_hand');
  tutoText.changeImage('tuto_text_3');
  clickHand.setPosition(40, 440);
  GAME.member.get('btn_select_animation_1').changeDisplayState(false);
  let tutoAllRed = GAME.member.get('tuto_all_red');
  tutoAllRed.changeDisplayState(true);
  clickHand.bringToTop();
}

func.setTutorialStep8 = function() {
  GAME.data.tutorial_step = 8;
  let tutoAllRed = GAME.member.get('tuto_all_red')
  let clickHand = GAME.member.get('click_hand');
  let tutoText = GAME.member.get('tuto_text');
  let activePanel = GAME.member.get('active_panel');
  let tutorialStartBtn = GAME.member.get('tutorial_start_btn');
  clickHand.changeDisplayState(false);
  tutoAllRed.changeDisplayState(false);
  activePanel.changeDisplayState(false);
  tutoText.changeImage('tuto_text_4');
  GAME.member.get('btn_select_animation_1').changeDisplayState(false);
  GAME.member.get('btn_select_animation_2').changeDisplayState(false);
  GAME.member.get('btn_select_animation_3').changeDisplayState(false);
  tutoText.setPosition(140, 581);
  tutorialStartBtn.changeDisplayState(true);
  tutorialStartBtn.playAnimation('run', 21);
}


func.initUnitButton = function() {
  let myUnits = GAME.data.my_units;
  for(let i = 0 ; i < myUnits.length; i++) {
    myUnits[i].deselectUnitButton();
  }
}

func.selectUnitButton = function() {
  let myUnits = GAME.data.my_units;
  for(let i = 0 ; i < myUnits.length; i++) {
    if(myUnits[i].isButtonSelected()) {
      myUnits[i].selectUnitButton();
    }
  }
}

func.changeGameMode = function(mode) {
  GAME.data.game_mode = mode;
  if(mode === 'DEPLOY') {
    func.showMask();
    func.showUnitButton();
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
    for(let i = 0 ; i < deployedMyUnits.length ; i++) {
      deployedMyUnits[i].readyToBattle();
    }
    let deployedEnemies = GAME.data.deployed_enemies;
    for(let i = 0 ; i < deployedEnemies.length ; i++) {
      deployedEnemies[i].readyToBattle();
    }

    let leftUnitBottomPanels = GAME.data.left_unit_bottom_panels;
    for(let i = 0 ; i < leftUnitBottomPanels.length ; i++) {
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
  func.setUnitDeployButton();
}

func.showSkill = function(skillName) {
  let skillText = GAME.member.get('skill_text');
  skillText.changeImage(skillName);
  skillText.changeDisplayState(true);
}

func.hideSkill = function() {
  let skillText = GAME.member.get('skill_text');
  skillText.changeDisplayState(false);
}

func.showBattleUnitPanel = function(left, right) {
  let leftUnitBottomPanels = GAME.data.left_unit_bottom_panels;
  let rightUnitBottomPanels = GAME.data.right_unit_bottom_panels;
  if(left.constructor === Array) {
    for(let i = 0 ; i < left.length ; i++) {
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
  for(let i = 0 ; i < leftUnitBottomPanels.length ; i++) {
    leftUnitBottomPanels[i].setAlpha(0);
  }
  for(let i = 0 ; i < rightUnitBottomPanels.length ; i++) {
    rightUnitBottomPanels[i].setAlpha(0);
  }
}

func.resetData = function() {
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
    current_turn: 0,
    turn_order: []
  };
}

func.plyaTutorial = function() {
  let popupClose = new BdButton({ game: GAME, x: 675, y: 333, image_key: 'popup_close', id: 'popup_close'})
  let allMask = GAME.member.get('all_mask');
  let tutorialMovie = GAME.member.get('tutorial_movie');

  allMask.setAlpha(0.9);
  allMask.changeInputEnableState(true);
  allMask.bringToTop();

  tutorialMovie.changeDisplayState(true);
  tutorialMovie.bringToTop();
  popupClose.bringToTop();

  let imageIndex = 1;
  let timeEvent = GAME.time.events.loop(Phaser.Timer.SECOND / 2,
    function() {
      if(imageIndex === 2) {
        imageIndex = 1;
      } else {
        imageIndex++;
      }
      tutorialMovie.changeImage('tutorial_' + imageIndex);
    }, this);
    timeEvent.o_id = 'tutorial_event';
    GAME.member.add(timeEvent);
}

func.closeTutorial = function() {
  let tutorialMovie = GAME.member.get('tutorial_movie');
  let allMask = GAME.member.get('all_mask');
  tutorialMovie.changeDisplayState(false);
  allMask.setAlpha(0);
  allMask.changeInputEnableState(false);
}

func.playKoAnimation = function(x, y) {
  let sprite1 = GAME.member.get('ko_sprite_1');
  let sprite2 = GAME.member.get('ko_sprite_2');
  let sprite3 = GAME.member.get('ko_sprite_3');
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
  let mask = GAME.member.get('mask');
  let alpha = 0.8;
  let delay = 0;
  mask.fadeIn(alpha, duration, delay);
}

func.showRedMask = function() {
  GAME.member.get('red_mask').setAlpha(0.4);
}

func.hideRedMask = function() {
  GAME.member.get('red_mask').setAlpha(0);
}

func.playBoomEffect = function(x, y) {
  let bombEffect = GAME.member.get('boom_effect');
  bombEffect.bringToTop();
  bombEffect.changeDisplayState(true);
  bombEffect.setPosition(x, y);
  bombEffect.playAnimation('explosion', 21);
}

func.playBattleStartEffect = function(x, y) {
  let startEffect = GAME.member.get('start_effect');
  startEffect.changeDisplayState(true);
  startEffect.setPosition(x, y);
  startEffect.playAnimation('battleEffect', 20);
}

func.hideAttackReadyPannel = function() {
  GAME.member.get('attack_bottom_panel').changeDisplayState(false);
}
func.showAttackReadyPannel = function(x, y, duration) {
  let attackBottomPanel = GAME.member.get('attack_bottom_panel');
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

  GAME.member.add(new BdMask({game: GAME, x: 0, y: 0, color:0x000000, id:'temp_mask', default_alpha: 0.8}));

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
  for(let i = 0 ; i < myUnits.length ; i++) {
    let unit = myUnits[i];
    if(unit.isButtonSelected()) {
      result = unit;
      deployedMyUnits[myDeployedUnitCount] = unit;
      myDeployedUnitCount++;
      GAME.data.my_deployed_unit_count = myDeployedUnitCount;
      myUnitPosition[panelIndex] = unit;

      unit.deployUnit(x, y, panelIndex, myDeployedUnitCount);
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
  for(let i = 0 ; i < targetList.length; i++) {
    if(targetList[i].isAlive()) {
      resultList.push(targetList[i]);
    }
  }
  return resultList;
}

func.hitEffect = function() {
  GAME.func.showRedMask();
  Utils.shakingShaking(GAME, 30, 3, GAME.func.hideRedMask);
}

func.showUnitButton = function() {
  let myUnits = GAME.data.my_units;
  for(let i = 0 ; i < myUnits.length; i++) {
    myUnits[i].showUnitButton();
  }
}

func.setUnitDeployButton = function() {
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

func.sortUnit = function() {
  let leftUnitBottomPanels = GAME.data.left_unit_bottom_panels;
  for(let i = 0 ; i < leftUnitBottomPanels.length ; i++) {
    let panle = leftUnitBottomPanels[i];
    let unit = panle.getData('unit');
    if(unit) {
      unit.updateZindex();
    }
  }
}

func.sortUnitButton = function() {
  let firstX = 154;
  let firstY = 855;
  let index = 0;
  let myUnits = GAME.data.my_units;
  for(let i = 0 ; i < myUnits.length ; i++) {
    let unit = myUnits[i];
    if(!unit.deployed) {
      unit.moveButtonPosition(firstX + (index * 130), firstY);
      index++;
    }
  }
}

func.createEnemies = function() {
  let enemyCount = 0;
  let deployedEnemies = GAME.data.deployed_enemies;
  let enemyUnitPosition = GAME.data.enemy_unit_position;
  let enemyUnitPanelXY = GAME.const.enemy_unit_panel_xy;
  for(let i = 0 ; i < ENEMIES_NAME_ARRAY.length ; i++) {
    let enemyName = ENEMIES_NAME_ARRAY[i];
    let index = i;
    if(enemyName != null && enemyName !== '') {
      let unitData = GAME.const.unit_config[ENEMIES_NAME_ARRAY[i]];
      let properties = {
        game: GAME,
        unitData: unitData,
        id: index,
        position: enemyUnitPanelXY[i]
      };
      let enemy = {};
      if(unitData.name === "skel") {
        enemy = new SkelUnit(properties);
      } else {
        enemy = new CommonUnit(properties);
      }
      enemyCount++;
      enemy.initEnemyUnit(enemyCount, i);
      deployedEnemies.push(enemy);
      enemyUnitPosition[i] = enemy;
    }
  }
}

func.update = function() {
  if(GAME.data.game_mode === 'BATTLE') {
    let currentTurnUnit = GAME.data.turn_order[GAME.data.current_turn];
    if(!currentTurnUnit) {
      return;
    }

    let isEndTurn = currentTurnUnit.isEndAction() || !(currentTurnUnit.isAlive());
    if(isEndTurn) {
      GAME.data.current_turn++;
    } else {
      currentTurnUnit.update();
    }
    if(GAME.data.current_turn >= GAME.data.turn_order.length) {
      let enemies = GAME.func.getAliveEnemies('my');
      let myUnits = GAME.func.getAliveEnemies('enemy');
      if(enemies.length <= 0) {
        GAME.time.events.add(1000, function() {
          GAME.func.gameOver('WIN');
        }, this);
        return;
      }

      if(myUnits.length <= 0) {
        GAME.time.events.add(1000, function() {
          GAME.func.gameOver('LOSE');
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
    }
  }
}

func.gameOver = function(type) {
  let pop = null;
  let allMask = GAME.member.get('all_mask');
  allMask.bringToTop();
  allMask.setAlpha(0.9);
  if(type === 'WIN') {
    new BdSprite({game: GAME, x: 86,y: 212,image_key: 'win_pop'});
  } else {
    new BdSprite({game: GAME, x: 86,y: 212,image_key: 'lose_pop'});
  }
  let buttonY = 842;
  new BdButton({game: GAME, x: 410, y: buttonY, image_key: 'continue_btn', id: 'continue_btn'});
  new BdButton({game: GAME, x: 410, y: buttonY + 114, image_key: 'replay_btn', id: 'replay_btn'});

  GAME.member.get('speed_sprite').changeDisplayState(false);
}
