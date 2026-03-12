/**
 * Represents a single item slot within a container
 * @class
 */
export default class Slot {
  /**
   * Default constructor
   * @param {Number} index the position index of this slot within the container
   */
  constructor(index) {
    /**
     * The position index of this slot
     * @type {Number}
     */
    this.index = index;
    /**
     * The name of the item in this slot, or null if empty
     * @type {String}
     */
    this.name = null;
    /**
     * The stack count of the item in this slot
     * @type {Number}
     */
    this.count = -1;
    /**
     * The ability type associated with this item
     * @type {Number}
     */
    this.ability = -1;
    /**
     * The level of the ability associated with this item
     * @type {Number}
     */
    this.abilityLevel = -1;
    /**
     * Whether the item in this slot is edible
     * @type {Boolean}
     */
    this.edible = false;
    /**
     * Whether the item in this slot can be equipped
     * @type {Boolean}
     */
    this.equippable = false;
  }

  /**
   * Loads item data into this slot
   * @param {String} name the item name
   * @param {Number} count the stack count
   * @param {Number} ability the ability type
   * @param {Number} abilityLevel the ability level
   * @param {Boolean} edible whether the item is edible
   * @param {Boolean} equippable whether the item can be equipped
   */
  loadSlot(name, count, ability, abilityLevel, edible, equippable) {
    this.name = name;
    this.count = count;
    this.ability = ability;
    this.abilityLevel = abilityLevel;
    this.edible = edible;
    this.equippable = equippable;
  }

  /**
   * Resets all slot properties to their default empty values
   */
  empty() {
    this.name = null;
    this.count = -1;
    this.ability = -1;
    this.abilityLevel = -1;
    this.edible = false;
    this.equippable = false;
  }

  /**
   * Returns whether this slot is empty
   * @return {Boolean}
   */
  isEmpty() {
    return this.name === null || this.count === -1;
  }

  /**
   * Sets the stack count for the item in this slot
   * @param {Number} count the new stack count
   */
  setCount(count) {
    this.count = count;
  }
}
