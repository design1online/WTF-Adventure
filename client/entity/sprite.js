'use client'

/* global Image, document */
import Animation from './animation';
import log from '../lib/log';

/**
 * Represents a sprite image used to render an entity on the canvas
 * @class
 */
export default class Sprite {
  /**
   * Default constructor
   * @param {Object} sprite the sprite data object containing image and animation metadata
   * @param {Number} scale the display scale factor for the sprite
   */
  constructor(sprite, scale) {
    // log.debug('Sprite - constructor()', sprite, scale);

    /**
     * The raw sprite data object
     * @type {Object}
     */
    this.sprite = sprite;
    /**
     * The display scale factor
     * @type {Number}
     */
    this.scale = scale;
    /**
     * The unique identifier of the sprite
     * @type {String}
     */
    this.id = sprite.id;
    /**
     * Whether the sprite image has finished loading
     * @type {Boolean}
     */
    this.loaded = false;
    /**
     * Horizontal draw offset in pixels
     * @type {Number}
     */
    this.offsetX = 0;
    /**
     * Vertical draw offset in pixels
     * @type {Number}
     */
    this.offsetY = 0;
    /**
     * Rotational offset angle in degrees
     * @type {Number}
     */
    this.offsetAngle = 0;
    /**
     * The hurt (white/red tint) version of this sprite
     * @type {Object}
     */
    this.whiteSprite = { loaded: false };

    this.loadSpriteImgData();
  }

  /**
   * Loads the sprite image from the filesystem path
   */
  loadSprite() {
    // log.debug('Sprite - loadSprite()', this.filepath);

    /** @type {Image} */
    this.image = new Image();
    this.image.crossOrigin = 'Anonymous';
    this.image.src = this.filepath;

    this.image.onload = () => {
      // log.debug('Sprite - loadSprite() - image loaded', this.filepath);
      this.loaded = true;

      if (this.onLoadCallback) {
        // log.debug('Sprite - loadSprite() - image loaded callback', this.onLoadCallback);
        this.onLoadCallback();
      }
    };
  }

  /**
   * Loads the sprite image data from the sprite object and triggers image loading
   */
  loadSpriteImgData() {
    log.debug('Sprite - loadSpriteImgData()', this.sprite);

    const { sprite } = this;

    /**
     * The file path to the sprite image
     * @type {String}
     */
    this.filepath = `/img/${this.scale}/${this.id}.png`;
    /**
     * The animation definitions for this sprite
     * @type {Object}
     */
    this.animationData = sprite.animations;

    /**
     * The width of a single sprite frame in pixels
     * @type {Number}
     */
    this.width = sprite.width;
    /**
     * The height of a single sprite frame in pixels
     * @type {Number}
     */
    this.height = sprite.height;

    this.offsetX = sprite.offsetX !== undefined ? sprite.offsetX : -16;
    this.offsetY = sprite.offsetY !== undefined ? sprite.offsetY : -16;
    /** @type {Number} */
    this.offfsetAngle = sprite.offsetAngle !== undefined ? sprite.offsetAngle : 0;
    this.loadSprite();
  }

  /**
   * Updates the sprite scale and reloads sprite image data
   * @param {Number} newScale the new scale factor to apply
   */
  update(newScale) {
    log.debug('Sprite - update()');
    this.scale = newScale;

    this.loadSpriteImgData();
  }

  /**
   * Creates Animation instances from the animation data for this sprite
   * @return {Object} a map of animation name to Animation instance
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
   * This is when an entity gets hit, they turn red then white.
   */

  createHurtSprite() {
    if (!this.loaded) {
      log.debug('Sprite - createHurtSprite()');
      this.loadSprite();
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
   * Returns the hurt sprite, creating it if it has not been created yet
   * @return {Object} the white/hurt sprite object or null if unavailable
   */
  getHurtSprite() {
    log.debug('Sprite - getHurtSprite()');

    try {
      if (!this.loaded) {
        this.loadSprite();
      }

      this.createHurtSprite();

      return this.whiteSprite;
    } catch (e) {
      log.debug('Sprite - getHurtSprite() - error', e);
      return null;
    }
  }

  /**
   * Registers a callback to be invoked when the sprite image has finished loading
   * @param {Function} callback the function to call when the image loads
   */
  onLoad(callback) {
    log.debug('Sprite - onLoad()', callback);
    /** @type {Function} */
    this.onLoadCallback = callback;
  }
}
