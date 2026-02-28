import $ from 'jquery';

/**
 * Manages the context action menu interface for inventory and player interactions
 * @class
 */
export default class Actions {
  /**
   * Default constructor
   * @param {Interface} intrfce an instance of the game interface
   */
  constructor(intrfce) {
    /**
     * The game interface instance
     * @type {Interface}
     */
    this.interface = intrfce;

    /**
     * The main action container element
     * @type {jQuery}
     */
    this.body = $('#actionContainer');
    /**
     * The drop dialog element
     * @type {jQuery}
     */
    this.drop = $('#dropDialog');
    /**
     * The drop count input element
     * @type {jQuery}
     */
    this.dropInput = $('#dropCount');

    /**
     * The player actions container element
     * @type {jQuery}
     */
    this.pBody = $('#pActions');
    /**
     * The follow action button element
     * @type {jQuery}
     */
    this.follow = $('#follow');
    /**
     * The trade action button element
     * @type {jQuery}
     */
    this.trade = $('#tradeAction');

    /**
     * The currently active CSS class name
     * @type {String}
     */
    this.activeClass = null;

    /**
     * The currently active miscellaneous button
     * @type {jQuery}
     */
    this.miscButton = null;

    this.loadActions();
  }

  /**
   * Loads click handlers for drop accept and cancel buttons
   */
  loadActions() {
    const dropAccept = $('#dropAccept');
    const dropCancel = $('#dropcancel');

    dropAccept.click((event) => {
      if (this.activeClass === 'inventory') {
        this.interface.inventory.clickAction(event);
      }
    });

    dropCancel.click((event) => {
      if (this.activeClass === 'inventory') {
        this.interface.inventory.clickAction(event);
      }
    });
  }

  /**
   * Loads the default action buttons for the given active class
   * @param {String} activeClass the name of the currently active interface class
   */
  loadDefaults(activeClass) {
    this.activeClass = activeClass;

    switch (this.activeClass) {
      default:
        break;
      case 'inventory':
        const dropButton = $('<div id="drop" class="actionButton">Drop</div>'); // eslint-disable-line
        this.add(dropButton);
        break;

      case 'profile':
        break;
    }
  }

  /**
   * Adds a button to the action list and binds its click handler
   * @param {jQuery} button the button element to add
   * @param {Boolean} misc whether this is a miscellaneous button
   */
  add(button, misc) {
    this.body.find('ul').prepend($('<li></li>').append(button));

    button.click((event) => {
      if (this.activeClass === 'inventory') {
        this.interface.inventory.clickAction(event);
      }
    });

    if (misc) {
      this.miscButton = button;
    }
  }

  /**
   * Removes the miscellaneous button from the action list
   */
  removeMisc() {
    this.miscButton.remove();
    this.miscButton = null;
  }

  /**
   * Removes all action buttons from the list
   */
  reset() {
    const buttons = this.getButtons();

    for (let i = 0; i < buttons.length; i += 1) {
      $(buttons[i]).remove();
    }
  }

  /**
   * Shows the action container with a fast fade-in
   */
  show() {
    this.body.fadeIn('fast');
  }

  /**
   * Displays player-specific action buttons near the given coordinates
   * @param {Object} player the player entity to act on
   * @param {Number} mouseX the x coordinate of the mouse pointer
   * @param {Number} mouseY the y coordinate of the mouse pointer
   */
  showPlayerActions(player, mouseX, mouseY) {
    if (!player) return;

    this.pBody.fadeIn('fast');
    this.pBody.css({
      left: `${mouseX - this.pBody.width() / 2}px`,
      top: `${mouseY + this.pBody.height() / 2}px`,
    });

    this.follow.click(() => {
      this.getPlayer().follow(player);

      this.hidePlayerActions();
    });

    this.trade.click(() => {
      this.getGame().tradeWith(player);

      this.hidePlayerActions();
    });
  }

  /**
   * Hides the action container with a slow fade-out
   */
  hide() {
    this.body.fadeOut('slow');
  }

  /**
   * Hides the player actions panel with a fast fade-out
   */
  hidePlayerActions() {
    this.pBody.fadeOut('fast');
  }

  /**
   * Displays the drop dialog and focuses the count input
   * @param {String} activeClass the name of the currently active interface class
   */
  displayDrop(activeClass) {
    this.activeClass = activeClass;
    this.drop.fadeIn('fast');
    this.dropInput.focus();
    this.dropInput.select();
  }

  /**
   * Hides the drop dialog and clears the count input
   */
  hideDrop() {
    this.drop.fadeOut('slow');
    this.dropInput.blur();
    this.dropInput.val('');
  }

  /**
   * Returns all button list items in the action container
   * @return {jQuery}
   */
  getButtons() {
    return this.body.find('ul').find('li');
  }

  /**
   * Returns the game instance from the interface
   * @return {Game}
   */
  getGame() {
    return this.interface.game;
  }

  /**
   * Returns the local player from the game instance
   * @return {Player}
   */
  getPlayer() {
    return this.interface.game.player;
  }

  /**
   * Returns whether the action container is currently visible
   * @return {Boolean}
   */
  isVisible() {
    return this.body.css('display') === 'block';
  }
}
