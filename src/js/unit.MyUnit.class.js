function MyUnit(props) {
  CommonUnit.call(this, props);
  // orverride
  this._FLAG_X = -20;
  this._FLAG_Y = -70;
  this._MOVE_PATH_01_X = -85
  this._MOVE_PATH_01_Y = 0

  this.deployed = false;
  this.isButtonSelected = false;
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
  this.unit.visible = false;
};

MyUnit.prototype = {
  deployUnit: function(x, y, unitIndex) {
    if(!this.deployed) {
      this.unit.x = x + 47;
      this.unit.y = y;
      this.unit.visible = true;
      this.unit.animations.play('selected');
      this.unit.animations.currentAnim.speed = 15;
      var playCount = 0;
      this.unit.animations.getAnimation('selected').onLoop.add(function(){
        playCount++
        if(playCount >= 2) {
          this.unit.animations.play('normal');
        }
      }, this);
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
  updateHpBar: function() {
    this.hpGrp.x = this.unit.x - 65;
    this.hpGrp.y = this.unit.y;
  },
  viewGreenFoothold: function() {

  },
  viewReadyEffect: function() {
  },
  readyAttacking: function(duration) {
    this.game.func.showAttackReadyPannel(this.unit.x - 48, this.unit.y - 2, duration)
  }
};

MyUnit.prototype.constructor = MyUnit;
for(var key in CommonUnit.prototype) {
  if(!MyUnit.prototype.hasOwnProperty(key) && CommonUnit.prototype.hasOwnProperty(key)) {
    MyUnit.prototype[key] = CommonUnit.prototype[key];
  }
}
