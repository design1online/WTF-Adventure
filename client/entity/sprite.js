'use client'

/* global Image, document */
import Animation from './animation';
import log from '../lib/log';

export default class Sprite {
  constructor(sprite, scale) {
    // log.debug('Sprite - constructor()', sprite, scale);

    this.sprite = sprite;
    this.scale = scale;
    this.id = sprite.id;
    this.loaded = false;
    this.offsetX = 0;
    this.offsetY = 0;
    this.offsetAngle = 0;
    this.whiteSprite = { loaded: false };

    this.loadSpriteImgData();
  }

  loadSprite() {
    // log.debug('Sprite - loadSprite()', this.filepath);

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

  loadSpriteImgData() {
    log.debug('Sprite - loadSpriteImgData()', this.sprite);

    const { sprite } = this;

    this.filepath = `/img/${this.scale}/${this.id}.png`;
    this.animationData = sprite.animations;

    this.width = sprite.width;
    this.height = sprite.height;

    this.offsetX = sprite.offsetX !== undefined ? sprite.offsetX : -16;
    this.offsetY = sprite.offsetY !== undefined ? sprite.offsetY : -16;
    this.offfsetAngle = sprite.offsetAngle !== undefined ? sprite.offsetAngle : 0;
    this.loadSprite();
  }

  update(newScale) {
    log.debug('Sprite - update()');
    this.scale = newScale;

    this.loadSpriteImgData();
  }

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

  onLoad(callback) {
    log.debug('Sprite - onLoad()', callback);
    this.onLoadCallback = callback;
  }
}
