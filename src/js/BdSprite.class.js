class BdSprite extends FsnSprite {
  constructor(props) {
    super(props);
  }

  startTween(tweenConfig, duration, delay, repeat) {
    let game = this.game;
    let tween = null;
    switch(this.o_id) {
      case "small_tip":
        tween = game.add.tween(this.body).to(tweenConfig, duration, Phaser.Easing.Linear.None, true, delay, repeat, true);
        tween.interpolation(function(v, k){
          return Phaser.Math.bezierInterpolation(v, k);
        });
        break;
      case "display_round":
        tween = game.add.tween(this.body).to(tweenConfig, duration, Phaser.Easing.Linear.None, true, delay, repeat, true);
        tween.onComplete.add(function() {
          let tempMask = game.member.get('temp_mask');
          tempMask.destroy();
        })
        break;
      default:
        game.add.tween(this.body).to(tweenConfig, duration, Phaser.Easing.Linear.None, true, delay, repeat, true);
        break;
    }
  }

  onAniComplete(sprite, animation) {
    let game = this.game;
    switch(this.o_id) {
      case "ko_sprite_1":
        sprite.visible = false;
        animation.stop();
        break;
      case "ko_sprite_2":
        sprite.visible = false;
        animation.stop();
        break;
      case "ko_sprite_3":
        sprite.visible = false;
        animation.stop();
        break;
      case "boom_effect":
        sprite.visible = false;
        animation.stop();
      case "start_effect":
        sprite.visible = false;
        animation.stop();
      default:
        break;
    }
  }

  onDown(sprite) {
    let game = this.game;
    let gameMode = game.data.game_mode;
    let spriteData = this.data;
    if(this.o_id.indexOf('panel_selected') > -1) {
      if(gameMode === 'DEPLOY') {
        if(spriteData['unit']) {
          return;
        }
        let unit = game.func.deployUnit(this.body.x, this.body.y, spriteData['index']);
        spriteData['unit'] = unit;
      }
    }
  }

  onOver(sprite) {
    let game = this.game;
    if(this.o_id.indexOf('panel_selected') > -1) {
      let myUnits = game.data.my_units;
      let gameMode = game.data.game_mode;
      for(var i = 0 ; i < myUnits.length ; i++) {
        if(myUnits[i].isButtonSelected) {
          if(gameMode === 'DEPLOY') {
            sprite.alpha = 1;
            break;
          }
        }
      }
    }
  }

  onOut(sprite) {
    let game = this.game;
    if(this.o_id.indexOf('panel_selected') > -1) {
      let gameMode = game.data.game_mode;
      if(gameMode === 'DEPLOY') {
        if(!this.data['unit']) {
          sprite.alpha = 0;
        }
      }
    }
  }
}
