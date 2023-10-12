import Entity from '../entity';

/**
* This os an object type of {@link Entity}
* @class
*/
export default class Item extends Entity {
  /**
   * Default constructor
   * @param {Number} id            id of the item
   * @param {String} kind          type of the item
   * @param {String} name          name of the item
   * @param {Number} count         how many
   * @param {Ability} ability      ability
   * @param {Number} abilityLevel  ability level
   */
  constructor(id, kind, name, count, ability, abilityLevel) {
    super(id, kind, name);

    /**
     * How many
     * @type {Number}
     */
    this.count = count;

    /**
     * Ability
     * @type {Ability}
     */
    this.ability = ability;

    /**
     * Ability level
     * @type {Number}
     */
    this.abilityLevel = abilityLevel;

    /**
     * If this item was dropped
     * @type {Boolean}
     */
    this.dropped = false;

    /**
     * If this item is stacked
     * @type {Boolean}
     */
    this.stackable = false;

    /**
     * Type of entity
     * @type {String}
     */
    this.type = 'item';

    /**
     * Whether or not it has a shadow
     * @type {Boolean}
     */
    this.shadow = true;
  }

  /**
   * Set the idle animation
   */
  idle() {
    this.setAnimation('idle', 150);
  }

  /**
   * Check if this has a shadow or not
   * @return {Boolean}
   */
  hasShadow() {
    return this.shadow;
  }
}
