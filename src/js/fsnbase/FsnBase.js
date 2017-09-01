class FsnBase {
  constructor(props) {
    if(props.id) {
      this.o_id = props.id;
    }
    this.game = props.game;
    this.body = null;
    this.data = null;
  }

  changeImage(imageKey) {
    this.body.loadTexture(imageKey, 0)
  }

  setPosition(x, y) {
    this.body.x = x;
    this.body.y = y;
  }

  setAlpha(val) {
    this.body.alpha = val;
  }

  setData(key, data) {
    this.body.data[key] = data;
  }

  getData(key) {
    return this.body.data[key];
  }

  getDisplayState() {
    return this.body.visible;
  }

  changeDisplayState(isShow) {
    this.body.visible = isShow;
  }

  bringToTop() {
    this.game.world.bringToTop(this.body);
  }

  changeInputEnableState(state) {
    this.body.inputEnabled = state;
  }

  destroy() {
    this.game.member.remove(this.o_id);
    this.body.destroy();
  }
}

export default FsnBase;
