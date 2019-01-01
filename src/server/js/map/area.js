/* global module */

var cls = require("../lib/class");

module.exports = Area = cls.Class.extend({
  /**
   * This is an abstract file for Area,
   * it encompasses the dimensions and all
   * entities in it.
   */

  init(id, x, y, width, height) {
    var self = this;

    this.id = id;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.entities = [];
    this.items = [];

    this.hasRespawned = true;
    this.chest = null;

    this.maxEntities = 0;
  },

  contains(x, y) {
    return (
      x >= this.x &&
      y >= this.y &&
      x < this.x + this.width &&
      y < this.y + this.height
    );
  },

  addEntity(entity) {
    var self = this;

    if (this.entities.indexOf(entity) > 0) return;

    this.entities.push(entity);
    entity.area = self;

    if (this.spawnCallback) this.spawnCallback();
  },

  removeEntity(entity) {
    var self = this,
      index = this.entities.indexOf(entity);

    if (index > -1) this.entities.splice(index, 1);

    if (this.entities.length === 0 && this.emptyCallback) this.emptyCallback();
  },

  isFull() {
    return this.entities.length >= this.maxEntities;
  },

  setMaxEntities(maxEntities) {
    this.maxEntities = maxEntities;
  },

  onEmpty(callback) {
    this.emptyCallback = callback;
  },

  onSpawn(callback) {
    this.spawnCallback = callback;
  }
});