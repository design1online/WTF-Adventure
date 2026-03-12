import Points from './points.js';

/**
 * Manages the mana points for a player
 * @class
 */
export default class Mana extends Points {
  /**
   * Returns the current mana value
   * @return {Number}
   */
  getMana() {
    return this.points;
  }

  /**
   * Returns the maximum mana value
   * @return {Number}
   */
  getMaxMana() {
    return this.maxPoints;
  }

  /**
   * Sets the current mana value and triggers the callback if registered
   * @param {Number} mana the new mana value to set
   */
  setMana(mana) {
    /** @type {Number} */
    this.points = mana;

    if (this.manaCallback) {
      this.manaCallback();
    }
  }

  /**
   * Sets the maximum mana value and triggers the callback if registered
   * @param {Number} maxMana the new maximum mana value to set
   */
  setMaxMana(maxMana) {
    /** @type {Number} */
    this.maxPoints = maxMana;

    if (this.maxManaCallback) {
      this.maxManaCallback();
    }
  }

  /**
   * Registers a callback to invoke when mana changes
   * @param {Function} callback the function to call when mana changes
   */
  onMana(callback) {
    /**
     * Callback invoked when mana changes
     * @type {Function}
     */
    this.manaCallback = callback;
  }

  /**
   * Registers a callback to invoke when maximum mana changes
   * @param {Function} callback the function to call when max mana changes
   */
  onMaxMana(callback) {
    /**
     * Callback invoked when maximum mana changes
     * @type {Function}
     */
    this.maxManaCallback = callback;
  }
}
