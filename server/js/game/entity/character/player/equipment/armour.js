import Equipment from './equipment.js';
import ItemsDictionary from '../../../../../util/items.js';

/**
 * Represents a piece of armour equipment worn by the player
 * @class
 */
export default class Armour extends Equipment {
  /**
   * Default constructor
   * @param {String} name the name of the armour
   * @param {Number} id the item ID of the armour
   * @param {Number} count the enchantment level of the armour
   * @param {Number} ability the ability ID associated with this armour
   * @param {Number} abilityLevel the level of the armour's ability
   */
  constructor(name, id, count, ability, abilityLevel) {
    super(name, id, count, ability, abilityLevel);
    /**
     * Reference to the items dictionary for stat lookups
     * @type {Object}
     */
    this.itemsDictionary = ItemsDictionary;
    /**
     * The defence rating of this armour
     * @type {Number}
     */
    this.defense = this.itemsDictionary.getArmourLevel(name);
  }

  /**
   * Returns whether this armour has the anti-stun ability
   * @return {Boolean}
   */
  hasAntiStun() {
    return this.ability === 6;
  }

  /**
   * Sets the defence rating of this armour
   * @param {Number} defense the new defence value to assign
   */
  setDefense(defense) {
    this.defense = defense;
  }

  /**
   * Returns the defence rating of this armour
   * @return {Number}
   */
  getDefense() {
    return this.defense;
  }
}
