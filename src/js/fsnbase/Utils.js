class Utils {
  constructor() {
  }

  static shakingShaking(game, duration, repeat, callback) {
    var ease = Phaser.Easing.Bounce.InOut;
    var autoStart = true;
    var delay = 0;
    var yoyo = true;
    var tween = game.add.tween(game.camera).to({x: game.camera.x - 5}, duration, ease, autoStart, delay, repeat, yoyo);
    tween.onComplete.add(function() {
      callback();
    }, this);
  }
}

export default Utils;
/*
fsn.components.zoomTo = function (isMyUnit) {
  var duration = 300;
  //var bounds = Phaser.Rectangle.clone(game.world.bounds);
  var cameraBounds = game.camera.bounds;
  if(isMyUnit) {
    cameraBounds.x = 0;
  } else {
    cameraBounds.x = 180;
  }
  game.camera.scale.x = 1.2;
  game.camera.scale.y = 1.2;
}

fsn.components.zoomOut = function() {
  var duration = 200;
  var cameraBounds = game.camera.bounds;
  cameraBounds.x = -50;
  game.camera.scale.x = 1.0;
  game.camera.scale.y = 1.0;
}
*/
