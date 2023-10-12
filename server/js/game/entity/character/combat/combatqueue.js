export default class CombatQueue {
  constructor() {
    this.hitQueue = [];
  }

  add(hit) {
    this.hitQueue.push(hit);
  }

  hasQueue() {
    return this.hitQueue.length > 0;
  }

  clear() {
    this.hitQueue = [];
  }

  getHit() {
    if (this.hitQueue.length < 1) {
      return null;
    }

    const hit = this.hitQueue.shift();

    return hit.getData();
  }
}
