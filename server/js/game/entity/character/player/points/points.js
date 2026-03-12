/**
 * Base class for managing a points value and its maximum (e.g. health or mana)
 * @class
 */
export default class Points {
  /**
   * Default constructor
   * @param {Number} points the initial points value
   * @param {Number} maxPoints the initial maximum points value
   */
  constructor(points, maxPoints) {
    /**
     * The current points value
     * @type {Number}
     */
    this.points = points;
    /**
     * The maximum points value
     * @type {Number}
     */
    this.maxPoints = maxPoints;
  }

  /**
   * Increases points by the given amount and triggers the heal callback
   * @param {Number} amount the amount to heal
   */
  heal(amount) {
    this.setPoints(this.points + amount);

    if (this.healCallback) {
      this.healCallback();
    }
  }

  /**
   * Increases points by the given amount without capping at maximum
   * @param {Number} amount the amount to add
   */
  increment(amount) {
    this.points += amount;
  }

  /**
   * Decreases points by the given amount
   * @param {Number} amount the amount to subtract
   */
  decrement(amount) {
    this.points -= amount;
  }

  /**
   * Sets the points value, capping it at the maximum
   * @param {Number} points the new points value to set
   */
  setPoints(points) {
    this.points = points;

    if (this.points > this.maxPoints) {
      this.points = this.maxPoints;
    }
  }

  /**
   * Sets the maximum points value
   * @param {Number} maxPoints the new maximum points value
   */
  setMaxPoints(maxPoints) {
    this.maxPoints = maxPoints;
  }

  /**
   * Returns an array of the current and maximum points
   * @return {Array}
   */
  getData() {
    return [this.points, this.maxPoints];
  }

  /**
   * Registers a callback to invoke when healing occurs
   * @param {Function} callback the function to call when healing occurs
   */
  onHeal(callback) {
    /**
     * Callback invoked when healing occurs
     * @type {Function}
     */
    this.healCallback = callback;
  }
}
