import $ from 'jquery';
import _ from 'underscore';
import Pointer from '../renderer/pointers/pointer';
import Module from '../utils/modules';
import log from '../lib/log';

/**
 * Handles the cursor on the HTML5 canvas, different pointers
 * can be swapped out depending on the entity the player is
 * interacting with, this holds all of the individual pointers
 * whereas {@link Pointer} holds a specific/individual cursor
 * @class
 */
export default class Cursor {
  /**
   * Default constructor
   * @param {Game} game instance of the game
   */
  constructor(game) {
    /**
     * Instance of the game
     * @type {Game}
     */
    this.game = game;

    /**
     * Pointer from the renderer
     * @type {Pointer}
     */
    this.pointers = {};

    /**
     * Scale of the device
     * @type {Number}
     */
    this.scale = this.getScale();

    /**
     * The camera used for the pointer
     * @type {Camera}
     */
    this.camera = null;

    /**
     * Jquery referencce to the bubble message box
     * @type {DOMElement}
     */
    this.container = $('#bubbles');
  }

  /**
   * Create a new cursor
   * @param  {Number} id   ID of the cursor
   * @param  {String} type type of the pointer
   */
  create(id, type) {
    if (id in this.pointers) {
      return;
    }

    const element = $(`<div id="${id}" class="pointer"></div>`);

    this.setSize(element);
    this.container.append(element);
    this.pointers[id] = new Pointer(id, element, type);
  }

  /**
   * Handle resizing the cursors
   */
  resize() {
    _.each(this.pointers, (pointer) => {
      switch (pointer.type) {
        case Module.Pointers.Relative:
          const scale = this.getScale(); // eslint-disable-line
          const x = pointer.x; // eslint-disable-line
          const y = pointer.y; // eslint-disable-line
          let offsetX = 0; // eslint-disable-line
          let offsetY = 0; // eslint-disable-line

          if (scale === 1) {
            offsetX = pointer.element.width() / 2 + 5;
            offsetY = pointer.element.height() / 2 - 4;
          }

          pointer.element.css('left', `${(x * scale) - offsetX}px`);
          pointer.element.css('top', `${(y * scale) - offsetY}px`);
          break;
        default:
          break;
      }
    });
  }

  /**
   * Set the size of the cursors
   */
  setSize(element) {
    const width = 8;
    const height = width + (width * 0.2);
    const image = 'url("/img/common/hud-active.png")';

    this.updateScale();

    element.css({
      width: `${width * this.scale}px`,
      height: `${height * this.scale}px`,
      margin: 'inherit',
      'margin-top': `-${(height / 2) * this.scale}px`,
      'margin-left': '1px',
      top: `${height * this.scale}px`,
      background: image,
      'background-size': '100% 100%',
    });
  }

  /**
   * Destroy all the cursors
   */
  clean() {
    _.each(this.pointers, (pointer) => {
      pointer.destroy();
    });

    this.pointers = {};
  }

  /**
   * Destroy a specific cursor
   * @param  {Pointer} pointer An instance of the cursor
   */
  destroy(pointer) {
    delete this.pointers[pointer.id];
    pointer.destroy();
  }

  /**
   * Set the position of the cursor
   * @param {Pointer} pointer Instance of the pointer to move
   * @param {Number} posX    X position
   * @param {Number} posY    Y position
   */
  set(pointer, posX, posY) {
    this.updateScale();
    this.updateCamera();

    const tileSize = 16 * this.scale;
    const x = ((posX - this.camera.x) * this.scale);
    const width = parseInt(pointer.element.css('width') + 24, 10);
    const offset = (width / 2) - (tileSize / 2);
    const y = ((posY - this.camera.y) * this.scale) - tileSize;

    pointer.element.css('left', `${x - offset}px`);
    pointer.element.css('top', `${y}px`);
  }

  /**
   * Set the cursor to a specific entity
   * @param {Entity} entity an instance of the entity
   */
  setToEntity(entity) {
    log.debug('Cursor - setToEntity()', entity);

    const pointer = this.get(entity.id);

    if (!pointer) {
      return;
    }

    this.set(pointer, entity.x, entity.y);
  }

  /**
   * Set the pointer to this x and y position
   * @param {Number} id the pointer's id
   * @param {Number}  x the x coordinate
   * @param {Number}  y the y coordinate
   */
  setToPosition(id, x, y) {
    const pointer = this.get(id);

    if (!pointer) {
      return;
    }

    pointer.setPosition(x, y);
    this.set(pointer, x, y);
  }

  /**
   * Set this pointer to a relative position
   * based on the scale of the screen
   * @param {Number} id the pointer's id
   * @param {Number}  x the x coordinate
   * @param {Number}  y the y coordinate
   */
  setRelative(id, x, y) {
    const pointer = this.get(id);

    if (!pointer) {
      return;
    }

    const scale = this.getScale();
    let offsetX = 0;
    let offsetY = 0;

    /**
     * Must be set in accordance to the lowest scale.
     */
    if (scale === 1) {
      offsetX = pointer.element.width() / 2 + 5;
      offsetY = pointer.element.height() / 2 - 4;
    }

    pointer.setPosition(x, y);
    pointer.element.css('left', `${(x * scale) - offsetX}px`);
    pointer.element.css('top', `${(y * scale) - offsetY}px`);
  }

  /**
   * Update the pointer in the render loop
   */
  update() {
    _.each(this.pointers, (pointer) => {
      switch (pointer.type) {
        case Module.Pointers.Entity:
          const entity = this.game.entities.get(pointer.id); // eslint-disable-line

          if (entity) {
            this.setToEntity(entity);
          } else {
            this.destroy(pointer);
          }
          break;
        case Module.Pointers.Position:
          if (pointer.x !== -1 && pointer.y !== -1) {
            this.set(pointer, pointer.x, pointer.y);
          }
          break;
        default:
          break;
      }
    });
  }

  /**
   * Return a specific pointer
   * @param  {Number} id the pointer's id
   * @return {Pointer} the pointer
   */
  get(id) {
    if (id in this.pointers) {
      return this.pointers[id];
    }

    return null;
  }

  /**
   * Update the scale of the pointer
   */
  updateScale() {
    this.scale = this.getDrawingScale();
  }

  /**
   * Update the camera reference with the
   * game renderer camera reference
   */
  updateCamera() {
    this.camera = this.game.renderer.camera;
  }

  /**
   * Return the current scale of the pointer
   * @return {Number} the scale
   */
  getScale() {
    return this.game.getScaleFactor();
  }

  /**
   * Return the renderer's drawing scale
   * @return {Number} the actual renderer calculated drawing scale
   */
  getDrawingScale() {
    return this.game.renderer.getDrawingScale();
  }
}
