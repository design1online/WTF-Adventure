import Entity from '../entity.js';

/**
 * Represents an item entity in the game world
 * @class
 */
export default class Item extends Entity {
  /**
   * Default constructor
   * @param {String} id the item type identifier
   * @param {String} instance the unique instance identifier
   * @param {Number} x the x-coordinate of the item
   * @param {Number} y the y-coordinate of the item
   */
  constructor(id, instance, x, y) {
    super(id, 'item', instance, x, y);

    /**
     * Whether this item is a static world item
     * @type {Boolean}
     */
    this.static = false;
    /**
     * Whether this item was dropped by a character
     * @type {Boolean}
     */
    this.dropped = false;
    /**
     * Whether this item is a shard
     * @type {Boolean}
     */
    this.shard = false;
    /**
     * The stack count of this item
     * @type {Number}
     */
    this.count = 1;
    /**
     * The ability index associated with this item
     * @type {Number}
     */
    this.ability = 0;
    /**
     * The level of the item's ability
     * @type {Number}
     */
    this.abilityLevel = 0;
    /**
     * The tier level of this item
     * @type {Number}
     */
    this.tier = 1;
    /**
     * The time in milliseconds before this item respawns
     * @type {Number}
     */
    this.respawnTime = 30000;
    /**
     * The duration in milliseconds of the despawn animation
     * @type {Number}
     */
    this.despawnDuration = 4000;
    /**
     * The delay in milliseconds before the item starts blinking
     * @type {Number}
     */
    this.blinkDelay = 20000;
    /**
     * The delay in milliseconds after blinking before the item despawns
     * @type {Number}
     */
    this.despawnDelay = 1000;
    /**
     * The timeout handle for the blink animation
     * @type {Object|null}
     */
    this.blinkTimeout = null;
    /**
     * The timeout handle for the despawn
     * @type {Object|null}
     */
    this.despawnTimeout = null;
  }

  /**
   * Clears timers and triggers a respawn if this is a static item
   */
  destroy() {
    if (this.blinkTimeout) {
      clearTimeout(this.blinkTimeout);
    }

    if (this.despawnTimeout) {
      clearTimeout(this.despawnTimeout);
    }

    if (this.static) {
      this.respawn();
    }
  }

  /**
   * Schedules the blink and despawn sequence for this item
   */
  despawn() {
    this.blinkTimeout = setTimeout(() => {
      if (this.blinkCallback) this.blinkCallback();

      this.despawnTimeout = setTimeout(() => {
        if (this.despawnCallback) this.despawnCallback();
      }, this.despawnDuration);
    }, this.blinkDelay);
  }

  /**
   * Schedules a respawn of this item after the respawn time
   */
  respawn() {
    setTimeout(() => {
      if (this.respawnCallback) {
        this.respawnCallback();
      }
    }, this.respawnTime);
  }

  /**
   * Returns the item data as an array
   * @return {Array}
   */
  getData() {
    return [this.id, this.count, this.ability, this.abilityLevel];
  }

  /**
   * Returns the serializable state of this item including count and ability info
   * @return {Object}
   */
  getState() {
    const state = super.getState();

    state.count = this.count;
    state.ability = this.ability;
    state.abilityLevel = this.abilityLevel;

    return state;
  }

  /**
   * Sets the stack count of this item
   * @param {Number} count the new count value
   */
  setCount(count) {
    this.count = count;
  }

  /**
   * Sets the ability index of this item
   * @param {Number} ability the ability index
   */
  setAbility(ability) {
    this.ability = ability;
  }

  /**
   * Sets the ability level of this item
   * @param {Number} abilityLevel the new ability level
   */
  setAbilityLevel(abilityLevel) {
    this.abilityLevel = abilityLevel;
  }

  /**
   * Registers a callback for when the item respawns
   * @param {Function} callback the callback to invoke
   */
  onRespawn(callback) {
    /** @type {Function} */
    this.respawnCallback = callback;
  }

  /**
   * Registers a callback for when the item starts blinking
   * @param {Function} callback the callback to invoke
   */
  onBlink(callback) {
    /** @type {Function} */
    this.blinkCallback = callback;
  }

  /**
   * Registers a callback for when the item despawns
   * @param {Function} callback the callback to invoke
   */
  onDespawn(callback) {
    /** @type {Function} */
    this.despawnCallback = callback;
  }
}
