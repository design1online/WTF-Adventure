import _ from 'underscore';
import $ from 'jquery';
import Blob from '../renderer/bubbles/blob';

/**
 * Creates player speach bubbles
 * @class
 */
export default class Bubble {
  /**
   * Default constructor
   * @param {Game} game instance of the game class
   */
  constructor(game) {
    /**
     * Instance of the game object
     * @type {Game}
     */
    this.game = game;

    /**
     * An object with all of the bubbles to display
     * @type {Blob[]}
     */
    this.bubbles = {};

    /**
     * Jquery reference to the display bubble for text messages
     * @type {DOMElement}
     */
    this.container = $('#bubbles');
  }

  /**
   * Create a bubble message
   * @param  {Number} id       the id of the bubble message
   * @param  {String} message  contents of the bubble
   * @param  {Number} time     when the bubble will reset
   * @param  {Number} [duration=5000] duration set on the Blob's internal Timer
   * @return {Blob} an instance of the bubble message
   */
  create(id, message, time, duration) {
    if (this.bubbles[id]) {
      this.bubbles[id].reset(time);
      $(`#${id} p`).html(message);
    } else {
      const element = $(`<div id='${id}' class='bubble'>
          <p>${message}</p>
          <div class='bubbleTip'></div>
        </div>`);

      $(element).appendTo(this.container);

      this.bubbles[id] = new Blob(id, time, element, duration);
    }

    return this.bubbles[id];
  }

  /**
   * Set a speech bubble to a specific entity
   * @param {Entity} entity an entity in the game
   * @return null, speech bubble shows in the location of the entity
   */
  setTo(entity) {
    const bubble = this.get(entity.id);

    if (!bubble || !entity) {
      return;
    }

    const scale = this.game.renderer.getDrawingScale();
    const tileSize = 16 * scale;
    const x = (entity.x - this.game.getCamera().x) * scale;
    const width = parseInt($(bubble.element).css('width'), 10) + 24;
    const offset = width / 2 - tileSize / 2;
    const offsetY = 10;
    const y = (entity.y - this.game.getCamera().y) * scale - tileSize * 2 - offsetY;

    $(bubble.element).css(
      'left',
      `${x - offset + (2 + this.game.renderer.scale)}px`,
    );
    $(bubble.element).css('top', `${y}px`);
  }

  /**
   * Update the display of the bubbles (automatically disappear over time)
   * @param {Number} time the current timestamp
   * @return null, deletes expired speech bubbles
   */
  update(time) {
    _.each(this.bubbles, (bubble) => {
      const entity = this.game.entities.get(bubble.id);

      if (entity) {
        this.setTo(entity);
      }

      if (bubble.isOver(time)) {
        bubble.destroy();
        delete this.bubbles[bubble.id];
      }
    });
  }

  /**
   * Fetch a specific bubble
   * @param {Number} id the id of the bubble message
   * @return {Bubble} an instance of the bubble message
   */
  get(id) {
    if (id in this.bubbles) {
      return this.bubbles[id];
    }

    return null;
  }

  /**
   * Destroy all the active bubbles
   * @return null, empty array of bubbles
   */
  clean() {
    _.each(this.bubbles, (bubble) => {
      bubble.destroy();
    });

    this.bubbles = {};
  }

  /**
   * Delete a specific bubble
   * @param {Number} id the id of the bubble message
   * @return null, the bubble is removed from the array
   */
  destroy(id) {
    const bubble = this.get(id);

    if (!bubble) {
      return;
    }

    bubble.destroy();

    delete this.bubbles[id];
  }
}
