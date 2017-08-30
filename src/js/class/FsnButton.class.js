class FsnButton {
  constructor(props) {
    this.o_id = props.id;
    this.game = props.game;
    this.body = GAME.add.button(props.x, props.y, props.image_key, null, this);
    this.body.anchor.set(0.5, 0.5);
    this.body.inputEnabled = true;
    this.body.events.onInputDown.add(this.onDown, this);
  }

  onDown(button) {
    console.info("Please redefine onDown");
  }

  changeImage(imageKey) {
    this.body.loadTexture(imageKey, 0)
  }

  destroy() {
    this.game.member.remove(this.o_id);
    this.body.destroy();
  }
}
