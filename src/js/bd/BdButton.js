'use strict'
import {FsnButton, Utils} from '../fsnbase';

class BdButton extends FsnButton {
  constructor(props) {
    super(props);
  }

  onDown(button) {
    let game = this.game;
    let oId = this.o_id;
    if(oId.indexOf('my_unit_button') > -1) {
      oId = 'my_unit_button';
    }
    switch(oId) {
      case "deploy_mode_button":
        game.add.tween(button.scale).to({x: 1.03, y: 1.03}, 100, Phaser.Easing.Linear.None, true, 0, 0, true);

        if(game.data.game_mode !== 'DEPLOY') {
          game.func.changeGameMode('DEPLOY');
        } else {
          game.func.changeGameMode('NORMAL');
        }
        if(game.data.tutorial_step === 1) {
          game.func.setTutorialStep2();
        }
        break;

      case "battle_start_button":
        game.add.tween(button.scale).to({x: 1.03, y: 1.03}, 100, Phaser.Easing.Linear.None, true, 0, 0, true);
        game.func.initForBattle();
        game.func.endTutorial();
        break;

      case "tutorial_button":
        game.func.plyaTutorial();
        break;

      case "popup_close":
        this.destroy();
        game.func.closeTutorial();
        Utils.removeEvent(game, 'tutorial_event');
        break;

      case "my_unit_button":
        game.func.initUnitButton();
        this.setData('is_selected', true);
        game.func.selectUnitButton();

        if(game.data.tutorial_step === 2) {
          game.func.setTutorialStep3();
        }
        if(game.data.tutorial_step === 4) {
          game.func.setTutorialStep5();
        }
        if(game.data.tutorial_step === 6) {
          game.func.setTutorialStep7();
        }
        break;

      case "continue_btn":
        alert('스토어로 이동합니다.');
      break;

      case "replay_btn":
        game.world.removeAll();
        game.func.resetData();
        game.state.restart();
      break;
    }
  }
}
export default BdButton;
