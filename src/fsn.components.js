fsn = {};
fsn.components = {};
fsn.util = {};

fsn.components.SoundOnOffButton = function(props) {
  var thisGame = props.game;
  var soundButton = thisGame.add.sprite(props.x, props.y, props.imageName);
  soundButton.inputEnabled = true;
  soundButton.events.onInputDown.add(function() {
    if(thisGame.sound.mute) {
      thisGame.sound.mute = false;
      soundButton.loadTexture('sound-button-enable');
    } else {
      thisGame.sound.mute = true;
      soundButton.loadTexture('sound-button-disable');
    }
  }, thisGame);

  return soundButton;
}

fsn.components.GameCloseButton = function(props) {
  var thisGame = props.game;
  var closeButton = thisGame.add.sprite(props.x, props.y, props.imageName);
  closeButton.inputEnabled = true;
  closeButton.events.onInputOver.add(function(){
    this.canvas.style.cursor = "pointer";
  }, thisGame);
  closeButton.events.onInputOut.add(function(){
    this.canvas.style.cursor = "default";
  }, thisGame);

  closeButton.events.onInputDown.add(
    function(){
      if(confirm('게임을 종료하고 창을 닫습니다.\n계속하시겠습니까?')) {
        window.close();
      }
    }, thisGame);

  return closeButton;
}
fsn.util.playKoAnimation = function(x, y) {
  if(!KO_SPRITE_01.visible) {
    KO_SPRITE_01.visible = true;
    KO_SPRITE_01.x = x;
    KO_SPRITE_01.y = y;
    KO_SPRITE_01.play('run');
    KO_SPRITE_01.animations.currentAnim.speed = 21;
    return;
  }
  if(!KO_SPRITE_02.visible) {
    KO_SPRITE_02.visible = true;
    KO_SPRITE_02.x = x;
    KO_SPRITE_02.y = y;
    KO_SPRITE_02.play('run');
    KO_SPRITE_02.animations.currentAnim.speed = 21;
    return;
  }
  if(!KO_SPRITE_03.visible) {
    KO_SPRITE_03.visible = true;
    KO_SPRITE_03.x = x;
    KO_SPRITE_03.y = y;
    KO_SPRITE_03.play('run');
    KO_SPRITE_03.animations.currentAnim.speed = 21;
    return;
  }
}

fsn.util.alertStartRound = function(roundCount) {
  DISPLAY_ROUND.loadTexture('round_' + roundCount, 0);
  BG_ROUND.loadTexture('bg_round_' + roundCount, 0);
  var tempMask = GAME.add.graphics(0, 0);
  tempMask.beginFill(0x000000);
  tempMask.drawRect(0, 0, 820, 1350);
  tempMask.alpha = 0.8;
  GAME.world.bringToTop(DISPLAY_ROUND);
  var tween = GAME.add.tween(DISPLAY_ROUND).to({alpha: 1}, 400, Phaser.Easing.Linear.None, true, 000, 0, true);
  tween.onComplete.add(function() {
    tempMask.alpha = 0;
    tempMask.destroy();
  })
  BG_ROUND.visible = true;
  SPEED_SPRITE.visible = true;
  SPEED_SPRITE.play('run');
}

fsn.util.hideAttackReadyPannel = function() {
  MY_UNIT_ATTACK_READY_PANEL.visible = false;
}

fsn.util.showMask = function() {
  GAME_MASK.alpha = 0.6;
}

fsn.util.hideMask = function() {
  GAME_MASK.alpha = 0;
}

fsn.util.showFadeOutMask= function(duration) {
  GAME.add.tween(GAME_MASK).to({alpha: 0.8}, duration, Phaser.Easing.Linear.None, true, 000, 0, true);
}

fsn.util.showRedMask = function() {
  GAME_RED_MASK.alpha = 0.6;
}

fsn.util.hideRedMask = function() {
  GAME_RED_MASK.alpha = 0;
}

fsn.util.showRedMask = function() {
  GAME_RED_MASK.alpha = 0.2;
}

fsn.util.getEnemyPanelPosition = function(type) {
  if(type === 'my') {
    return ENEMY_UNIT_POSITION;
  }
  return MY_UNIT_POSITION;
}

fsn.util.playBattleStartEffect = function(x, y) {
  START_EFFECT.visible = true;
  START_EFFECT.x = x;
  START_EFFECT.y = y;
  START_EFFECT.animations.currentAnim.speed = 20;
  START_EFFECT.play('battleEffect');
}

fsn.util.showAttackReadyPannel = function(x, y, duration) {
  MY_UNIT_ATTACK_READY_PANEL.visible = true;
  MY_UNIT_ATTACK_READY_PANEL.x = x - 48;
  MY_UNIT_ATTACK_READY_PANEL.y = y - 2;
  GAME.add.tween(MY_UNIT_ATTACK_READY_PANEL).to({alpha: 1}, duration, Phaser.Easing.Linear.None, true, 0, 0, true);
}

fsn.util.playBoombEffect = function(x, y) {
  GAME.world.bringToTop(BOMB_EFFECT);
  BOMB_EFFECT.visible = true;
  BOMB_EFFECT.x = x;
  BOMB_EFFECT.y = y;
  BOMB_EFFECT.animations.currentAnim.speed = 21;
  BOMB_EFFECT.play('explosion');
}

fsn.util.getAliveEnemies = function(type) {
  var resultList = new Array();
  var targetList = null;
  if(type === 'my') {
    targetList = DEPLOYED_ENEMIES;
  } else {
    targetList = DEPLOYED_MY_UNITS
  }
  for(var i = 0 ; i < targetList.length; i++) {
    if(targetList[i].alive) {
      resultList.push(targetList[i]);
    }
  }
  return resultList;
}

fsn.util.showBattleUnitPanel = function(left, right) {
    LEFT_BATTLE_UNIT_PANEL.x = left.x - 47;
    LEFT_BATTLE_UNIT_PANEL.y = left.y - 1;
    LEFT_BATTLE_UNIT_PANEL.visible = true;
    RIGHT_BATTLE_UNIT_PANEL.x = right.x - 57;
    RIGHT_BATTLE_UNIT_PANEL.y = right.y + 2;
    RIGHT_BATTLE_UNIT_PANEL.visible = true;
}

fsn.util.hideBattleUnitPanel = function() {
    LEFT_BATTLE_UNIT_PANEL.x = 0
    LEFT_BATTLE_UNIT_PANEL.y = 0;
    LEFT_BATTLE_UNIT_PANEL.visible = false;
    RIGHT_BATTLE_UNIT_PANEL.x = 0;
    RIGHT_BATTLE_UNIT_PANEL.y = 0;
    RIGHT_BATTLE_UNIT_PANEL.visible = false;
}

fsn.util.showSkill = function(skillName) {
  SKILL_TEXT.loadTexture(skillName);
  SKILL_TEXT.visible = true;
}

fsn.util.hideSkill = function() {
  SKILL_TEXT.visible = false;
}

fsn.components.zoomTo = function (isMyUnit) {
  var duration = 300;
  //var bounds = Phaser.Rectangle.clone(game.world.bounds);
  var cameraBounds = game.camera.bounds;
  if(isMyUnit) {
    cameraBounds.x = 0;
  } else {
    cameraBounds.x = 180;
  }
  game.camera.scale.x = 1.2;
  game.camera.scale.y = 1.2;
}

fsn.components.zoomOut = function() {
  var duration = 200;
  var cameraBounds = game.camera.bounds;
  cameraBounds.x = -50;
  game.camera.scale.x = 1.0;
  game.camera.scale.y = 1.0;
}
