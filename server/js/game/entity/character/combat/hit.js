/**
 * Represents a single hit action in combat
 * @class
 */
export default class Hit {
  /**
   * Default constructor
   * @param {Number} type the type of hit (e.g. damage, stun)
   * @param {Number} damage the amount of damage dealt
   */
  constructor(type, damage) {
    /**
     * The type of hit
     * @type {Number}
     */
    this.type = type;
    /**
     * The amount of damage dealt
     * @type {Number}
     */
    this.damage = damage;

    /**
     * Whether this hit is a ranged attack
     * @type {Boolean}
     */
    this.ranged = false;
    /**
     * Whether this hit is an area-of-effect attack
     * @type {Boolean}
     */
    this.aoe = false;
    /**
     * Whether this hit inflicts terror
     * @type {Boolean}
     */
    this.terror = false;
  }

  /**
   * Returns whether this hit is a ranged attack
   * @return {Boolean}
   */
  isRanged() {
    return this.ranged;
  }

  /**
   * Returns whether this hit is an area-of-effect attack
   * @return {Boolean}
   */
  isAoE() {
    return this.aoe;
  }

  /**
   * Returns the damage value of this hit
   * @return {Number}
   */
  getDamage() {
    return this.damage;
  }

  /**
   * Returns a plain object representation of the hit data
   * @return {Object}
   */
  getData() {
    return {
      type: this.type,
      damage: this.damage,
      isRanged: this.isRanged(),
      isAoE: this.isAoE(),
      hasTerror: this.terror,
    };
  }
}
