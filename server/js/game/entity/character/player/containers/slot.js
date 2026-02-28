import Items from '../../../../../util/items.js';

/**
 * Represents a single item slot within a container
 * @class
 */
export default class Slot {
  /**
   * Default constructor
   * @param {Number} index the position index of this slot in its container
   */
  constructor(index) {
    /**
     * The position index of this slot
     * @type {Number}
     */
    this.index = index;
    /**
     * The item ID stored in this slot, or -1 if empty
     * @type {Number}
     */
    this.id = -1;
    /**
     * The number of items in this slot
     * @type {Number}
     */
    this.count = -1;
    /**
     * The ability ID associated with the item in this slot
     * @type {Number}
     */
    this.ability = -1;
    /**
     * The level of the ability associated with the item
     * @type {Number}
     */
    this.abilityLevel = -1;
    /**
     * The string name of the item in this slot
     * @type {String}
     */
    this.name = null;
  }

  /**
   * Loads the slot with item data, resolving item metadata from the items dictionary
   * @param {Number} id the item ID
   * @param {Number} count the item count
   * @param {Number} ability the ability ID
   * @param {Number} abilityLevel the ability level
   */
  loadSlot(id, count, ability, abilityLevel) {
    this.id = parseInt(id, 10);
    this.count = parseInt(count, 10);
    this.ability = parseInt(ability, 10);
    this.abilityLevel = parseInt(abilityLevel, 10);

    this.name = Items.idToString(this.id);
    /** @type {Boolean} */
    this.edible = Items.isEdible(this.id);
    /** @type {Boolean} */
    this.equippable = Items.isEquippable(this.name);

    this.verify();
  }

  /**
   * Resets the slot to its empty state
   */
  empty() {
    this.id = -1;
    this.count = -1;
    this.ability = -1;
    this.abilityLevel = -1;
    this.name = null;
  }

  /**
   * Increases the item count in this slot by the given amount
   * @param {Number} amount the amount to add to the count
   */
  increment(amount) {
    this.count += parseInt(amount, 10);
    this.verify();
  }

  /**
   * Decreases the item count in this slot by the given amount
   * @param {Number} amount the amount to subtract from the count
   */
  decrement(amount) {
    this.count -= parseInt(amount, 10);
    this.verify();
  }

  /**
   * Ensures the count is a valid number, defaulting to 1 if NaN
   */
  verify() {
    if (isNaN(this.count)) {
      this.count = 1;
    }
  }

  /**
   * Returns a plain object representation of this slot
   * @return {Object}
   */
  getData() {
    return {
      index: this.index,
      name: this.name,
      count: this.count,
      ability: this.ability,
      abilityLevel: this.abilityLevel,
    };
  }
}
