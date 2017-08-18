function Enemy(props) {
  this.game = props.game;
  this.enemyData = props.enemyData;
  this.unit_image = this.enemyData.unit_image;
  this.positionIndex = props.positionIndex;

  var enemy = this.game.add.sprite(this.positionIndex.x - 37, this.positionIndex.y, this.unit_image);
  enemy.anchor.set(0.5, 0.5);
  this.enemy = enemy;
}

Enemy.prototype = {
  update: function() {
  }
}
