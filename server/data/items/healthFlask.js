import Item from '../../js/game/entity/objects/item.js';
import Utils from '../../js/util/utils';
import Items from '../../js/util/items';

/**
 * Item class for health and mana flask consumables
 * @class
 */
export default class Flask extends Item {
  /**
   * Default constructor
   * @param {Number} id the item identifier
   * @param {String} instance the unique instance identifier
   * @param {Number} x the x-coordinate of the item
   * @param {Number} y the y-coordinate of the item
   */
  constructor(id, instance, x, y) {
    super(id, instance, x, y);
    /**
     * Amount of hit points restored on use
     * @type {Number}
     */
    this.healAmount = 0;
    /**
     * Amount of mana points restored on use
     * @type {Number}
     */
    this.manaAmount = 0;

    const customData = new Items().getCustomData(id);
    if (customData) {
      this.healAmount = customData.healAmount ? customData.healAmount : 0;
      this.manaAmount = customData.manaAmount ? customData.manaAmount : 0;
    }
  }

  /**
   * Heals the character's hit points and mana when the flask is used
   * @param {Character} character the character using the flask
   */
  onUse(character) {
    if (this.healAmount) {
      character.healHitPoints(this.healAmount);
    }

    if (this.manaAmount) {
      character.healManaPoints(this.manaAmount);
    }
  }
}
