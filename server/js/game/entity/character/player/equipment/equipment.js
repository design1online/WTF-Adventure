import ItemsDictionary from '../../../../../util/items.js';

/**
 * Count represents the enchantment level of
 * the equipment child
 */
/**
 * Base class representing a piece of equipment worn by the player
 * @class
 */
export default class Equipment {
  /**
   * Default constructor
   * @param {String} name the name of the equipment
   * @param {Number} id the item ID of the equipment
   * @param {Number} count the enchantment level of the equipment
   * @param {Number} ability the ability ID associated with this equipment
   * @param {Number} abilityLevel the level of the equipment's ability
   */
  constructor(name, id, count, ability, abilityLevel) {
    /**
     * The display name of the equipment
     * @type {String}
     */
    this.name = name;
    /**
     * The item ID of the equipment
     * @type {Number}
     */
    this.id = id;
    /**
     * The enchantment level of the equipment
     * @type {Number}
     */
    this.count = count || 0;
    /**
     * The ability ID associated with this equipment
     * @type {Number}
     */
    this.ability = ability || 0;
    /**
     * The level of the ability associated with this equipment
     * @type {Number}
     */
    this.abilityLevel = abilityLevel || 0;
    /**
     * Reference to the items dictionary for stat lookups
     * @type {Object}
     */
    this.itemsDictionary = ItemsDictionary;
  }

  /**
   * Returns the display name of this equipment
   * @return {String}
   */
  getName() {
    return this.name;
  }

  /**
   * Returns the item ID of this equipment
   * @return {Number}
   */
  getId() {
    return this.id;
  }

  /**
   * Returns the enchantment level (count) of this equipment
   * @return {Number}
   */
  getCount() {
    return this.count;
  }

  /**
   * Returns the ability ID associated with this equipment
   * @return {Number}
   */
  getAbility() {
    return this.ability;
  }

  /**
   * Returns the ability level of this equipment
   * @return {Number}
   */
  getAbilityLevel() {
    return this.abilityLevel;
  }

  /**
   * Returns the base stat amplifier provided by this equipment
   * @return {Number}
   */
  getBaseAmplifier() {
    return 1.0;
  }

  /**
   * Returns an array of equipment data for serialization
   * @return {Array}
   */
  getData() {
    return [
      this.itemsDictionary.idToName(this.id),
      this.itemsDictionary.idToString(this.id),
      this.count,
      this.ability,
      this.abilityLevel,
    ];
  }

  /**
   * Returns the string identifier of this equipment from the items dictionary
   * @return {String}
   */
  getName() {
    return this.itemsDictionary.idToString(this.id);
  }

  /**
   * Returns a plain object describing this equipment item
   * @return {Object}
   */
  getItem() {
    return {
      name: this.name,
      string: this.itemsDictionary.idToString(this.id),
      id: this.id,
      count: this.count,
      ability: this.ability,
      abilityLevel: this.abilityLevel,
    };
  }
}
