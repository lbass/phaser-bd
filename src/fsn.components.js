fsn = {};
fsn.components = {};

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

fsn.components.attackEnemy = function(target) {
  var me = this;
  if(me.isAttacking) {
    return;
  }

  me.flag.visible = false;
  me.isAttacking = true;
  me.unit.animations.stop();
  var movePath = [
    {x: me.unit.x + this._MOVE_PATH_01_X, y: this.unit.y, duration: 150},
    {x: target.x + this._MOVE_PATH_02_X, y: target.y + this._MOVE_PATH_02_Y, duration: 150},
    {x: target.x + this._MOVE_PATH_03_X, y: target.y + this._MOVE_PATH_03_Y, duration: 150},
    {x: me.unit.x , y: this.unit.y, duration: 150}
  ];

  me.unit.animations.getAnimation('attack').onComplete.add(function(){
    me.game.time.events.add(200, function(){
      me.unit.animations.play('normal');
      me.blurX.blur = BLUR_MAX;
      var move4 = me._move(movePath[1].x, movePath[1].y, movePath[1].duration, function() {
        //me.unit.alpha = 0;
        var move5 = me._move(movePath[0].x, movePath[0].y, movePath[0].duration, function() {
          me.unit.alpha = 1;
          var move6 = me._move(movePath[3].x, movePath[3].y, movePath[3].duration, function() {
            me.blurX.blur = 0;
            me.unit.alpha = 1;
            me.flag.visible = true;
            me.isEndOfTurn = true;
            me.isAttacking = false;
          });
        });
      });
    }, me);
  }, me);

  me.blurX.blur = BLUR_MAX;
  var move1 = me._move(movePath[0].x, movePath[0].y, movePath[0].duration, function() {
    //me.unit.alpha = 0;
    var move2 = me._move(movePath[1].x, movePath[1].y, movePath[1].duration, function() {
      me.unit.alpha = 1;
      var move3 = me._move(movePath[2].x, movePath[2].y, movePath[2].duration, function() {
        me.blurX.blur = 0;
        me.game.time.events.add(300, function(){
          me.unit.animations.play('attack');
          target.animations.play('attacked');
          me.unit.animations.currentAnim.speed = 21;
          me._hitEffect();
        }, me);
      });
    });
  });
}
