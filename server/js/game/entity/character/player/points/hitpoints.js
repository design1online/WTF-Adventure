import Points from './points.js';

export default class HitPoints extends Points {
  setHitPoints(hitPoints) {
    this.setPoints(hitPoints);

    if (this.hitPointsCallback) {
      this.hitPointsCallback();
    }
  }

  setMaxHitPoints(maxHitPoints) {
    this.setMaxPoints(maxHitPoints);

    if (this.maxHitPointsCallback) {
      this.maxHitPointsCallback();
    }
  }

  getHitPoints() {
    return this.points;
  }

  getMaxHitPoints() {
    return this.maxPoints;
  }

  onHitPoints(callback) {
    this.hitPointsCallback = callback;
  }

  onMaxHitPoints(callback) {
    this.maxHitPointsCallback = callback;
  }
}
