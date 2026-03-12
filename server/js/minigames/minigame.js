/**
 * Abstract base class representing a minigame
 * @class
 */
export default class Minigame {
  /**
   * Default constructor
   * @param {Number} id the unique identifier for this minigame
   * @param {String} name the display name of this minigame
   */
  constructor(id, name) {
    /**
     * The unique identifier for this minigame
     * @type {Number}
     */
    this.id = id;
    /**
     * The display name of this minigame
     * @type {String}
     */
    this.name = name;
  }

  /**
   * Returns the unique identifier of this minigame
   * @return {Number}
   */
  getId() {
    return this.id;
  }

  /**
   * Returns the display name of this minigame
   * @return {String}
   */
  getName() {
    return this.name;
  }
}
