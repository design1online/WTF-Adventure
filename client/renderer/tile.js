export default class Tile {
  constructor(id, index, length, speed) {
    this.initialId = id;
    this.id = id;
    this.index = index;
    this.length = length;
    this.speed = speed;
    this.lastTime = 0;
    this.loaded = false;
  }

  setPosition(position) {
    this.x = position.x;
    this.y = position.y;
  }

  tick() {
    this.id = this.id - this.initialId < this.length - 1
      ? this.id + 1
      : this.initialId;
  }

  animate(time) {
    if (time - this.lastTime > this.speed) {
      this.tick();
      this.lastTime = time;
      return true;
    }

    return false;
  }

  getPosition() {
    if (this.x && this.y) {
      return [this.x, this.y];
    }

    return [-1, -1];
  }
}
