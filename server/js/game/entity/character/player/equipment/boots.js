import Equipment from './equipment.js';
import ItemsDictionary from '../../../../../util/items.js';

/**
 * Represents a pair of boots equipment worn by the player
 * @class
 */
export default class Boots extends Equipment {
  /**
   * Default constructor
   * @param {String} name the name of the boots
   * @param {Number} id the item ID of the boots
   * @param {Number} count the enchantment level of the boots
   * @param {Number} ability the ability ID associated with these boots
   * @param {Number} abilityLevel the level of the boots' ability
   */
  constructor(name, id, count, ability, abilityLevel) {
    super(name, id, count, ability, abilityLevel);
    /**
     * Reference to the items dictionary for stat lookups
     * @type {Object}
     */
    this.itemsDictionary = ItemsDictionary;
    /**
     * The boots level used to calculate the amplifier
     * @type {Number}
     */
    this.bootsLevel = this.itemsDictionary.getBootsLevel(name);
  }

  /**
   * Returns the base damage/stat amplifier provided by these boots
   * @return {Number}
   */
  getBaseAmplifier() {
    return 1.0 + this.bootsLevel / 200;
  }
}
