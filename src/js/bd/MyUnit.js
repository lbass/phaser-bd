'use strict'
import CommonUnit from './CommonUnit';

class MyUnit extends CommonUnit {
  constructor(props) {
    super(props);
    // orverride
    this._FLAG_X = 40;
    this._MOVE_PATH_01_X = -85
    this._MOVE_PATH_01_Y = 0

    this.deployed = false;
    this.isButtonSelected = false;
    let unitButton = this.game.add.button(44, 798, this.unitData.icon_image, null, this);
    let unitButtonEffect = this.game.add.sprite(36, 790, 'icon_selected');
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

    this.unit_body.changeDisplayState(false);
  }

  deployUnit(x, y, panelIndex, unitOrder) {
    if(!this.deployed) {
      this.unit_body.setPosition(x - 60, y - 110);
      this.unit_body.changeDisplayState(true);
      this.updateFlag(unitOrder);
      this.unit_flag.changeDisplayState(true);
      this.panel_index = panelIndex;

      this.unit_body.playAnimation('selected', 15);
      let playCount = 0;
      this.deployed = true;
      this.unitButton.visible = false;
      this.unitButtonEffect.visible = false;
      this.isButtonSelected = false;
      return true;
    }
    return false;
  }

  getUnitButton() {
    return this.unitButton;
  }

  showUnitButton() {
    this.unitButton.visible = true;
  }

  hideUnitButton() {
    this.unitButton.visible = false;
    this.unitButtonEffect.visible = false;
  }

  deselectUnitButton() {
    this.isButtonSelected = false;
    this.unitButtonEffect.visible = false;
  }

  moveButtonPosition(x, y) {
    this.unitButton.reset(x, y);
    this.unitButtonEffect.reset(x - 8, y - 8);
    this.unitButtonEffect.visible = false;
  }

  updateHp() {
    let count = 0;
    let position = this.unit_body.getPosition();
    for(let key in this.unit_hp_grp) {
      let x = position.x + 70;
      this.unit_hp_grp[key].setPosition(x - (this.HP_DISTANCE * count), position.y + 20);
      this.unit_hp_grp[key].changeDisplayState(true);
      count++
    }
    this.unit_hp_bar.changeDisplayState(true);
    this.unit_hp_bar.setPosition(position.x + 34, position.y);
  }

  viewGreenFoothold() {
  }
  viewReadyEffect() {
  }

  readyAttacking(duration) {
    let position = this.unit_body.getPosition()
    this.game.func.showAttackReadyPannel(position.x + 60, position.y + 109, duration)
  }
}

export default MyUnit;
