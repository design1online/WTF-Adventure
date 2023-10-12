import Module from '../utils/modules';

/**
 * Keeps track of the {@link Entity} direction
 * @class
 */
export default class Zone {
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
     * Instance of the game renderer
     * @type {Renderer}
     */
    this.renderer = game.renderer;

    /**
     * Instance of the game camera
     * @type {Camera}
     */
    this.camera = game.camera;

    /**
     * Instance of the game input
     * @type {Input}
     */
    this.input = game.input;

    /**
     * The direction
     * @type {Orientation}
     */
    this.direction = null;
  }

  /**
   * Reset the direction
   */
  reset() {
    this.direction = null;
  }

  /**
   * Set the direction to up
   */
  setUp() {
    this.direction = Module.Orientation.Up;
  }

  /**
   * Set the direction to down
   */
  setDown() {
    this.direction = Module.Orientation.Down;
  }

  /**
   * Set the direction to right
   */
  setRight() {
    this.direction = Module.Orientation.Right;
  }

  /**
   * Set the direction to right
   */
  setLeft() {
    this.direction = Module.Orientation.Left;
  }

  /**
   * Return the current direction
   * @return {Orientation} the direction for the zone
   */
  getDirection() {
    return this.direction;
  }
}
