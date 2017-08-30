class FsnSprite extends FsnBase {
  constructor(props) {
    super(props);

    this.body = this.game.add.sprite(props.x, props.y, props.image_key);
    this.body.visible = props.visible !== undefined ? props.visible : true;

    if(props.animations !== undefined) {
      let animations = props.animations;
      for(let key in animations) {
        let animation = animations[key];
        this.body.animations.add(key, animation.data, animation.data.length, animation.is_loop);
        this.body.animations.getAnimation(key).onComplete.add(this.onAniComplete, this);
      }
    }

    if(props.default_alpha !== undefined) {
      this.body.alpha = props.default_alpha;
    }

    this.body.events.onInputDown.add(this.onDown, this);
    this.body.events.onInputOver.add(this.onOver, this);
    this.body.events.onInputOut.add(this.onOut, this);
  }

  getPosition() {
    return {x: this.body.x, y: this.body.y};
  }

  playAnimation(animationName, framRate) {
    this.body.play(animationName);
    this.body.animations.currentAnim.speed = framRate;
  }

  onAniComplete(sprite, animation) {
    console.info("Please redefine onAniComplete");
  }
}
