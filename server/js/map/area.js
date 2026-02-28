/**
 * Represents a rectangular area of the map with optional entity tracking.
 * Encompasses the dimensions and all entities within it.
 * @class
 */
export default class Area {
  /**
   * Default constructor
   * @param {Number} id the unique identifier for this area
   * @param {Number} x the x-coordinate of the top-left corner
   * @param {Number} y the y-coordinate of the top-left corner
   * @param {Number} width the width of the area in tiles
   * @param {Number} height the height of the area in tiles
   */
  constructor(id, x, y, width, height) {
    /**
     * The unique identifier for this area
     * @type {Number}
     */
    this.id = id;
    /**
     * The x-coordinate of the top-left corner
     * @type {Number}
     */
    this.x = x;
    /**
     * The y-coordinate of the top-left corner
     * @type {Number}
     */
    this.y = y;
    /**
     * The width of the area in tiles
     * @type {Number}
     */
    this.width = width;
    /**
     * The height of the area in tiles
     * @type {Number}
     */
    this.height = height;

    /**
     * List of entities currently in this area
     * @type {Array}
     */
    this.entities = [];
    /**
     * List of items currently in this area
     * @type {Array}
     */
    this.items = [];

    /**
     * Whether the area has been respawned
     * @type {Boolean}
     */
    this.hasRespawned = true;
    /**
     * The chest entity associated with this area, if any
     * @type {Object}
     */
    this.chest = null;

    /**
     * Maximum number of entities allowed in this area
     * @type {Number}
     */
    this.maxEntities = 0;
  }

  /**
   * Checks whether the given coordinates are within this area
   * @param {Number} x the x-coordinate to test
   * @param {Number} y the y-coordinate to test
   * @return {Boolean}
   */
  contains(x, y) {
    return (
      x >= this.x
      && y >= this.y
      && x < this.x + this.width
      && y < this.y + this.height
    );
  }

  /**
   * Adds an entity to this area and triggers the spawn callback
   * @param {Object} entity the entity to add
   */
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

  /**
   * Removes an entity from this area and triggers the empty callback if no entities remain
   * @param {Object} entity the entity to remove
   */
  removeEntity(entity) {
    const index = this.entities.indexOf(entity);

    if (index > -1) this.entities.splice(index, 1);

    if (this.entities.length === 0 && this.emptyCallback) this.emptyCallback();
  }

  /**
   * Returns whether this area has reached its maximum entity capacity
   * @return {Boolean}
   */
  isFull() {
    return this.entities.length >= this.maxEntities;
  }

  /**
   * Sets the maximum number of entities allowed in this area
   * @param {Number} maxEntities the maximum entity count
   */
  setMaxEntities(maxEntities) {
    this.maxEntities = maxEntities;
  }

  /**
   * Registers a callback invoked when this area has no more entities
   * @param {Function} callback the function to call when the area becomes empty
   */
  onEmpty(callback) {
    /**
     * Callback invoked when the area becomes empty
     * @type {Function}
     */
    this.emptyCallback = callback;
  }

  /**
   * Registers a callback invoked when an entity spawns in this area
   * @param {Function} callback the function to call when an entity spawns
   */
  onSpawn(callback) {
    /**
     * Callback invoked when an entity spawns in the area
     * @type {Function}
     */
    this.spawnCallback = callback;
  }
}
