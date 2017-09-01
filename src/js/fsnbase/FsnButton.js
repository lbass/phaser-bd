'use strict';
import FsnBase from './FsnBase';

class FsnButton extends FsnBase {
  constructor(props) {
    super(props);
    this.body = this.game.add.button(props.x, props.y, props.image_key, null, this);
    this.body.anchor.set(0.5, 0.5);
    this.body.inputEnabled = true;
    this.body.events.onInputDown.add(this.onDown, this);
  }

  onDown(button) {
    console.info("Please redefine onDown");
  }
}

export default FsnButton;
