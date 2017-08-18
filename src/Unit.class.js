function Unit(props) {
  this.game = props.game;
  this.unitData = props.unitData;
  this.unit_image = this.unitData.unit_image;
  this.deployed = false;
  this.isButtonSelected = false;
  this.unitIndex = 0;
  this.flag = null;
  this.deployPosition = {};

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
  //this.game.physics.arcade.enable(unit);
  // unit.animations.add('normal', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], 14, true);
  //
  // var me = this;
  // unit.animations.add('attack', [0, 14, 15, 16, 17], 5, false).onComplete.add(function(){
  //   me.unit.animations.play('normal');
  //   var targetX = me.unit.x - 40;
  //   var tween3 = me.game.add.tween(me.unit).to({x: targetX}, 800, Phaser.Easing.Linear.None, true, 0, 0, false);
  //   tween3.onComplete.add(function() {
  //       me.unit.alpha = 0;
  //       var tween2 = me.game.add.tween(me.unit).to({x: me.deployPosition.x, y: me.deployPosition.y}, 800, Phaser.Easing.Linear.None, true, 0, 0, false);
  //       tween2.onComplete.add(function() {
  //           me.unit.alpha = 1;
  //       }, this);
  //   }, this);
  //
  // }, this);
  //
  // unit.animations.add('attacked', [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33], 16, false);
  // unit.animations.add('selected', [34, 35, 36, 37, 38, 39, 40, 41 ,42, 43, 44, 45, 46, 47], 14, false);

  //unit.animations.currentAnim.speed = 20;
  //unit.animations.play('normal');
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
      this.deployPosition = { x: this.unit.x, y: this.unit.y }
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
  }
}
