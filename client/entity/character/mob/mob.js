import Character from '../character';

/**
 * A mobile {@link Character}, some can attack while others just move
 * @class
 */
export default class Mob extends Character {
  /**
   * Default constructor
   * @param {Number} id the ID of the {@link Entity}
   * @param {String} kind the kind of {@link Entity} this is (sprite name)
   * @param {String} label the name to display for the overlay
   */
  constructor(id, kind, label) {
    super(id, kind, label);

    /**
     * How many hit points the mob has
     * @type {Number}
     */
    this.hitPoints = -1; // not applicable by default

    /**
     * Maximum hit points the mob has
     * @type {Number}
     */
    this.maxHitPoints = -1; // not applicable by default

    /**
     * The type of character this is
     * @type {String}
     */
    this.type = 'mob';

    /**
     * The name of the mob
     * @type {String}
     */
    this.name = kind;
  }

  /**
   * Sets the name of this character
   * @param {String} name character name
   */
  setName(name) {
    this.name = name;
  }
}
