import Equipment from './equipment.js';
import ItemsDictionary from '../../../../../util/items.js';

/**
 * Represents a ring equipment item worn by the player
 * @class
 */
export default class Ring extends Equipment {
  /**
   * Default constructor
   * @param {String} name the name of the ring
   * @param {Number} id the item ID of the ring
   * @param {Number} count the enchantment level of the ring
   * @param {Number} ability the ability ID associated with this ring
   * @param {Number} abilityLevel the level of the ring's ability
   */
  constructor(name, id, count, ability, abilityLevel) {
    super(name, id, count, ability, abilityLevel);
    /**
     * Reference to the items dictionary for stat lookups
     * @type {Object}
     */
    this.itemsDictionary = ItemsDictionary;
    /**
     * The ring level used to calculate the amplifier
     * @type {Number}
     */
    this.ringLevel = this.itemsDictionary.getRingLevel(name);
  }

  /**
   * Returns the base stat amplifier provided by this ring
   * @return {Number}
   */
  getBaseAmplifier() {
    return 1.0 + this.ringLevel / 150;
  }
}
