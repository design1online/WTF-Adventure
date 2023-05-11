/* global Image, document */
import Animation from './animation';
import log from '../lib/log';

/**
 * A class for generating animations for sprites
 *
 * @class
 * @example const playerSprite = new Sprite(
 *  {
 *   id: 'player',
 *   animations: {
 *     idle: {
 *       length: 4,
 *       row: 0,
 *     },
 *   },
 *   width: 32,
 *   height: 32,
 *   offsetX: 0,
 *   offsetX: 0
 *   offsetAngle: 0
 *  }, 1);
 */
export default class Sprite {
  /**
   * Represents a sprite that can be rendered on the canvas.
   *
   * @constructor
   * @param {Object} sprite - An object containing information about the sprite.
   * @param {number} scale - The scale at which to render the sprite 1, 2, or 3.
   */
  constructor(sprite, scale) {
    // log.debug('Sprite - constructor()', sprite, scale);

    /**
     * Reference to the sprite info
     * @type {Object}
     */
    this.sprite = sprite;

    /**
     * Scale of the sprite
     * @type {number}
     */
    this.scale = scale;

    /**
     * Name of the sprite, used in the filepath
     * @type {string}
     */
    this.id = sprite.id;

    /**
     * If the sprite has been loaded or not,
     * and is set by the onLoadCallback
     * @type {boolean}
     * @see onLoadCallback
     */
    this.loaded = false;

    /**
     * Used for generating the hurt sprites
     * @type {Object}
     */
    this.whiteSprite = { loaded: false };

    /**
     * The path to load the spritesheet animations based
     * on the scale and id of the sprite
     * @type {string}
     */
    this.filepath = `assets/img/${this.scale}/${this.id}.png`;

    /**
     * Contains data for each sprite animation
     * @type {Object}
     */
    this.animationData = this.sprite.animations;

    /**
     * Holds the image generated for the sprite
     * @type {Image}
     */
    this.image = null;

    /**
     * Callback for loading the sprite animations,
     * sets the sprite to loaded once all animation
     * images are done loading
     * @type {Function}
     */
    this.onLoadCallback = null;

    /**
     * The width of the sprite
     * @type {number}
     */
    this.width = this.sprite.width;

    /**
     * The height of the sprite
     * @type {number}
     */
    this.height = this.sprite.height;

    /**
     * X offset for clipping out the sprite from the spritesheet,
     * defaults to -16
     * @type {number}
     */
    this.offsetX = this.sprite.offsetX !== undefined ? this.sprite.offsetX : -16;

    /**
     * Y offset for clipping out the sprite from the spritesheet,
     * defaults to -16
     * @type {number}
     */
    this.offsetY = this.sprite.offsetY !== undefined ? this.sprite.offsetY : -16;

    /**
     * Angle which the sprite is offset
     * @type {number}
     */
    this.offsetAngle = this.sprite.offsetAngle !== undefined ? this.sprite.offsetAngle : 0;

    // trigger the loading of the sprite
    this.load();
  }

  /**
  * Loads the sprite image from a file.
  */
  load() {
    log.debug('Sprite - load()', this.filepath);

    this.image = new Image();
    this.image.crossOrigin = 'Anonymous';
    this.image.src = this.filepath;

    this.image.onload = () => {
      log.debug('Sprite - load() - image loaded', this.filepath);
      this.loaded = true;

      if (this.onLoadCallback) {
        log.debug('Sprite - load() - image loaded callback', this.onLoadCallback);
        this.onLoadCallback();
      }
    };
  }

  /**
  * Updates the sprite's scale and reloads the sprite image.
  *
  * @param {number} newScale - The new scale to apply to the sprite.
  */
  update(newScale) {
    log.debug('Sprite - update()');
    this.scale = newScale;
    this.filepath = `assets/img/${this.scale}/${this.id}.png`;
    this.load();
  }

  /**
  * Creates an object containing Animation objects for each animation defined in the sprite data.
  *
  * @returns {Object} - An object containing Animation objects for each animation defined in the sprite data.
  */
  createAnimations() {
    log.debug('Sprite - createAnimations()');

    const animations = {};

    for (const name in this.animationData) { // eslint-disable-line
      if (this.animationData.hasOwnProperty(name)) { // eslint-disable-line
        const a = this.animationData[name];

        animations[name] = new Animation(
          name,
          a.length,
          a.row,
          this.width,
          this.height,
        );
      }
    }

    return animations;
  }

  /**
  * Creates a new sprite that is tinted red to indicate damage.
  * When an entity gets hit, they turn red then white.
  *
  * @returns {Object|null} - A new sprite that is tinted red, or null if an error occurs.
  */
  createHurtSprite() {
    if (!this.loaded) {
      log.debug('Sprite - createHurtSprite()');
      this.load();
    }

    if (this.whiteSprite.loaded) {
      return;
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    let spriteData;
    canvas.width = this.width;
    canvas.height = this.height;

    context.drawImage(this.image, 0, 0, this.image.width, this.image.height);

    try {
      spriteData = context.getImageData(
        0,
        0,
        this.image.width,
        this.image.height,
      );

      const {
        data,
      } = spriteData;

      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255;
        data[i + 1] = data[i + 2] = 75; // eslint-disable-line
      }

      spriteData.data = data;

      context.putImageData(spriteData, 0, 0);

      this.whiteSprite = {
        image: canvas,
        loaded: true,
        offsetX: this.offsetX,
        offsetY: this.offsetY,
        width: this.width,
        height: this.height,
      };
    } catch (e) {
      log.debug('Sprite - createHurtSprite() - error', e, this.image, spriteData);
    }
  }

  /**
  * Retrieves the previously created hurt sprite, or creates a new one if it hasn't been created yet.
  *
  * @returns {Object|null} - The hurt sprite, or null if an error occurs.
  */
  getHurtSprite() {
    log.debug('Sprite - getHurtSprite()');

    try {
      if (!this.loaded) {
        this.load();
      }

      this.createHurtSprite();

      return this.whiteSprite;
    } catch (e) {
      log.debug('Sprite - getHurtSprite() - error', e);
      return null;
    }
  }

  /**
  * Registers a callback function to be called when the sprite image finishes loading.
  *
  * @param {Function} callback - The callback function to be called.
  */
  onLoad(callback) {
    log.debug('Sprite - onLoad()', callback);
    this.onLoadCallback = callback;
  }
}
