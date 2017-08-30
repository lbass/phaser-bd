class Member {
  constructor() {
    this.components = {};
  }
  add(obj) {
    console.info(this);
    this.components[obj.o_id] = obj;
  }
  get(id) {
    console.info(this.components[id]);
    return this.components[id];
  }
  remove(id) {
    this.components[id] = null;
  }
}
