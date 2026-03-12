import Points from './points.js';

/**
 * Manages the hit points for a player or character
 * @class
 */
export default class HitPoints extends Points {
  /**
   * Sets the current hit points and triggers the callback if registered
   * @param {Number} hitPoints the new hit points value to set
   */
  setHitPoints(hitPoints) {
    this.setPoints(hitPoints);

    if (this.hitPointsCallback) {
      this.hitPointsCallback();
    }
  }

  /**
   * Sets the maximum hit points and triggers the callback if registered
   * @param {Number} maxHitPoints the new maximum hit points value to set
   */
  setMaxHitPoints(maxHitPoints) {
    this.setMaxPoints(maxHitPoints);

    if (this.maxHitPointsCallback) {
      this.maxHitPointsCallback();
    }
  }

  /**
   * Returns the current hit points
   * @return {Number}
   */
  getHitPoints() {
    return this.points;
  }

  /**
   * Returns the maximum hit points
   * @return {Number}
   */
  getMaxHitPoints() {
    return this.maxPoints;
  }

  /**
   * Registers a callback to invoke when hit points change
   * @param {Function} callback the function to call on hit points change
   */
  onHitPoints(callback) {
    /**
     * Callback invoked when hit points change
     * @type {Function}
     */
    this.hitPointsCallback = callback;
  }

  /**
   * Registers a callback to invoke when maximum hit points change
   * @param {Function} callback the function to call on max hit points change
   */
  onMaxHitPoints(callback) {
    /**
     * Callback invoked when maximum hit points change
     * @type {Function}
     */
    this.maxHitPointsCallback = callback;
  }
}
