import Entity from '../entity.js';
import Utils from '../../../util/utils.js';

/**
 * Represents a chest entity that can contain items
 * @class
 */
export default class Chest extends Entity {
  /**
   * Default constructor
   * @param {String} id the chest type identifier
   * @param {String} instance the unique instance identifier
   * @param {Number} x the x-coordinate of the chest
   * @param {Number} y the y-coordinate of the chest
   */
  constructor(id, instance, x, y) {
    super(id, 'chest', instance, x, y);

    /**
     * How long in milliseconds before the chest respawns
     * @type {Number}
     */
    this.respawnDuration = 25000; // Every 25 seconds
    /**
     * Whether this chest is a static world chest
     * @type {Boolean}
     */
    this.static = false;

    /**
     * The list of items this chest can contain
     * @type {Array}
     */
    this.items = [];
  }

  /**
   * Triggers the open callback for this chest
   */
  openChest() {
    if (this.openCallback) {
      this.openCallback();
    }
  }

  /**
   * Schedules a respawn of the chest after the respawn duration
   */
  respawn() {
    setTimeout(() => {
      if (this.respawnCallback) this.respawnCallback();
    }, this.respawnDuration);
  }

  /**
   * Returns a random item from this chest's items list
   * @return {Object|null}
   */
  getItem() {
    const random = Utils.randomInt(0, this.items.length - 1);
    const item = this.items[random];

    if (!item) {
      return null;
    }

    return item;
  }

  /**
   * Registers a callback for when the chest is opened
   * @param {Function} callback the callback to invoke
   */
  onOpen(callback) {
    /** @type {Function} */
    this.openCallback = callback;
  }

  /**
   * Registers a callback for when the chest respawns
   * @param {Function} callback the callback to invoke
   */
  onRespawn(callback) {
    /** @type {Function} */
    this.respawnCallback = callback;
  }
}
