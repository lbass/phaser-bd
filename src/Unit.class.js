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
  unitButton.alpha = 0;
  unitButtonEffect.alpha = 0;
  unitButton.inputEnabled = true;

  unitButton.onInputDown.add(function() {
    props.buttonClickHandler();
    this.isButtonSelected = true;
    unitButtonEffect.alpha = 1;
  }, this);

  this.unitButton = unitButton;
  this.unitButtonEffect = unitButtonEffect;
  unit = this.game.add.sprite(0, 0, this.unit_image);
  unit.alpha = 0;
  this.unit = unit;
}

Unit.prototype = {
  update: function() {
  },
  deployUnit: function(x, y, unitIndex) {
    if(!this.deployed) {
      this.unit.reset(x + 37, y);
      this.unit.anchor.set(0.5, 0.5);
      this.unit.scale.set(0.9, 0.9);
      this.unit.alpha = 1;
      this.deployed = true;
      this.unitButton.alpha = 0;
      this.unitButtonEffect.alpha = 0;
      this.isButtonSelected = false;
      return true;
    }
    return false;
  },
  getUnitButton: function() {
    return this.unitButton;
  },
  deselectUnitButton: function() {
    this.isButtonSelected = false;
    this.unitButtonEffect.alpha = 0;
  },
  moveButtonPosition: function(x, y) {
    this.unitButton.reset(x, y);
    this.unitButtonEffect.reset(x - 8, y - 8);
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
