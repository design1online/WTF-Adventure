import $ from 'jquery';
import Timer from '../../utils/timer';

/**
 * A type of bubble
 * @class
 */
export default class Blob {
  /**
   * Default constructor
   * @param {String} id the unique identifier for this blob
   * @param {Number} time the creation timestamp in milliseconds
   * @param {Object} element the jQuery DOM element representing the bubble
   * @param {Number} duration the lifetime of the bubble in milliseconds
   */
  constructor(id, time, element, duration) {
    /**
     * Unique identifier for this blob instance
     * @type {String}
     */
    this.id = id;
    /**
     * The creation timestamp of this blob
     * @type {Number}
     */
    this.time = time;
    /**
     * The jQuery DOM element representing this bubble
     * @type {Object}
     */
    this.element = element;
    /**
     * The lifetime of this blob in milliseconds
     * @type {Number}
     */
    this.duration = duration || 5000;
    /**
     * Timer used to track when this blob should be removed
     * @type {Timer}
     */
    this.timer = new Timer(this.time, this.duration);
  }

  /**
   * Enables pointer events on the bubble element so it can be clicked
   */
  setClickable() {
    this.element.css('pointer-events', 'auto');
  }

  /**
   * Returns true if this blob's display duration has elapsed
   * @param {Number} time the current game timestamp in milliseconds
   * @return {Boolean}
   */
  isOver(time) {
    return this.timer.isOver(time);
  }

  /**
   * Resets the timer start time to extend the blob's visibility
   * @param {Number} time the new start timestamp in milliseconds
   */
  reset(time) {
    this.timer.time = time;
  }

  /**
   * Removes the bubble element from the DOM
   */
  destroy() {
    $(this.element).remove();
  }
}
