/**
 * Tracks elapsed time to determine when a duration has passed
 * @class
 */
export default class Timer {
  /**
   * Default constructor
   * @param {Number} start the initial timestamp
   * @param {Number} duration the duration in milliseconds before the timer is considered over
   */
  constructor(start, duration) {
    /**
     * The timestamp of the last timer reset or start
     * @type {Number}
     */
    this.time = start;
    /**
     * The duration in milliseconds the timer runs for
     * @type {Number}
     */
    this.duration = duration;
  }

  /**
   * Checks whether the timer's duration has elapsed since the last reset
   * @param {Number} time the current timestamp to compare against
   * @return {Boolean}
   */
  isOver(time) {
    let over = false;

    if (time - this.time > this.duration) {
      over = true;
      this.time = time;
    }

    return over;
  }
}
