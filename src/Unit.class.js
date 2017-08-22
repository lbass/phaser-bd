function Unit(props) {
  this._FLAG_X = 25;
  this._FLAG_Y = -70;
  this._MOVE_PATH_01_X = 85
  this._MOVE_PATH_01_Y = 0

  this.game = props.game;
  this.unitData = props.unitData;
  this.unit_image = this.unitData.unit_image;
  this.unitIndex = 0;
  this.flag = null;
  this.isAttacking = false;
  this.isEndOfTurn = false;

  var x, y = 0;
  if(props.position) {
    x = props.position.x - 40;
    y = props.position.y;
  }
  var unit = this.game.add.sprite(x, y, this.unit_image);
  this.power = this.unitData.power;
  this.health = this.unitData.hp;
  this.alive = true;

  unit.scale.set(0.9, 0.9);
  unit.anchor.set(0.5, 0.5);
  this.game.physics.arcade.enable(unit);

  var animations = this.unitData.animations;
  if(animations) {
    unit.animations.add('normal', animations['normal'], animations['normal'].length, true);
    unit.animations.add('attack', animations['attack'], animations['attack'].length, false);
    unit.animations.add('attacked', animations['attacked'], animations['attacked'].length, false);
    unit.animations.add('selected', animations['selected'], animations['selected'].length, true);
    unit.animations.currentAnim.speed = 20;
    unit.animations.play('normal');
  }

  this.unit = unit;
  this.blurX = this.game.add.filter('BlurX');
  this.blurY = this.game.add.filter('BlurY');
  this.blurX.blur = 0;
  this.blurY.blur = 0;
  unit.filters = [this.blurX, this.blurY];
}

Unit.prototype = {
  update: function() {
  },
  updateFlag: function(unitIndex) {
    this.unitIndex = unitIndex;
    this.flag = this.game.add.sprite(this.unit.x + this._FLAG_X, this.unit.y + this._FLAG_Y, 'flag_' + unitIndex);
    this.flag.anchor.set(0.5, 0.5);
  },
  updateZindex: function() {
    game.world.bringToTop(this.unit);
    game.world.bringToTop(this.flag);
  },
  attackEnemy: function(target) {
    var me = this;
    if(me.isAttacking) {
      return;
    }

    me.flag.visible = false;
    me.isAttacking = true;
    me.unit.animations.stop();
    var movePath = [
      // {x: target.x + this._MOVE_PATH_02_X, y: target.y + this._MOVE_PATH_02_Y, duration: 150},
      {x: target.x + this._MOVE_PATH_01_X, y: target.y + this._MOVE_PATH_01_Y, duration: 200},
      {x: me.unit.x , y: this.unit.y, duration: 200}
    ];

    me.unit.animations.getAnimation('attack').onComplete.add(function(){
      me.game.time.events.add(200, function(){
        me.unit.animations.play('normal');
        me.unit.alpha = 0.3;
        me.blurX.blur = 50;
        var move2 = me._move(movePath[1].x, movePath[1].y, movePath[1].duration, function() {
          me.blurX.blur = 0;
          me.unit.alpha = 1;
          me.flag.visible = true;
          me.isEndOfTurn = true;
          me.isAttacking = false;
        });
      }, me);
    }, me);

    //me.blurX.blur = BLUR_MAX;
    // var move1 = me._move(movePath[0].x, movePath[0].y, movePath[0].duration, function() {
      //me.unit.alpha = 0;
    // fsn.components.zoomTo(me instanceof MyUnit);
    me.game.time.events.add(500, function() {
      // fsn.components.zoomOut();
      me.unit.alpha = 0.3;
      me.blurX.blur = 50;
      var move1 = me._move(movePath[0].x, movePath[0].y, movePath[0].duration, function() {
        me.unit.alpha = 1;
        me.blurX.blur = 0;
        me.game.time.events.add(300, function(){
          me.unit.animations.play('attack');
          //target.damage(me.power);
          target.animations.play('attacked');
          me.unit.animations.currentAnim.speed = 21;
          me._hitEffect();
        }, me);
      });
    }, me);
    //});
  },
  _move: function(targetX, targetY, duration, callback) {
    var me = this;
    var tween = this.game.add.tween(this.unit).to({x: targetX, y: targetY}, duration, Phaser.Easing.Linear.None, true, 0, 0, false);
    tween.onComplete.add(function() {
      callback();
    }, me);
    return tween;
  },
  _hitEffect() {
    var duration = 30;
    var ease = Phaser.Easing.Bounce.InOut;
    var autoStart = true;
    var delay = 200;
    var yoyo = true;
    var repeat = 3;
    this.game.add.tween(this.game.camera).to({x: game.camera.x - 5}, duration, ease, autoStart, delay, repeat, yoyo);
  }
};
