/**
 * Control animations for a sprite
 * @class
 */
export default class Animation {
  /**
   * Default constructor
   * @param {String} name   sprite sheet name
   * @param {Number} length frame length of the animation
   * @param {Number} row    row in the sprite sheet
   * @param {Number} width  width of 1 frame in the animation
   * @param {Number} height height of 1 frame in the animation
   */
  constructor(name, length, row, width, height) {
    /**
     * Sprite sheet
     * @type {String}
     */
    this.name = name;

    /**
     * Number of rames in the animation
     * @type {Number}
     */
    this.length = length;

    /**
     * Row of the animation in the sprite sheet
     * @type {Number}
     */
    this.row = row;

    /**
     * Width of 1 frame in the animation in pixels
     * @type {Number}
     */
    this.width = width;

    /**
     * Height of 1 frame in the animation in pixels
     * @type {Number}
     */
    this.height = height;

    /**
     * The current frame in the animation
     * @type {Number}
     */
    this.currentFrame = 0;

    /**
     * An internal counter for the callback
     * @type {Number}
     */
    this.count = 0;

    /**
     * End of counter calback function
     * @type {Function}
     */
    this.endCountCallback = null;

    /**
     * The last time the animation was updated
     * @type {Number}
     */
    this.lastTime = 0;

    /**
     * The speed of the animation in miliseconds
     * @type {Number}
     */
    this.speed = 1000;

    // set the baseline values
    this.reset();
  }

  /**
   * Grab the next frame in the animation
   * @return {Void}
   */
  tick() {
    let i = this.currentFrame.index;

    i = i < this.length - 1 ? i + 1 : 0;

    if (this.count > 0 && i === 0) {
      this.count -= 1;

      if (this.count === 0) {
        this.currentFrame.index = 0;
        this.endCountCallback();
        return;
      }
    }

    this.currentFrame.x = this.width * i;
    this.currentFrame.y = this.height * this.row;

    this.currentFrame.index = i;
  }

  /**
   * Update the animation over time by changing to the next frame
   * @param  {Number} time a duration of time
   * @return {Boolean} returns false if not ready to animate again
   */
  update(time) {
    if (this.lastTime === 0 && this.name.substr(0, 3) === 'atk') {
      this.lastTime = time;
    }

    if (this.readyToAnimate(time)) {
      this.lastTime = time;
      this.tick();

      return true;
    }
    return false;
  }

  /**
   * Set the counter for the callback, used for attack sequences
   * @param {Number} count      update the animation callback counter
   * @param {Function} onEndCount set the callback function when the count ends
   */
  setCount(count, onEndCount) {
    this.count = count;
    this.endCountCallback = onEndCount;
  }

  /**
   * Set the speed of the animation
   * @param {Number} speed in miliseconds
   */
  setSpeed(speed) {
    this.speed = speed;
  }

  /**
   * Set the row the animation is in
   * @param {Number} row row in the sprite sheet
   */
  setRow(row) {
    this.row = row;
  }

  /**
   * Figure out whether or not this animation is ready to animate again
   * @param  {Number} time time in miliseconds
   * @return {Boolean} returns true if difference between lasttime > speed
   */
  readyToAnimate(time) {
    return time - this.lastTime > this.speed;
  }

  /**
   * Reset the animation back to the beginning
   */
  reset() {
    this.lastTime = 0;
    this.currentFrame = {
      index: 0,
      x: 0,
      y: this.row * this.height,
    };
  }
}
