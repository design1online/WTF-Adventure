import GamePage from './gamePage';

/**
 * Represents the abilities/skills profile page
 * @class
 */
export default class Ability extends GamePage {
  /**
   * Default constructor
   * @param {Game} game an instance of the game
   */
  constructor(game) {
    super('#skillPage');
    /**
     * The game instance
     * @type {Game}
     */
    this.game = game;
  }
}
