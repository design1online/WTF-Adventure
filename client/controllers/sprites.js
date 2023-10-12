import $ from 'jquery';
import _ from 'underscore';
import Sprite from '../entity/sprite';
import Animation from '../entity/animation';
import log from '../lib/log';

/**
 * Class responsible for loading all the necessary sprites from the JSON.
 * @class
 */
export default class Sprites {
  /**
   * Default constructor
   * @param {Renderer} renderer instance of the renderer
   */
  constructor(renderer) {
    log.debug('Sprites - constructor()', renderer);

    /**
     * An instance of the game renderer
     * @type {Renderer}
     */
    this.renderer = renderer;

    /**
     * An array of sprites
     * @type {Sprite[]}
     */
    this.sprites = {};

    /**
     * An animation for sparks
     * @type {Animation}
     */
    this.sparksAnimation = null;

    /**
     * A callback function when all sprites are loaded
     * @type {Function}
     */
    this.loadedSpritesCallback = null;

    $.getJSON('/data/sprites.json', (json) => {
      this.loadSpriteData(json);
    });

    this.loadAnimations();
  }

  /**
   * Load data for a sprite
   * @param  {Array} spriteData an array of data for the sprites to load
   */
  loadSpriteData(spriteData) {
    log.debug('Sprites - loadSpriteData()', spriteData);

    _.each(spriteData, (sprite) => {
      this.sprites[sprite.id] = new Sprite(
        sprite,
        this.renderer.drawingScale,
      );
    });

    if (this.loadedSpritesCallback) {
      log.debug('Sprites - loadSpriteData() - Finished loading sprite data...', this.sprites);
      this.loadedSpritesCallback();
    }
  }

  /**
   * Load animations
   */
  loadAnimations() {
    log.debug('Sprites - loadAnimations()');
    this.sparksAnimation = new Animation('idle_down', 6, 0, 16, 16);
    this.sparksAnimation.setSpeed(120);
  }

  /**
   * Update sprites in the render loop
   */
  updateSprites() {
    log.debug('Sprites - updateSprites()', this.renderer.getDrawingScale());

    _.each(this.sprites, (sprite) => {
      sprite.update(this.renderer.getDrawingScale());
    });
  }

  /**
   * Once a sprite is loaded set the sprites callback
   * @param  {Function} callback the callback for the sprite
   */
  onLoadedSprites(callback) {
    log.debug('Sprites - onLoadedSprites()', callback);
    this.loadedSpritesCallback = callback;
  }
}
