var BLUR_MAX = 60;
function Unit(props) {
  this.game = props.game;
  this.unitData = props.unitData;
  this.unit_image = this.unitData.unit_image;
  this.deployed = false;
  this.isButtonSelected = false;
  this.unitIndex = 0;
  this.flag = null;

  var unitButton = this.game.add.button(44, 798, this.unitData.icon_image, null, this);
  var unitButtonEffect = this.game.add.sprite(36, 790, 'icon_selected');
  unitButton.visible = false;
  unitButtonEffect.visible = false;
  unitButton.inputEnabled = true;
  unitButton.onInputDown.add(function() {
    props.buttonClickHandler();
    this.isButtonSelected = true;
    this.unitButtonEffect.visible = true;
  }, this);

  this.unitButton = unitButton;
  this.unitButtonEffect = unitButtonEffect;

  var unit = this.game.add.sprite(0, 0, this.unit_image);
  this.game.physics.arcade.enable(unit);

  var animations = this.unitData.animations;

  if(animations) {
    unit.animations.add('normal', animations['normal'], animations['normal'].length, true);
    unit.animations.add('attack', animations['attack'], animations['attack'].length, false);
    unit.animations.add('attacked', animations['attacked'], animations['attacked'].length, false);
    unit.animations.add('selected', animations['selected'], animations['selected'].length, false);
    unit.animations.currentAnim.speed = 20;
    unit.animations.play('normal');
  }

  unit.visible = false;
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
  deployUnit: function(x, y, unitIndex) {
    if(!this.deployed) {
      this.unit.reset(x + 43, y);
      this.unit.anchor.set(0.5, 0.5);
      this.unit.scale.set(0.9, 0.9);
      this.unit.visible = true;
      this.deployed = true;
      this.unitButton.visible = false;
      this.unitButtonEffect.visible = false;
      this.isButtonSelected = false;
      return true;
    }
    return false;
  },
  getUnitButton: function() {
    return this.unitButton;
  },
  showUnitButton: function() {
    this.unitButton.visible = true;
  },
  hideUnitButton: function() {
    this.unitButton.visible = false;
    this.unitButtonEffect.visible = false;
  },
  deselectUnitButton: function() {
    this.isButtonSelected = false;
    this.unitButtonEffect.visible = false;
  },
  moveButtonPosition: function(x, y) {
    this.unitButton.reset(x, y);
    this.unitButtonEffect.reset(x - 8, y - 8);
    this.unitButtonEffect.visible = false;
  },
  updateFlag: function(unitIndex) {
    this.unitIndex = unitIndex;
    this.flag = this.game.add.sprite(this.unit.x - 10, this.unit.y - 70, 'flag_' + unitIndex);
    this.flag.anchor.set(0.5, 0.5);
  },
  updateZindex: function() {
    game.world.bringToTop(this.unit);
    game.world.bringToTop(this.flag);
  },
  attackEnemy: function(target) {
    var me = this;
    me.unit.animations.stop();
    var movePath = [
      {x: me.unit.x + 60, y: this.unit.y, duration: 300},
      {x: target.x - 145, y: target.y - 10, duration: 300},
      {x: target.x - 85, y: target.y - 10, duration: 300},
      {x: me.unit.x , y: this.unit.y, duration: 300}
    ];

    me.unit.animations.getAnimation('attack').onComplete.add(function(){
      me.game.time.events.add(200, function(){
        me.unit.animations.play('normal');
        me.blurX.blur = BLUR_MAX;
        var move4 = me._move(movePath[1].x, movePath[1].y, movePath[1].duration, function() {
          me.unit.alpha = 0;
          var move5 = me._move(movePath[0].x, movePath[0].y, movePath[0].duration, function() {
            me.unit.alpha = 1;
            var move6 = me._move(movePath[3].x, movePath[3].y, movePath[3].duration, function() {
              me.blurX.blur = 0;
              me.unit.alpha = 1;
            });
          });
        });
      }, me);
    }, me);

    me.blurX.blur = BLUR_MAX;
    var move1 = me._move(movePath[0].x, movePath[0].y, movePath[0].duration, function() {
      me.unit.alpha = 0;
      var move2 = me._move(movePath[1].x, movePath[1].y, movePath[1].duration, function() {
        me.unit.alpha = 1;
        var move3 = me._move(movePath[2].x, movePath[2].y, movePath[2].duration, function() {
          me.blurX.blur = 0;
          me.game.time.events.add(100, function(){
            me.unit.animations.play('attack');
            me.unit.animations.currentAnim.speed = 21;
          }, me);
        });
      });
    });
  },
  _move: function(targetX, targetY, duration, callback) {
    var me = this;
    var tween = this.game.add.tween(this.unit).to({x: targetX, y: targetY}, duration, Phaser.Easing.Linear.None, true, 0, 0, false);
    tween.onComplete.add(function() {
      callback();
    }, me);
    return tween;
  }
};
