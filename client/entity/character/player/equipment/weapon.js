import Equipment from './equipment';

/**
 * {@link Equipment} that can be equipped on a {@link Character}
 * @class
 */
export default class Weapon extends Equipment {
  /**
   * Default constructor
   * @param {String} name Name of the equipment
   * @param {Number} count How many times it can be used
   * @param {String} ability The ability of this armor
   * @param {Number} abilityLevel Level for this armor
   */
  constructor(name, count, ability, abilityLevel) {
    super(name, count, ability, abilityLevel);

    /**
     * Level of the weapon
     * @type {Number}
     */
    this.level = -1;

    /**
     * How much damage the weapon can inflict
     * @type {Number}
     */
    this.damage = -1;

    /**
     * Whether or not this weapon is a projectile
     * @type {Boolean}
     */
    this.ranged = false;
  }

  /**
   * Set the amount of damage
   * @param {Number} damage amount of damage
   */
  setDamage(damage) {
    this.damage = damage;
  }

  /**
   * Set the level of this weapon
   * @param {Number} level weapon level
   */
  setLevel(level) {
    this.level = level;
  }

  /**
   * Return the damage this weapon inflicts
   * @return {Number} damage amount
   */
  getDamage() {
    return this.damage;
  }

  /**
   * Return the level of this weapon
   * @return {Number} level of the weapon
   */
  getLevel() {
    return this.level;
  }
}
