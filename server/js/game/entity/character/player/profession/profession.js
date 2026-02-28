/**
 * Base class representing a player's profession
 * @class
 */
export default class Profession {
  /**
   * Default constructor
   */
  constructor() {
    /**
     * The unique identifier of the profession
     * @type {Number}
     */
    this.id = -1;
    /**
     * The name of the profession
     * @type {String}
     */
    this.name = null;
    /**
     * The current level of the profession
     * @type {Number}
     */
    this.level = -1;
    /**
     * The maximum level achievable in this profession
     * @type {Number}
     */
    this.maxLevel = -1;
    /**
     * The accumulated experience in this profession
     * @type {Number}
     */
    this.experience = -1;
  }

  /**
   * Loads the profession data with the given values
   * @param {Number} id the unique identifier of the profession
   * @param {String} name the name of the profession
   * @param {Number} level the current level
   * @param {Number} maxLevel the maximum level
   */
  load(id, name, level, maxLevel) {
    this.id = id;
    this.name = name;
    this.level = level;
    this.maxLevel = maxLevel;
  }
}
