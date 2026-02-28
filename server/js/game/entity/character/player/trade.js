import Modules from '../../../../util/modules.js';

/**
 * We maintain a trade instance for every player,
 * and we trigger it whenever the trading is
 * started and/or requested.
 */
/**
 * Manages a player's trade session with another player
 * @class
 */
export default class Trade {
  /**
   * Default constructor
   * @param {Player} player the player who owns this trade instance
   */
  constructor(player) {
    /**
     * The player who owns this trade instance
     * @type {Player}
     */
    this.player = player;
    /**
     * The other player involved in the trade
     * @type {Player}
     */
    this.oPlayer = null;
    /**
     * The player who was requested to trade
     * @type {Player}
     */
    this.requestee = null;
    /**
     * The current state of the trade session
     * @type {String}
     */
    this.state = null;
    /**
     * The sub-state of the trade (e.g. accepted)
     * @type {String}
     */
    this.subState = null;
    /**
     * Items offered by this player in the trade
     * @type {Array}
     */
    this.playerItems = [];
    /**
     * Items offered by the other player in the trade
     * @type {Array}
     */
    this.oPlayerItems = [];
  }

  /**
   * Starts the trade session with the requestee
   */
  start() {
    this.oPlayer = this.requestee;
    this.state = Modules.Trade.Started;
  }

  /**
   * Stops and resets the trade session
   */
  stop() {
    this.oPlayer = null;
    this.state = null;
    this.subState = null;
    this.requestee = null;
    this.playerItems = [];
    this.oPlayerItems = [];
  }

  /**
   * Finalizes the trade by transferring items between inventories
   */
  finalize() {
    if (!this.player.inventory.containsSpaces(this.oPlayerItems.length)) {
      return;
    }

    for (const i in this.oPlayerItems) {
      const item = this.oPlayerItems[i];

      if (item && item.id !== -1) {
        this.oPlayer.inventory.remove(item.id, item.count, item.index);
        this.player.inventory.add(item);
      }
    }
  }

  /**
   * Selects an inventory slot to include in the trade offer
   * @param {Number} slot the inventory slot index to select
   */
  select(slot) {
    const item = this.player.inventory.slots[slot];

    if (!item || item.id === -1 || this.playerItems.indexOf(item) < 0) {
      return;
    }

    this.playerItems.push(item);
  }

  /**
   * Sends a trade request to another player
   * @param {Player} oPlayer the player to request a trade with
   */
  request(oPlayer) {
    this.requestee = oPlayer;

    if (oPlayer.trade.getRequestee() === this.player.instance) {
      this.start();
    }
  }

  /**
   * Marks this player as accepting the trade and finalizes if both have accepted
   */
  accept() {
    this.subState = Modules.Trade.Accepted;

    if (this.oPlayer.trade.subState === Modules.Trade.Accepted) {
      this.finalize();
      this.oPlayer.trade.finalize();
    }
  }

  /**
   * Returns the instance ID of the requestee, or null if none
   * @return {String}
   */
  getRequestee() {
    if (!this.requestee) {
      return null;
    }

    return this.requestee.instance;
  }

  /**
   * Declines the trade and stops the session
   */
  decline() {
    this.stop();
  }

  /**
   * Returns whether the trade session has been started
   * @return {Boolean}
   */
  isStarted() {
    return this.state !== null;
  }
}
