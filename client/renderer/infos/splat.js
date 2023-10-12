export default class Splat {
  constructor(id, type, text, x, y, statique) {
    this.id = id;
    this.type = type;
    this.text = text;
    this.x = x;
    this.y = y;

    this.statique = statique;

    this.opacity = 1.0;
    this.lastTime = 0;
    this.speed = 100;

    this.duration = 1000;
  }

  setColours(fill, stroke) {
    this.fill = fill;
    this.stroke = stroke;
  }

  setDuration(duration) {
    this.duration = duration;
  }

  tick() {
    if (!this.statique) {
      this.y -= 1;
    }

    this.opacity -= 70 / this.duration;

    if (this.opacity < 0) {
      this.destroy();
    }
  }

  update(time) {
    if (time - this.lastTime > this.speed) {
      this.lastTime = time;
      this.tick();
    }
  }

  destroy() {
    if (this.destroyCallback) {
      this.destroyCallback(this.id);
    }
  }

  onDestroy(callback) {
    this.destroyCallback = callback;
  }
}
