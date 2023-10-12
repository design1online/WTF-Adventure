import $ from 'jquery';
import Inventory from '../interface/inventory';
import Profile from '../interface/profile/profile';
import Actions from '../interface/actions';
import Bank from '../interface/bank';
import Enchant from '../interface/enchant';
import Warp from '../interface/warp';
import log from '../lib/log';

/**
 * Handles game UI interfaces
 * @class
 */
export default class Interface {
  /**
   * Default constructor
   * @param {Game} game instance of the game
   */
  constructor(game) {
    /**
     * An instance of the game
     * @type {Game}
     */
    this.game = game;

    /**
     * Jquery DOM reference to the notifcations box
     * @type {DOMElement}
     */
    this.notify = $('#notify');

    /**
     * Jquery DOM reference to the confirm box
     * @type {DOMElement}
     */
    this.confirm = $('#confirm');

    /**
     * Jquery DOM reference to the message box
     * @type {DOMElement}
     */
    this.message = $('#message');

    /**
     * Jquery DOM reference to the notifcations fading out
     * @type {DOMElement}
     */
    this.fade = $('#notifFade');

    /**
     * Jquery DOM reference to the notifcations done button
     * @type {DOMElement}
     */
    this.done = $('#notifyDone');

    /**
     * A reference to the inventory class
     * @type {Inventory}
     */
    this.inventory = null;

    /**
     * A reference to the player's profile class
     * @type {Profile}
     */
    this.profile = null;

    /**
     * A reference to player click interactions
     * @type {Actions}
     */
    this.actions = null;

    /**
     * A reference to player's bank
     * @type {Bank}
     */
    this.bank = null;

    /**
     * A reference to the player's magic
     * @type {Enchant}
     */
    this.enchant = null;

    /**
     * A reference to warp map
     * @type {Warp}
     */
    this.warp = null;

    // load the good stuff
    this.loadNotifications();
    this.loadActions();
    this.loadWarp();

    this.done.click(() => {
      this.hideNotify();
    });
  }

  /**
   * Handles resizing the interface elements by calling
   * each UI element's unique resize functionality
   */
  resize() {
    if (this.inventory) {
      this.inventory.resize();
    }

    if (this.profile) {
      this.profile.resize();
    }

    if (this.bank) {
      this.bank.resize();
    }

    if (this.enchant) {
      this.enchant.resize();
    }
  }

  /**
   * This can be called multiple times and can be used
   * to completely refresh the inventory.
   * @param {Number} size how large the inventory is
   * @param {Object} data the player's inventory items from the server
   */
  loadInventory(size, data) {
    this.inventory = new Inventory(this.game, size);
    this.inventory.loadInventory(data);
  }

  /**
   * Similar structure as the inventory, just that it
   * has two containers. The bank and the inventory.
   * @param {Number} size how large the inventory is
   * @param {Object} data the player's bank information
   */
  loadBank(size, data) {
    this.bank = new Bank(this.game, this.inventory.container, size);
    this.bank.loadBank(data);

    // @TODO why is load enchant in load bank??
    this.loadEnchant();
  }

  /**
   * Load the player's profile
   */
  loadProfile() {
    if (!this.profile) {
      this.profile = new Profile(this.game);
    }
  }

  /**
   * Load the player's click actions
   */
  loadActions() {
    if (!this.actions) {
      this.actions = new Actions(this);
    }
  }

  /**
   * Load the player's magic enchantments
   */
  loadEnchant() {
    if (!this.enchant) {
      this.enchant = new Enchant(this.game, this);
    }
  }

  /**
   * Load warp map
   */
  loadWarp() {
    if (!this.warp) {
      this.warp = new Warp(this.game, this);
    }
  }

  /**
   * Load the player's current notifications
   */
  loadNotifications() {
    const ok = $('#ok');
    const cancel = $('#cancel');
    const done = $('#done');

    /**
     * Simple warning dialogue
     */
    ok.click(() => {
      log.debug('Client - loadNotifications() - dialog ok clicked');
      this.hideNotify();
    });

    /**
     * Callbacks responsible for
     * Confirmation dialogues
     */
    cancel.click(() => {
      log.debug('Client - loadNotifications() - dialog cancel clicked');
      this.hideConfirm();
    });

    /**
     * Callback responsible for dismissing the dialog box
     */
    done.click(() => {
      log.debug('Client - loadNotifications() - dialog done clicked');
      this.hideConfirm();
    });
  }

  /**
   * Hides all interface menus
   */
  hideAll() {
    if (this.inventory && this.inventory.isVisible()) {
      this.inventory.hide();
    }

    if (this.actions && this.actions.isVisible()) {
      this.actions.hide();
    }

    if (
      this.profile
      && (this.profile.isVisible() || this.profile.settings.isVisible())
    ) this.profile.hide();

    if (
      this.game.input
      && this.game.input.chatHandler
      && this.game.input.chatHandler.input.is(':visible')
    ) {
      this.game.input.chatHandler.hideInput();
    }

    if (this.bank && this.bank.isVisible()) {
      this.bank.hide();
    }

    if (this.enchant && this.enchant.isVisible()) {
      this.enchant.hide();
    }

    if (this.warp && this.warp.isVisible()) {
      this.warp.hide();
    }
  }

  /**
   * Display a notification if not already visible
   * @param  {String} message the message to display
   */
  displayNotify(message) {
    if (this.isNotifyVisible()) {
      return;
    }

    this.notify.css('display', 'block');
    this.fade.css('display', 'block');
    this.message.css('display', 'block');

    this.message.text(message);
  }

  /**
   * Display the confirmation box
   * @param  {[type]} message The confirmation message
   */
  displayConfirm(message) {
    if (this.isConfirmVisible()) {
      return;
    }

    this.confirm.css('display', 'block');
    this.confirm.text(message);
  }

  /**
   * Hide the notifications window
   */
  hideNotify() {
    this.fade.css('display', 'none');
    this.notify.css('display', 'none');
    this.message.css('display', 'none');
  }

  /**
   * Hide the confirmation window
   */
  hideConfirm() {
    this.confirm.css('display', 'none');
  }

  /**
   * Return a reference to the profile quests
   * @return {Quest} The quests for this player
   */
  getQuestPage() {
    return this.profile.quests;
  }

  /**
   * Checks to see if the notifications window is visible or not
   * @return {Boolean} the status of the notifications window
   */
  isNotifyVisible() {
    return this.notify.css('display') === 'block';
  }

  /**
   * Check if the confirmation box is visible
   * @return {Boolean} the status of the confirmation window
   */
  isConfirmVisible() {
    return this.confirm.css('display') === 'block';
  }
}
