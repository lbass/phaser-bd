'use strict'
import {FsnSprite} from '../fsnbase';

class BdSprite extends FsnSprite {
  constructor(props) {
    super(props);
  }

  startTween(tweenConfig, duration, delay, repeat, yoyo) {
    if(yoyo === undefined) {
      yoyo = true;
    }
    let game = this.game;
    let tween = null;
    switch(this.o_id) {
      case "small_tip":
        tween = game.add.tween(this.body).to(tweenConfig, duration, Phaser.Easing.Linear.None, true, delay, repeat, yoyo);
        tween.interpolation(function(v, k){
          return Phaser.Math.bezierInterpolation(v, k);
        });
        break;
      case "display_round":
        tween = game.add.tween(this.body).to(tweenConfig, duration, Phaser.Easing.Linear.None, true, delay, repeat, yoyo);
        tween.onComplete.add(function() {
          let tempMask = game.member.get('temp_mask');
          tempMask.destroy();
        })
        break;
      default:
        game.add.tween(this.body).to(tweenConfig, duration, Phaser.Easing.Linear.None, true, delay, repeat, yoyo);
        break;
    }
  }

  onAniComplete(sprite, animation) {
    let game = this.game;
    let oId = this.o_id;
    if(this.o_id.indexOf('unit_body') > -1) {
      oId = 'unit_body';
    }
    switch(oId) {
      case "ko_sprite_1":
        this.changeDisplayState(false);
        animation.stop();
        break;
      case "ko_sprite_2":
        this.changeDisplayState(false);
        animation.stop();
        break;
      case "ko_sprite_3":
        this.changeDisplayState(false);
        animation.stop();
        break;
      case "boom_effect":
        this.changeDisplayState(false);
        animation.stop();
        break;
      case "start_effect":
        this.changeDisplayState(false);
        animation.stop();
        break;
      case "unit_body":
        let unitName = this.getData('unit_name');
        if(animation.name === 'attack') {
          if(unitName !== 'skel') {
            let selfPosition = this.getData('self_position');
            game.add.tween(this.body).to({x: selfPosition.x, y: selfPosition.y},  selfPosition.duration, Phaser.Easing.Linear.None, true, 0, 0, false);
            game.time.events.add(selfPosition.duration + 50, function() {
              this.changeDisplayState(true);
              this.setAlpha(1);
              this.playAnimation('normal', 15);
              this.setData('is_end_attack', true);
              this.game.func.hideBattleUnitPanel();
              this.game.func.hideSkill();
            }, this);
            animation.onComplete.removeAll();
          } else {
            let targets = this.getData('targets');
            let power = this.getData('power');
            let selfPosition = this.getData('self_position');
            let firstTarget = targets[0];
            let effectPosition = firstTarget.getPosition();
            game.func.playBoomEffect(effectPosition.x - 230 , effectPosition.y - 180);
            game.func.hitEffect(firstTarget);
            for(let i = 0 ; i < targets.length ; i++) {
              let target = targets[i];
              target.attacked(power);
            }
            this.setPosition(selfPosition.x, selfPosition.y);
            this.setData('is_end_attack', true);
            this.game.func.hideBattleUnitPanel();
            this.game.func.hideSkill();
          }
        }
        break;
      default:
        break;
    }
  }

  onAniLoop(sprite, animation) {
    let game = this.game;
    let oId = this.o_id;
    if(this.o_id.indexOf('my_unit_body') > -1) {
      oId = 'my_unit_body';
    } else if(this.o_id.indexOf('enemy_unit_body') > -1) {
      oId = 'enemy_unit_body';
    }
    switch(oId) {
      case "my_unit_body":
        if(animation.name === 'selected') {
          if(animation.loopCount >= 2) {
            animation.stop();
            this.playAnimation('normal', 15);
          }
        }
        break;
      default:
        break;
    }
  }

  onDown(sprite) {
    let game = this.game;
    let gameMode = game.data.game_mode;
    let oId = this.o_id;
    if(this.o_id.indexOf('panel_selected') > -1) {
      oId = 'panel_selected';
    }
    switch(oId) {
      case "panel_selected":
        if(gameMode === 'DEPLOY') {
          if(this.getData('unit')) {
            return;
          }
          let unit = game.func.deployUnit(this.body.x, this.body.y, this.getData('index'));
          this.setData('unit', unit);
          game.func.sortUnit();
          game.func.sortUnitButton();
        }
        break;
      case "start_tutorial":
        game.func.changeGameMode('NORMAL');
        this.destroy();
        let startTutorialEvent = game.member.get('start_tutorial_event');
        game.time.events.remove(startTutorialEvent);
        break;
    }
  }

  onOver(sprite) {
    let game = this.game;
    let oId = this.o_id;
    if(this.o_id.indexOf('panel_selected') > -1) {
      oId = 'panel_selected';
    }
    switch(oId) {
      case "panel_selected":
        let myUnits = game.data.my_units;
        let gameMode = game.data.game_mode;
        for(let i = 0 ; i < myUnits.length ; i++) {
          if(myUnits[i].isButtonSelected) {
            if(gameMode === 'DEPLOY') {
              sprite.alpha = 1;
              break;
            }
          }
        }
        break;
    }
  }

  onOut(sprite) {
    let game = this.game;
    let oId = this.o_id;
    if(this.o_id.indexOf('panel_selected') > -1) {
      oId = 'panel_selected';
    }
    switch(oId) {
      case "panel_selected":
        let gameMode = game.data.game_mode;
        if(gameMode === 'DEPLOY') {
          if(!this.getData('unit')) {
            sprite.alpha = 0;
          }
        }
        break;
    }
  }
}

export default BdSprite;
