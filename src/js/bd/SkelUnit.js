'use strict'
import CommonUnit from './CommonUnit';

class SkelUnit extends CommonUnit {
  constructor(props) {
    super(props);
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
    }
  }

  getTarget(enemyInfoList, index) {
    let targets = [];
    let panelPosition = enemyInfoList[index].panel_index;
    let targetIndex = this.areaMap[panelPosition];
    let enemyPanelPostions = this.game.data.my_unit_position;
    for(let i = 0 ; i < targetIndex.length ; i++) {
      let target = enemyPanelPostions[targetIndex[i]]
      if(target && target.isAlive()) {
        targets.push(target);
      }
    }
    // 본인도 공격대상이다.
    targets.push(this);
    return targets;
  }

  getTargetPanel(index) {
    return this.areaMap[index];
  }

  hitTarget(targets) {
    let firstTarget = targets[0];
    this.unit_body.setData('power', this.power);
    this.unit_body.setData('targets', targets);
    this.unit_body.playAnimation('attack');
  }
}

export default SkelUnit;
