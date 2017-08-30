function SkelUnit(props) {
  CommonUnit.call(this, props);
  this.areaMap = {
    0: [0,1,3],
    1: [1,0,2,4],
    2: [2,1,5],
    3: [3,0,6,4],
    4: [4,3,1,7,5],
    5: [5,4,2,8],
    6: [6,3,7],
    7: [7,6,4,8],
    8: [8,5,7]
  };
};

SkelUnit.prototype = {
  getTarget: function(enemyInfoList, index) {
    var targets = [];
    var panelPosition = enemyInfoList[index].panelPositionIndex;
    var targetIndex = this.areaMap[panelPosition];
    var enemyPanelPostions = this.game.data.my_unit_position;

    for(var i = 0 ; i < targetIndex.length ; i++) {
      var target = enemyPanelPostions[targetIndex[i]]
      if(target && target.alive) {
        targets.push(target);
      }
    }
    return targets;
  },
  getTargetPanel: function(index) {
    return this.areaMap[index];
  },
  hitTarget: function(targets) {
    var me = this;
    me.unit.animations.getAnimation('attack').onComplete.add(function(sprite, attackAni){
      var firstTarget = targets[0];
      me.completeAction();
      me.takeDamage(500);
      me.game.func.playBoomEffect(firstTarget.unit.x - 370 , firstTarget.unit.y - 280);
      for(var i = 0 ; i < targets.length ; i++) {
        var target = targets[i];
        target.unit.animations.play('attacked');
        target.takeDamage(this.power);
        this._hitEffect(target);
      }
      attackAni.onComplete.removeAll();
    }, this);
  }
};

SkelUnit.prototype.constructor = SkelUnit;
for(var key in CommonUnit.prototype) {
  if(!SkelUnit.prototype.hasOwnProperty(key) && CommonUnit.prototype.hasOwnProperty(key)) {
    SkelUnit.prototype[key] = CommonUnit.prototype[key];
  }
}
