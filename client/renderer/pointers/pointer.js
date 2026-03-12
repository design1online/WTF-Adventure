/**
 * Represents a blinking on-screen pointer indicator
 * @class
 */
export default class Pointer {
  /**
   * Default constructor
   * @param {String} id the unique identifier for this pointer
   * @param {Object} element the jQuery DOM element representing the pointer
   * @param {Number} type the pointer type constant
   */
  constructor(id, element, type) {
    /**
     * Unique identifier for this pointer instance
     * @type {String}
     */
    this.id = id;
    /**
     * The jQuery DOM element for this pointer
     * @type {Object}
     */
    this.element = element;
    /**
     * The pointer type constant
     * @type {Number}
     */
    this.type = type;

    /**
     * The interval handle for the blink animation
     * @type {?number}
     */
    this.blinkInterval = null;
    /**
     * Whether the pointer is currently visible
     * @type {Boolean}
     */
    this.visible = true;

    /**
     * The x position of the pointer on screen
     * @type {Number}
     */
    this.x = -1;
    /**
     * The y position of the pointer on screen
     * @type {Number}
     */
    this.y = -1;

    this.loadPointer();
  }

  /**
   * Starts the blink interval that toggles pointer visibility every 600ms
   */
  loadPointer() {
    this.blinkInterval = setInterval(() => {
      if (this.visible) {
        this.hide();
      } else {
        this.show();
      }

      this.visible = !this.visible;
    }, 600);
  }

  /**
   * Stops the blink interval and removes the pointer element from the DOM
   */
  destroy() {
    clearInterval(this.blinkInterval);
    this.element.remove();
  }

  /**
   * Updates the stored screen position of this pointer
   * @param {Number} x the new x coordinate
   * @param {Number} y the new y coordinate
   */
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * Makes the pointer element visible
   */
  show() {
    this.element.css('display', 'block');
  }

  /**
   * Hides the pointer element
   */
  hide() {
    this.element.css('display', 'none');
  }
}
