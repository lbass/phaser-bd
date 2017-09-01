'use strict';

class Member {
  constructor() {
    this.components = {};
  }
  add(obj) {
    this.components[obj.o_id] = obj;
  }
  get(id) {
    return this.components[id];
  }
  remove(id) {
    this.components[id] = null;
  }
}

export default Member;
