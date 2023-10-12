import Entity from '../entity.js';
import Utils from '../../../util/utils.js';

export default class Chest extends Entity {
  constructor(id, instance, x, y) {
    super(id, 'chest', instance, x, y);

    this.respawnDuration = 25000; // Every 25 seconds
    this.static = false;

    this.items = [];
  }

  openChest() {
    if (this.openCallback) {
      this.openCallback();
    }
  }

  respawn() {
    setTimeout(() => {
      if (this.respawnCallback) this.respawnCallback();
    }, this.respawnDuration);
  }

  getItem() {
    const random = Utils.randomInt(0, this.items.length - 1);
    const item = this.items[random];

    if (!item) {
      return null;
    }

    return item;
  }

  onOpen(callback) {
    this.openCallback = callback;
  }

  onRespawn(callback) {
    this.respawnCallback = callback;
  }
}
