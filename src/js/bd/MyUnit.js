'use strict'
import CommonUnit from './CommonUnit';
import BdButton from './BdButton';
import BdSprite from './BdSprite';

class MyUnit extends CommonUnit {
  constructor(props) {
    super(props);
    // orverride
    this._FLAG_X = 40;
    this._MOVE_PATH_01_X = -85
    this._MOVE_PATH_01_Y = 0

    this.deployed = false;
    this.unit_button = new BdButton({game: this.game, x:100, y: 789, image_key: this.unitData.icon_image, visible: false, id: 'my_unit_button_' + this.id});
    this.unit_button.setData('is_selected', false);
    this.unit_button_effect = new BdSprite({game: this.game, x:44, y: 789, image_key: 'icon_selected', visible: false});
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
      this.unit_button.changeDisplayState(false);
      this.unit_button_effect.changeDisplayState(false);
      this.unit_button.setData('is_selected', false);
      return true;
    }
    return false;
  }

  getUnitButton() {
    return this.unit_button;
  }

  showUnitButton() {
    this.unit_button.changeDisplayState(true);
  }

  isButtonSelected() {
    return this.unit_button.getData('is_selected');
  }

  hideUnitButton() {
    this.unit_button.changeDisplayState(false);
    this.unit_button_effect.changeDisplayState(false);
  }

  deselectUnitButton() {
    this.unit_button.setData('is_selected', false);
    this.unit_button_effect.changeDisplayState(false);
  }

  selectUnitButton() {
    this.unit_button_effect.changeDisplayState(true);
  }

  moveButtonPosition(x, y) {
    this.unit_button.setPosition(x, y);
    this.unit_button_effect.setPosition(x - 65, y - 65);
    // this.unit_button.changeDisplayState(false);
    this.unit_button_effect.changeDisplayState(false);
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
