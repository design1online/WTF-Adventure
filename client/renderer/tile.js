/**
 * Represents an animated tile on the map
 * @class
 */
export default class Tile {
  /**
   * Default constructor
   * @param {Number} id the starting tile id
   * @param {Number} index the flat map index of this tile's position
   * @param {Number} length the number of frames in the animation sequence
   * @param {Number} speed the milliseconds between frame advances
   */
  constructor(id, index, length, speed) {
    /**
     * The tile id at the start of the animation sequence
     * @type {Number}
     */
    this.initialId = id;
    /**
     * The current tile id used for rendering
     * @type {Number}
     */
    this.id = id;
    /**
     * The flat map index of this tile
     * @type {Number}
     */
    this.index = index;
    /**
     * The number of animation frames in this tile's sequence
     * @type {Number}
     */
    this.length = length;
    /**
     * The milliseconds between animation frame advances
     * @type {Number}
     */
    this.speed = speed;
    /**
     * The timestamp of the last animation frame advance
     * @type {Number}
     */
    this.lastTime = 0;
    /**
     * Whether this tile has been loaded and rendered at least once
     * @type {Boolean}
     */
    this.loaded = false;
  }

  /**
   * Stores the tile's grid position
   * @param {Object} position an object with x and y grid coordinates
   */
  setPosition(position) {
    /** @type {Number} */
    this.x = position.x;
    /** @type {Number} */
    this.y = position.y;
  }

  /**
   * Advances the tile to the next frame in the animation sequence
   */
  tick() {
    this.id = this.id - this.initialId < this.length - 1
      ? this.id + 1
      : this.initialId;
  }

  /**
   * Advances the animation if enough time has elapsed
   * @param {Number} time the current game timestamp in milliseconds
   * @return {Boolean} true if the frame was advanced
   */
  animate(time) {
    if (time - this.lastTime > this.speed) {
      this.tick();
      this.lastTime = time;
      return true;
    }

    return false;
  }

  /**
   * Returns the tile's grid position as an array
   * @return {Number[]} an array of [x, y] or [-1, -1] if position is not set
   */
  getPosition() {
    if (this.x && this.y) {
      return [this.x, this.y];
    }

    return [-1, -1];
  }
}
