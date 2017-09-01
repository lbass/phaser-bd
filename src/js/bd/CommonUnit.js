'use strict';
import BdSprite from './BdSprite'

class CommonUnit {
  constructor(props) {
    this._FLAG_X = 88;
    this._FLAG_Y = -20;
    this._MOVE_PATH_01_X = 85;
    this._MOVE_PATH_01_Y = 0;
    this.HP_DISTANCE = 15;
    this.game = props.game;
    this.unitData = props.unitData;
    this.unit_image = this.unitData.unit_image;
    this.unitIndex = 0;
    this.o_id = this.unitData.type + '_unit_' + props.id;

    let x, y = 0;
    if(props.position) {
      x = props.position.x - 45;
      y = props.position.y - 105;
    }
    let animations = this.unitData.animations
    let unitProps = {
      game: this.game,
      x: x,
      y: y,
      image_key: this.unit_image,
      id: this.unitData.type + '_unit_body_' + props.id,
      animations: {
        'normal' : { data: animations['normal'], is_loop: true },
        'attack' : { data: animations['attack'], is_loop: false },
        'attacked' : { data: animations['attacked'], is_loop: false },
        'selected' : { data: animations['selected'], is_loop: true }
      }
    };
    this.power = this.unitData.power;
    this.health = this.unitData.hp;
    this.alive = true;

    // unit.scale.set(0.9, 0.9);
    // unit.anchor.set(0.5, 0.5);

    this.unit_body = new BdSprite(unitProps);
    this.unit_body.setData('is_end_attack', false);
    this.unit_body.setData('unit_name', this.unitData.name);

    this.unit_flag = new BdSprite({ game: this.game, x: x + 150, y:  y, image_key: 'flag_1', id: this.unitData.type + '_unit_flag_' + props.id, visible: false });


    this.isEndAttack = false;
    this.isEndTargetAni = false;
    this.isActionable = true;
    this.isInAction = false;
    this.isEndTurn = false;

    this.panel_index = -1;

    this.unit_hp_grp = { 100: null, 10: null, 1: null };
    let strHealth = this.health.toString();
    //  unitData.type : my / enemy
    this.hpbar_image_prefix = this.unitData.type + '_unit_hpbar_';
    let hpbarSuffix = (strHealth / 25) * 25;

    let unitBodyPostion = this.unit_body.getPosition();
    this.unit_hp_bar = new BdSprite({
      game: this.game,
      x: 0,
      y: 0,
      image_key: this.hpbar_image_prefix + hpbarSuffix,
      id: this.unitData.type + '_unit_hpbar_'  + props.id,
      visible: false
    });

    for(let i = 0, digit = 100 ; i < strHealth.length ; i++, digit = digit / 10) {
      let spriteId = this.unitData.type + '_unit_hpnum_' + digit + '_' + props.id;
      let cha = strHealth.charAt(i);
      let hpSprite = new BdSprite({
        game: this.game,
        x: (x + 15) + (this.HP_DISTANCE * i),
        y: (y - 58),
        image_key: 'health_' + cha,
        id: spriteId,
        visible: false
      });
      this.unit_hp_grp[digit] = hpSprite;
    }
  }

  isAlive() {
    return this.alive;
  }

  isEndAction() {
    return this.unit_body.getData('is_end_attack');
  }

  getPanelIndex() {
    return this.panel_index;
  }

  playAnimation(name, frameRate) {
    this.unit_body.playAnimation(name, frameRate);
  }

  update() {
    if(!this.is_inaction) {
      this.startAction();
      this.is_inaction = true;
    }
  }

  readyToBattle() {
    this.isEndTurn = false;
    this.is_inaction = false;
    this.unit_flag.changeDisplayState(false);
    this.updateHp();
  }

  initEnemyUnit(count, panelIndex) {
    this.unit_body.playAnimation('normal', 15);
    this.unit_flag.changeDisplayState(true);
    this.updateFlag(count);
    this.panel_index = panelIndex;
  }

  getPosition() {
    return this.unit_body.getPosition();
  }

  updateFlag(unitIndex) {
    this.unitIndex = unitIndex;
    this.unit_flag.changeImage('flag_' + unitIndex);
    let position = this.unit_body.getPosition();
    this.unit_flag.setPosition(position.x + this._FLAG_X, position.y + this._FLAG_Y);
  }

  updateZindex() {
    this.unit_body.bringToTop();
    this.unit_flag.bringToTop();
    this.unit_hp_bar.bringToTop();
    for(let key in this.unit_hp_grp) {
      this.unit_hp_grp[key].bringToTop();
    }
  }

  startAction() {
    let enemyInfoList = this.game.func.getAliveEnemies(this.unitData.type);
    if(enemyInfoList.length <= 0) {
      this.unit_body.setData('is_end_attack', true);
      return;
    }

    let thisUnit = this.unit_body;
    let thisUnitPosition = thisUnit.getPosition();

    let mainTargetIndex = Math.floor(Math.random() * enemyInfoList.length);
    let targetUnitList = this.getTarget(enemyInfoList, mainTargetIndex);
    let mainTargetUnit = targetUnitList[0]

    let targetPanel = this.getTargetPanel(mainTargetUnit.getPanelIndex());
    let mainTargetUnitPosition = mainTargetUnit.getPosition();
    let movePath = [
      {x: mainTargetUnitPosition.x + this._MOVE_PATH_01_X, y: mainTargetUnitPosition.y + this._MOVE_PATH_01_Y, duration: 100},
      {x: thisUnitPosition.x , y: thisUnitPosition.y, duration: 100}
    ];

    let readDuration = 100;
    this.readyAttacking(readDuration);
    this.game.time.events.add(readDuration, function() {
      this.game.func.showFadeOutMask(500);
      this.game.func.playBattleStartEffect(thisUnitPosition.x - 260, thisUnitPosition.y - 200);
    }, this);

    let attackDelay = 700;
    this.game.time.events.add(attackDelay, function() {
      if(this.unitData.type === 'my') {
        this.game.func.showBattleUnitPanel(this.panel_index, targetPanel);
      } else {
        this.game.func.showBattleUnitPanel(targetPanel, this.panel_index);
      }
    }, this);

    this.game.time.events.add(attackDelay, function() {
      this.game.func.showSkill(this.unitData.skill);
    }, this);

    this.game.time.events.add(attackDelay + 200, function() {
      this.beforeAttacking();
      this.startAttacking(movePath, targetUnitList);
    }, this);
  }

  getTarget(enemyInfoList, index) {
    let result = [enemyInfoList[index]];
    return result;
  }

  getTargetPanel(panelPosition) {
    return panelPosition;
  }

  hideHpGrpDisplayState() {
    this.unit_hp_bar.changeDisplayState(false);
    for(let key in this.unit_hp_grp) {
      this.unit_hp_grp[key].changeDisplayState(false);
    }
  }

  startAttacking(movePath, targets) {
    this.unit_body.setAlpha(0.3);
    this.hideHpGrpDisplayState();
    this.unit_hp_bar.changeDisplayState(false);
    this.unit_body.playAnimation('attack', 21);

    this.unit_body.setData('self_position', {
      x:        movePath[1].x,
      y:        movePath[1].y,
      duration: movePath[1].duration
    });

    this.unit_body.startTween({x: movePath[0].x, y: movePath[0].y}, movePath[0].duration, 0, 0 , false);
    this.game.time.events.add(movePath[0].duration + 50, function() {
      this.unit_body.setAlpha(1);
      this.hitTarget(targets);
    }, this);
  }

  attacked(power) {
    this.unit_body.playAnimation('attacked', 21);
    let unitPosition = this.unit_body.getPosition();
    this.health = this.health - power;

    let damageGrp = [];
    let distance = 30;
    let defaultX = (unitPosition.x + 80);
    damageGrp.push(new BdSprite({ game: this.game, x: defaultX - distance, y: unitPosition.y + 130, image_key: 'damage_minus'}));
    let strPower = power.toString();
    for(let i = 0 ; i < strPower.length ; i++) {
      let cha = strPower.charAt(i);
      damageGrp.push(new BdSprite({ game: this.game, x: defaultX + (distance * i), y: unitPosition.y + 130, image_key: 'damage_' + cha}));
    }

    this.game.time.events.add(700, function() {
      for(let i = 0 ; i < damageGrp.length ; i++) {
        damageGrp[i].destroy();
      }
    }, this);

    if(this.health <= 0) {
      this.deadUnit();
      return;
    }
    let strHealth = this.health.toString();
    let hpbar = Math.floor(this.health / 25) * 25;
    let hpbarSpriteName = this.hpbar_image_prefix + hpbar;

    let positionalNum1 = strHealth.charAt(strHealth.length - 1);
    let positionalNum10 = strHealth.charAt(strHealth.length - 2);
    let positionalNum100 = strHealth.charAt(strHealth.length - 3);
    this.unit_hp_bar.changeImage(hpbarSpriteName);

    for(let key in this.unit_hp_grp) {
      switch(key) {
        case '100':
        positionalNum100 = positionalNum100 ? positionalNum100 : '0';
        this.unit_hp_grp[key].changeImage('health_' + positionalNum100);
        break;
        case '10':
        positionalNum10 = positionalNum10 ? positionalNum10 : '0';
        this.unit_hp_grp[key].changeImage('health_' + positionalNum10);
        break;
        case '1':
        positionalNum1 = positionalNum1 ? positionalNum1 : '0';
        this.unit_hp_grp[key].changeImage('health_' + positionalNum1);
        break;
      }
    }
  }

  hitTarget(targets) {
    let target = targets[0];
    target.attacked(this.power);
    this.game.func.hitEffect(target);
  }

  readyAttacking(duration) {
  }

  beforeAttacking() {
  }

  beforeEndTurn() {
  }

  updateHp() {
    let count = 0;
    let position = this.unit_body.getPosition();
    for(let key in this.unit_hp_grp) {
      let x = position.x + 130;
      this.unit_hp_grp[key].setPosition(x - (this.HP_DISTANCE * count), position.y + 20);
      this.unit_hp_grp[key].changeDisplayState(true);
      count++
    }
    this.unit_hp_bar.changeDisplayState(true);
    this.unit_hp_bar.setPosition(position.x + 94, position.y);
  }

  viewSkillName() {
    fsn.util.showSkill(this.unitData.skill);
  }

  takeDamage(power) {

  }

  deadUnit() {
    let position = this.unit_body.getPosition();
    this.game.func.playKoAnimation(position.x - 10, position.y- 210);
    if(this.unitData.type === 'my') {
      this.unit_body.changeImage('unit_dead_left');
    } else {
      this.unit_body.changeImage('unit_dead');
    }
    this.alive = false;
    this.unit_hp_bar.destroy(true);
    for(let key in this.unit_hp_grp) {
      this.unit_hp_grp[key].destroy(true);
    }
  }
};

export default CommonUnit;
