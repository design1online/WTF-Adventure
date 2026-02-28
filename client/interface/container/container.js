import Slot from './slot';

/**
 * Represents a fixed-size container of item slots
 * @class
 */
export default class Container {
  /**
   * Default constructor
   * @param {Number} size the number of slots in this container
   */
  constructor(size) {
    /**
     * The number of slots in this container
     * @type {Number}
     */
    this.size = size;
    /**
     * The array of slot instances
     * @type {Array}
     */
    this.slots = [];

    for (let i = 0; i < this.size; i += 1) {
      this.slots.push(new Slot(i));
    }
  }

  /**
   * We receive information from the server here,
   * so we mustn't do any calculations. Instead,
   * we just modify the container directly.
   */
  setSlot(index, info) {
    this.slots[index].loadSlot(
      info.name,
      info.count,
      info.ability,
      info.abilityLevel,
      info.edible,
      info.equippable,
    );
  }

  /**
   * Returns the index of the first empty slot, or -1 if none available
   * @return {Number}
   */
  getEmptySlot() {
    for (let i = 0; i < this.slots; i += 1) {
      if (!this.slots[i].name) {
        return i;
      }
    }

    return -1;
  }

  /**
   * Returns a CSS url string for the item image at the given scale
   * @param {Number} scale the drawing scale factor
   * @param {String} name the item name used in the image filename
   * @return {String}
   */
  getImageFormat(scale, name) {
    return `url("/img/${scale}/item-${name}.png")`;
  }
}
