var HP_DISTANCE = 15;

function CommonUnit(props) {
  this._FLAG_X = 40;
  this._FLAG_Y = -70;
  this._MOVE_PATH_01_X = 85
  this._MOVE_PATH_01_Y = 0

  this.game = props.game;
  this.unitData = props.unitData;
  this.unit_image = this.unitData.unit_image;
  this.unitIndex = 0;

  var x, y = 0;
  if(props.position) {
    x = props.position.x + 55;
    y = props.position.y;
  }
  var unit = this.game.add.sprite(x, y, this.unit_image);
  this.power = this.unitData.power;
  this.health = this.unitData.hp;
  this.alive = true;

  unit.scale.set(0.9, 0.9);
  unit.anchor.set(0.5, 0.5);
  this.game.physics.arcade.enable(unit);

  var animations = this.unitData.animations;
  if(animations) {
    unit.animations.add('normal', animations['normal'], animations['normal'].length, true);
    unit.animations.add('attack', animations['attack'], animations['attack'].length, false);
    unit.animations.add('attacked', animations['attacked'], animations['attacked'].length, false);
    unit.animations.add('selected', animations['selected'], animations['selected'].length, true);
    unit.animations.currentAnim.speed = 20;
    unit.animations.play('normal');
  }

  this.unit = unit;

  this.flag = this.game.add.sprite(0, 0, 'flag_1');
  this.flag.anchor.set(0.5, 0.5);

  this.isEndAttack = false;
  this.isEndTargetAni = false;
  this.isActionable = true;
  this.isInAction = false;
  this.isEndTurn = false;

  this.panelPositionIndex = -1;

  this.hpGrp = this.game.add.group();
  var strHealth = this.health.toString();
  if(this.unitData.type === 'enemy') {
    this.hpbarImagePrefix = 'enemyhpbar_';
  } else {
    this.hpbarImagePrefix = 'hpbar_';
  }

  var hpbar = (strHealth / 25) * 25;
  var hpbarSprite = this.game.add.sprite(this.unit.x + 10, (this.unit.y - 75), this.hpbarImagePrefix + hpbar);
  this.hpGrp.add(hpbarSprite);
  for(var i = 0 ; i < strHealth.length ; i++) {
    var cha = strHealth.charAt(i);
    var hpSprite = this.game.add.sprite((this.unit.x + 15) + (HP_DISTANCE * i), (this.unit.y - 58), 'health_' + cha);
    this.hpGrp.add(hpSprite);
  }
  this.hpGrp.visible = false;
};

CommonUnit.prototype = {
  update: function() {
    if(this.isActionable && !this.isInAction) {
      this.startAction();
      this.isInAction = true;
    }
    if(this.isActionable && this.isInAction) {
      if(this.isEndAttack && this.isEndTargetAni) {
        this.beforeEndTurn();
        this.isEndTurn = true;
      }
    }
  },
  initActionState: function() {
    this.isEndAttack = false;
    this.isEndTargetAni = false;
    this.isActionable = true;
    this.isInAction = false;
    this.isEndTurn = false;
  },
  updateFlag: function(unitIndex) {
    if(this.unit) {
      this.unitIndex = unitIndex;
      this.flag.loadTexture('flag_' + unitIndex);
      this.flag.x = this.unit.x + this._FLAG_X;
      this.flag.y = this.unit.y + this._FLAG_Y;
    }
  },
  updateZindex: function() {
    this.game.world.bringToTop(this.unit);
    this.game.world.bringToTop(this.flag);
    this.game.world.bringToTop(this.hpGrp);
  },
  startAction: function() {
    var me = this;
    var enemyInfoList = fsn.util.getAliveEnemies(this.unitData.type);
    if(enemyInfoList.length <= 0) {
      this.isEndAttack = true;
      this.completeAction();
      return;
    }
    me.unit.animations.stop();
    var index = Math.floor(Math.random() * enemyInfoList.length);
    var targets = this.getTarget(enemyInfoList, index);
    var target = targets[0]

    var targetPanel = this.getTargetPanel(target.panelPositionIndex);
    var targetX = target.unit.x;
    var targetY = target.unit.y;
    var movePath = [
      {x: targetX + this._MOVE_PATH_01_X, y: targetY + this._MOVE_PATH_01_Y, duration: 100},
      {x: me.unit.x , y: this.unit.y, duration: 100}
    ];

    var readDuration = 100;
    me.readyAttacking(readDuration);
    me.game.time.events.add(readDuration, function() {
      fsn.util.showFadeOutMask(500);
      fsn.util.playBattleStartEffect(me.unit.x - 360, me.unit.y - 300);
    }, me);

    var attackDelay = 700;
    me.game.time.events.add(attackDelay, function() {
      if(me.unitData.type === 'my') {
        fsn.util.showBattleUnitPanel(me.panelPositionIndex, targetPanel);
      } else {
        fsn.util.showBattleUnitPanel(targetPanel, me.panelPositionIndex);
      }
    }, me);

    me.game.time.events.add(attackDelay, function() {
      me.viewSkillName();
    }, me);

    me.game.time.events.add(attackDelay + 200, function() {
      me.beforeAttacking();
      me.startAttacking(movePath, targets);
    }, me);
  },
  getTarget: function(enemyInfoList, index) {
    var result = [enemyInfoList[index]];
    return result;
  },
  getTargetPanel(panelPosition) {
    return panelPosition;
  },
  startAttacking:function(movePath, targets) {
    var me = this;
    me.unit.alpha = 0.3;
    me.hpGrp.visible = false;
    me.unit.animations.play('attack');
    me.unit.animations.currentAnim.speed = 21;

    var handler = function(sprite, ani) {
      me.game.add.tween(this.unit).to({x: movePath[1].x, y: movePath[1].y},  movePath[1].duration, Phaser.Easing.Linear.None, true, 0, 0, false);
      me.game.time.events.add(movePath[1].duration + 50, function() {
        me.unit.animations.play('normal');
        me.unit.alpha = 1;
        me.hpGrp.visible = true;
        me.isEndAttack = true;
      }, me);
      ani.onComplete.remove(handler);
    }
    me.unit.animations.getAnimation('attack').onComplete.add(handler, this);

    me.game.add.tween(this.unit).to({x: movePath[0].x, y: movePath[0].y},  movePath[0].duration, Phaser.Easing.Linear.None, true, 0, 0, false);
    me.game.time.events.add(movePath[0].duration + 50, function() {
      me.unit.alpha = 1;
      me.hitTarget(targets);
    }, this);
  },
  hitTarget: function(targets) {
    var target = targets[0];
    target.unit.animations.getAnimation('attacked').onComplete.add(function(sprite, ani){
      this.completeAction();
      ani.onComplete.removeAll();
    }, this);
    target.unit.animations.play('attacked');

    var isKill = target.takeDamage(this.power);
    if(isKill) {
      // kill일 경우 attacked의 onComplete 핸들러가 작동하지 않는다.
      this.completeAction();
      target.unit.animations.getAnimation('attacked').onComplete.removeAll();
    }
    this._hitEffect(target);
  },
  _hitEffect: function(targetOrTargets) {
    var duration = 30;
    var ease = Phaser.Easing.Bounce.InOut;
    var autoStart = true;
    var delay = 0;
    var yoyo = true;
    var repeat = 3;
    fsn.util.showRedMask();
    var tween = this.game.add.tween(this.game.camera).to({x: this.game.camera.x - 5}, duration, ease, autoStart, delay, repeat, yoyo);
    tween.onComplete.add(function() {
      fsn.util.hideRedMask();
    });
  },
  completeAction: function() {
    this.isEndTargetAni = true;
    fsn.util.hideBattleUnitPanel();
    fsn.util.hideSkill();
  },
  readyAttacking: function(duration) {
  },
  beforeAttacking: function() {
  },
  beforeEndTurn: function() {
  },
  updateHpBar: function() {
    var count = 0;
    var me = this;
    var hpbarPositionX = 10;
    var hpbarPositionY = -78;
    var hpPositionX = 15;
    var hpPositionY = -61;
    this.hpGrp.forEach(function(hpSprite) {
      switch(count) {
        case 0:
          hpSprite.x = me.unit.x + hpbarPositionX;
          hpSprite.y = me.unit.y + hpbarPositionY;
        break;
        case 1:
          hpSprite.x = me.unit.x + hpPositionX;
          hpSprite.y = me.unit.y + hpPositionY;
        break;
        case 2:
          hpSprite.x = me.unit.x + hpPositionX + (HP_DISTANCE * (count - 1));
          hpSprite.y = me.unit.y + hpPositionY;
        break;
        case 3:
          hpSprite.x = me.unit.x + hpPositionX + (HP_DISTANCE * (count - 1));
          hpSprite.y = me.unit.y + hpPositionY;
        break;
        default:
        break;
      }
      count++;
    });
  },
  viewSkillName: function() {
    fsn.util.showSkill(this.unitData.skill);
  },
  takeDamage: function(power) {
    this.health = this.health - power;
    var damageGrp = this.game.add.group();
    var distance = 30;
    damageGrp.add(this.game.add.sprite(this.unit.x - 30, this.unit.y, 'damage_minus'));
    var strPower = power.toString();
    for(var i = 0 ; i < strPower.length ; i++) {
      var cha = strPower.charAt(i);
      var damageSprite = this.game.add.sprite(this.unit.x + (distance * i), this.unit.y, 'damage_' + cha);
      damageGrp.add(damageSprite);
    }
    this.game.time.events.add(700, function() {
      damageGrp.destroy();
    }, this);

    if(this.health <= 0) {
      this.deadUnit();
      return true;
    }
    var strHealth = this.health.toString();
    var hpbar = Math.floor(this.health / 25) * 25;
    var hpbarSpriteName = this.hpbarImagePrefix + hpbar;

    var positionalNum1 = strHealth.charAt(strHealth.length - 1);
    var positionalNum10 = strHealth.charAt(strHealth.length - 2);
    var positionalNum100 = strHealth.charAt(strHealth.length - 3);
    var count = 0;
    this.hpGrp.forEach(function(hpSprite) {
      switch(count) {
        case 0:
        hpSprite.loadTexture(hpbarSpriteName, 0);
        break;
        case 1:
        positionalNum100 = positionalNum100 ? positionalNum100 : '0';
        hpSprite.loadTexture('health_' + positionalNum100, 0);
        break;
        case 2:
        positionalNum10 = positionalNum10 ? positionalNum10 : '0';
        hpSprite.loadTexture('health_' + positionalNum10, 0);
        break;
        case 3:
        positionalNum1 = positionalNum1 ? positionalNum1 : '0';
        hpSprite.loadTexture('health_' + positionalNum1, 0);
        break;
        default:
        break;
      }
      count++;
    });
    return false;

  },
  deadUnit: function() {
    if(this.unitData.type === 'my') {
      fsn.util.playKoAnimation(this.unit.x - 120, this.unit.y- 280);
      this.unit.loadTexture('unit_dead_left', 0);
    } else {
      fsn.util.playKoAnimation(this.unit.x - 120, this.unit.y - 280);
      this.unit.loadTexture('unit_dead', 0);
    }
    this.alive = false;
    this.hpGrp.destroy(true);
  }
};
