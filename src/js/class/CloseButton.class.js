class CloseButton extends FsnButton {
  constructor(props) {
    let selfProps = {
      game: props.game,
      x: props.x,
      y: props.y,
      image_key: 'close-button',
      id: 'close_button',
      visible: false
    }
    super(selfProps);

    this.game.time.events.add(Phaser.Timer.SECOND * 5, function() {
      this.body.visible = true;
    }, this);
  }

  onDown(button) {
    let game = this.game;
    if(confirm('게임을 종료하고 창을 닫습니다.\n계속하시겠습니까?')) {
      window.close();
    }
  }
}
