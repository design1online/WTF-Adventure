import Equipment from './equipment.js';
import ItemsDictionary from '../../../../../util/items.js';

/**
 * Represents a weapon equipment item wielded by the player
 * @class
 */
export default class Weapon extends Equipment {
  /**
   * Default constructor
   * @param {String} name the name of the weapon
   * @param {Number} id the item ID of the weapon
   * @param {Number} count the enchantment level of the weapon
   * @param {Number} ability the ability ID associated with this weapon
   * @param {Number} abilityLevel the level of the weapon's ability
   */
  constructor(name, id, count, ability, abilityLevel) {
    super(name, id, count, ability, abilityLevel);
    /**
     * Reference to the items dictionary for stat lookups
     * @type {Object}
     */
    this.itemsDictionary = ItemsDictionary;
    /**
     * The weapon level used for damage calculations
     * @type {Number}
     */
    this.level = this.itemsDictionary.getWeaponLevel(name);
    /**
     * Whether this weapon is a ranged (archer) weapon
     * @type {Boolean}
     */
    this.ranged = this.itemsDictionary.isArcherWeapon(name);
    /**
     * Whether this weapon can break during use
     * @type {Boolean}
     */
    this.breakable = false;
  }

  /**
   * Returns whether this weapon has the critical hit ability
   * @return {Boolean}
   */
  hasCritical() {
    return this.ability === 1;
  }

  /**
   * Returns whether this weapon has the explosive ability
   * @return {Boolean}
   */
  hasExplosive() {
    return this.ability === 4;
  }

  /**
   * Returns whether this weapon has the stun ability
   * @return {Boolean}
   */
  hasStun() {
    return this.ability === 5;
  }

  /**
   * Returns whether this weapon is a ranged weapon
   * @return {Boolean}
   */
  isRanged() {
    return this.ranged;
  }

  /**
   * Sets the weapon level
   * @param {Number} level the new weapon level value
   */
  setLevel(level) {
    this.level = level;
  }

  /**
   * Returns the weapon level
   * @return {Number}
   */
  getLevel() {
    return this.level;
  }
}
