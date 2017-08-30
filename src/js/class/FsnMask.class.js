class FsnMask extends FsnBase {
  constructor(props) {
    super(props);

    this.body = this.game.add.graphics(0, 0);
    this.body.beginFill(props.color);
    this.body.drawRect(props.x, props.y, 820, 1350);
    this.body.alpha = props.default_alpha;

    if(props.event_enable) {
      this.body.events.onInputDown.add(this.onDown, this);
    }
  }

  fadeIn(alpha, duration, delay) {
    this.game.add.tween(this.body).to({alpha: alpha}, duration, Phaser.Easing.Linear.None, true, delay, 0, true);
  }

  fadeOut(duration, delay) {
    this.game.add.tween(this.body).to({alpha: 0}, duration, Phaser.Easing.Linear.None, true, delay, 0, true);
  }

  onDown(button) {
    console.info("Please redefine FsnMask.onDown");
  }
}
