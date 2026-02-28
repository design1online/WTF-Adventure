import $ from 'jquery';

/**
 * Manages the abilities shortcut bar interface
 * @class
 */
export default class Abilities {
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
     * The ability shortcut bar container element
     * @type {jQuery}
     */
    this.shortcuts = $('#abilityShortcut');
  }

  /**
   * Returns the list element within the shortcuts container
   * @return {jQuery}
   */
  getList() {
    return this.shortcuts.find('ul');
  }
}
