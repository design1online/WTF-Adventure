/**
 * Manages smooth value transitions over a fixed duration
 * @class
 */
export default class Transition {
  /**
   * Default constructor
   */
  constructor() {
    /**
     * The value at the beginning of the transition
     * @type {Number}
     */
    this.startValue = 0;
    /**
     * The value at the end of the transition
     * @type {Number}
     */
    this.endValue = 0;
    /**
     * The duration of the transition in milliseconds
     * @type {Number}
     */
    this.duration = 0;
    /**
     * Whether the transition is currently running
     * @type {Boolean}
     */
    this.inProgress = false;
  }

  /**
   * Starts a new transition with the given parameters
   * @param {Number} currentTime the current timestamp in milliseconds
   * @param {Function} updateFunction callback invoked each step with the current interpolated value
   * @param {Function} stopFunction callback invoked when the transition completes
   * @param {Number} startValue the value to begin transitioning from
   * @param {Number} endValue the value to transition to
   * @param {Number} duration the total duration of the transition in milliseconds
   */
  start(
    currentTime,
    updateFunction,
    stopFunction,
    startValue,
    endValue,
    duration,
  ) {
    /**
     * The timestamp when the transition started
     * @type {Number}
     */
    this.startTime = currentTime;
    /**
     * The callback function called on each step with the interpolated value
     * @type {Function}
     */
    this.updateFunction = updateFunction;
    /**
     * The callback function called when the transition finishes
     * @type {Function}
     */
    this.stopFunction = stopFunction;
    this.startValue = startValue;
    this.endValue = endValue;
    this.duration = duration;

    this.inProgress = true;
    /** @type {Number} */
    this.count = 0;
  }

  /**
   * Advances the transition by one step based on the current time
   * @param {Number} currentTime the current timestamp in milliseconds
   */
  step(currentTime) {
    if (!this.inProgress) {
      return;
    }

    if (this.count > 0) {
      this.count -= 1;
    } else {
      let elapsed = currentTime - this.startTime;

      if (elapsed > this.duration) {
        elapsed = this.duration;
      }

      const diff = this.endValue - this.startValue;

      const interval = Math.round(
        this.startValue + (diff / this.duration) * elapsed,
      );

      if (elapsed === this.duration || interval === this.endValue) {
        this.stop();
        if (this.stopFunction) {
          this.stopFunction();
        }
      } else if (this.updateFunction) {
        this.updateFunction(interval);
      }
    }
  }

  /**
   * Restarts the transition with new start and end values, keeping the existing callbacks and duration
   * @param {Number} currentTime the current timestamp in milliseconds
   * @param {Number} startValue the new value to begin transitioning from
   * @param {Number} endValue the new value to transition to
   */
  restart(currentTime, startValue, endValue) {
    this.start(
      currentTime,
      this.updateFunction,
      this.stopFunction,
      startValue,
      endValue,
      this.duration,
    );
    this.step(currentTime);
  }

  /**
   * Stops the transition by marking it as no longer in progress
   */
  stop() {
    this.inProgress = false;
  }
}
