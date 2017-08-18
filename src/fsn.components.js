fsn = {};
fsn.components = {};

fsn.components.SoundOnOffButton = function(props) {
  var thisGame = props.game;
  var soundButton = thisGame.add.sprite(props.x, props.y, props.imageName);
  soundButton.inputEnabled = true;
  soundButton.events.onInputDown.add(function() {
    if(thisGame.sound.mute) {
      thisGame.sound.mute = false;
      soundButton.loadTexture('sound-button-enable');
    } else {
      thisGame.sound.mute = true;
      soundButton.loadTexture('sound-button-disable');
    }
  }, thisGame);

  return soundButton;
}

fsn.components.GameCloseButton = function(props) {
  var thisGame = props.game;
  var closeButton = thisGame.add.sprite(props.x, props.y, props.imageName);
  closeButton.inputEnabled = true;
  closeButton.events.onInputOver.add(function(){
    this.canvas.style.cursor = "pointer";
  }, thisGame);
  closeButton.events.onInputOut.add(function(){
    this.canvas.style.cursor = "default";
  }, thisGame);

  closeButton.events.onInputDown.add(
    function(){
      if(confirm('게임을 종료하고 창을 닫습니다.\n계속하시겠습니까?')) {
        window.close();
      }
    }, thisGame);

  return closeButton;
}
