/**
 * This is an abstract file for Area,
 * it encompasses the dimensions and all
 * entities in it.
 */
export default class Area {
  constructor(id, x, y, width, height) {
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
  }

  contains(x, y) {
    return (
      x >= this.x
      && y >= this.y
      && x < this.x + this.width
      && y < this.y + this.height
    );
  }

  addEntity(entity) {
    if (this.entities.indexOf(entity) > 0) {
      return;
    }

    this.entities.push(entity);
    entity.area = this; // eslint-disable-line

    if (this.spawnCallback) {
      this.spawnCallback();
    }
  }

  removeEntity(entity) {
    const index = this.entities.indexOf(entity);

    if (index > -1) this.entities.splice(index, 1);

    if (this.entities.length === 0 && this.emptyCallback) this.emptyCallback();
  }

  isFull() {
    return this.entities.length >= this.maxEntities;
  }

  setMaxEntities(maxEntities) {
    this.maxEntities = maxEntities;
  }

  onEmpty(callback) {
    this.emptyCallback = callback;
  }

  onSpawn(callback) {
    this.spawnCallback = callback;
  }
}
