/**
 * Represents a floating text label that fades out over time
 * @class
 */
export default class Splat {
  /**
   * Default constructor
   * @param {String} id the unique identifier for this splat
   * @param {String} type the category of splat (e.g. damage, heal)
   * @param {String} text the text content to display
   * @param {Number} x the initial x position in world coordinates
   * @param {Number} y the initial y position in world coordinates
   * @param {Boolean} statique when true the splat does not drift upward
   */
  constructor(id, type, text, x, y, statique) {
    /**
     * Unique identifier for this splat instance
     * @type {String}
     */
    this.id = id;
    /**
     * The category of this splat
     * @type {String}
     */
    this.type = type;
    /**
     * The text content to display
     * @type {String}
     */
    this.text = text;
    /**
     * The x position in world coordinates
     * @type {Number}
     */
    this.x = x;
    /**
     * The y position in world coordinates
     * @type {Number}
     */
    this.y = y;

    /**
     * When true the splat stays fixed in place rather than drifting upward
     * @type {Boolean}
     */
    this.statique = statique;

    /**
     * The current opacity of the splat (0.0 to 1.0)
     * @type {Number}
     */
    this.opacity = 1.0;
    /**
     * The timestamp of the last tick update
     * @type {Number}
     */
    this.lastTime = 0;
    /**
     * The minimum milliseconds between tick updates
     * @type {Number}
     */
    this.speed = 100;

    /**
     * The total duration in milliseconds before the splat fully disappears
     * @type {Number}
     */
    this.duration = 1000;
  }

  /**
   * Sets the fill and stroke colours used when rendering this splat
   * @param {String} fill the fill colour
   * @param {String} stroke the stroke colour
   */
  setColours(fill, stroke) {
    /** @type {String} */
    this.fill = fill;
    /** @type {String} */
    this.stroke = stroke;
  }

  /**
   * Overrides the default fade duration for this splat
   * @param {Number} duration the new duration in milliseconds
   */
  setDuration(duration) {
    this.duration = duration;
  }

  /**
   * Advances the splat one step, moving it upward and reducing its opacity
   */
  tick() {
    if (!this.statique) {
      this.y -= 1;
    }

    this.opacity -= 70 / this.duration;

    if (this.opacity < 0) {
      this.destroy();
    }
  }

  /**
   * Triggers a tick if enough time has elapsed since the last update
   * @param {Number} time the current game timestamp in milliseconds
   */
  update(time) {
    if (time - this.lastTime > this.speed) {
      this.lastTime = time;
      this.tick();
    }
  }

  /**
   * Fires the destroy callback to remove this splat from the info manager
   */
  destroy() {
    if (this.destroyCallback) {
      this.destroyCallback(this.id);
    }
  }

  /**
   * Registers a callback to be invoked when this splat is destroyed
   * @param {Function} callback called with the splat id when destroyed
   */
  onDestroy(callback) {
    /** @type {Function} */
    this.destroyCallback = callback;
  }
}
