import $ from 'jquery';
import Packets from '../network/packets';

/**
 * Manages the world map warp interface for fast-travelling between locations
 * @class
 */
export default class Warp {
  /**
   * Default constructor
   * @param {Game} game an instance of the game
   */
  constructor(game) {
    /**
     * The game instance
     * @type {Game}
     */
    this.game = game;
    /**
     * The map frame dialog element
     * @type {jQuery}
     */
    this.mapFrame = $('#mapFrame');
    /**
     * The HUD world map toggle button element
     * @type {jQuery}
     */
    this.warp = $('#hud-world');
    /**
     * The close button element for the map frame
     * @type {jQuery}
     */
    this.close = $('#closeMapFrame');
    /**
     * The number of warp destinations loaded
     * @type {Number}
     */
    this.warpCount = 0;
    this.loadWarp();
  }

  /**
   * Binds click handlers for the warp toggle button, close button, and warp destination buttons
   */
  loadWarp() {
    this.warp.click(() => {
      this.toggle();
    });

    this.close.click(() => {
      this.hide();
    });

    for (let i = 1; i < 7; i += 1) {
      const warp = this.mapFrame.find(`#warp${i}`);

      if (warp) {
        warp.click((event) => {
          this.hide();

          this.game.socket.send(Packets.Warp, [
            event.currentTarget.id.substring(4),
          ]);
        });
      }
    }
  }

  /**
   * Just so it fades out nicely.
   */
  toggle() {
    if (this.isVisible()) {
      this.hide();
    } else {
      this.display();
    }
  }

  /**
   * Returns the current scale factor from the game
   * @return {Number}
   */
  getScale() {
    return this.game.getScaleFactor();
  }

  /**
   * Returns whether the map frame is currently visible
   * @return {Boolean}
   */
  isVisible() {
    return this.mapFrame.css('display') === 'block';
  }

  /**
   * Shows the map frame with a slow fade-in
   */
  display() {
    this.mapFrame.fadeIn('slow');
  }

  /**
   * Hides the map frame with a fast fade-out
   */
  hide() {
    this.mapFrame.fadeOut('fast');
  }
}
