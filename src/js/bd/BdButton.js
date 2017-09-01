'use strict'
import {FsnButton} from '../fsnbase';

class BdButton extends FsnButton {
  constructor(props) {
    super(props);
  }

  onDown(button) {
    let game = this.game;
    switch(this.o_id) {
      case "deploy_mode_button":
        game.add.tween(button.scale).to({x: 1.03, y: 1.03}, 100, Phaser.Easing.Linear.None, true, 0, 0, true);
        if(game.data.game_mode === 'NORMAL') {
          game.func.changeGameMode('DEPLOY');
        } else {
          game.func.changeGameMode('NORMAL');
        }
        break;

      case "battle_start_button":
        game.add.tween(button.scale).to({x: 1.03, y: 1.03}, 100, Phaser.Easing.Linear.None, true, 0, 0, true);
        game.func.initForBattle();
        break;

      case "tutorial_button":
        game.func.plyaTutorial();
        break;

      case "popup_close":
        this.destroy();
        game.func.closeTutorial();
        let tutorialEvent = game.member.get('tutorial_event');
        game.time.events.remove(tutorialEvent);
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
