class SoundButton extends FsnButton {
  constructor(props) {
    let game = props.game;
    let soundButtonImage = 'sound-button-enable';
    if(game.sound.mute) {
      soundButtonImage = 'sound-button-disable';
    }
    let selfProps = {
      game: game,
      x: props.x,
      y: props.y,
      image_key: soundButtonImage,
      id: 'sound_button',
      visible: false
    }
    super(selfProps);
  }

  onDown(button) {
    let game = this.game;
    if(game.sound.mute) {
      game.sound.mute = false;
      this.changeImage('sound-button-enable');
    } else {
      game.sound.mute = true;
      this.changeImage('sound-button-disable');
    }
  }
}
