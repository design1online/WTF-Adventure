var Entity = require("../entity"),
  Utils = require("../../../util/utils");

module.exports = Chest = Entity.extend({
  init(id, instance, x, y) {
    var self = this;

    this._super(id, "chest", instance, x, y);

    this.respawnDuration = 25000; //Every 25 seconds
    this.static = false;

    this.items = [];
  },

  openChest() {
    var self = this;

    if (this.openCallback) this.openCallback();
  },

  respawn() {
    var self = this;

    setTimeout(function() {
      if (this.respawnCallback) this.respawnCallback();
    }, this.respawnDuration);
  },

  getItem() {
    var self = this,
      random = Utils.randomInt(0, this.items.length - 1),
      item = this.items[random];

    if (!item) return;

    return item;
  },

  onOpen(callback) {
    this.openCallback = callback;
  },

  onRespawn(callback) {
    this.respawnCallback = callback;
  }
});