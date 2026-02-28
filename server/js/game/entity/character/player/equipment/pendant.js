import Equipment from './equipment.js';
import ItemsDictionary from '../../../../../util/items.js';

/**
 * Represents a pendant equipment item worn by the player
 * @class
 */
export default class Pendant extends Equipment {
  /**
   * Default constructor
   * @param {String} name the name of the pendant
   * @param {Number} id the item ID of the pendant
   * @param {Number} count the enchantment level of the pendant
   * @param {Number} ability the ability ID associated with this pendant
   * @param {Number} abilityLevel the level of the pendant's ability
   */
  constructor(name, id, count, ability, abilityLevel) {
    super(name, id, count, ability, abilityLevel);
    /**
     * Reference to the items dictionary for stat lookups
     * @type {Object}
     */
    this.itemsDictionary = ItemsDictionary;
    /**
     * The pendant level used to calculate the amplifier
     * @type {Number}
     */
    this.pendantLevel = this.itemsDictionary.getPendantLevel(name);
  }

  /**
   * Returns the base stat amplifier provided by this pendant
   * @return {Number}
   */
  getBaseAmplifier() {
    return 1.0 + this.pendantLevel / 100;
  }
}
