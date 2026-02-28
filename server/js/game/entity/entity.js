// import log from '../../util/log';
import Messages from '../../network/messages.js';
import Mobs from '../../util/mobs.js';
import NPCs from '../../util/npcs.js';
import Items from '../../util/items.js';

/**
 * Base class for all entities in the game world
 * @class
 */
export default class Entity {
  /**
   * Default constructor
   * @param {String} id the entity type identifier
   * @param {String} type the entity type string (e.g. 'mob', 'player', 'npc')
   * @param {String} instance the unique instance identifier
   * @param {Number} x the x-coordinate of the entity
   * @param {Number} y the y-coordinate of the entity
   */
  constructor(id, type, instance, x, y) {
    /**
     * The entity type identifier
     * @type {String}
     */
    this.id = id;
    /**
     * The entity type string
     * @type {String}
     */
    this.type = type;
    /**
     * The unique instance identifier
     * @type {String}
     */
    this.instance = instance;
    /**
     * The previous x-coordinate of the entity
     * @type {Number}
     */
    this.oldX = x;
    /**
     * The previous y-coordinate of the entity
     * @type {Number}
     */
    this.oldY = y;
    /**
     * The current x-coordinate of the entity
     * @type {Number}
     */
    this.x = x;
    /**
     * The current y-coordinate of the entity
     * @type {Number}
     */
    this.y = y;

    /**
     * The combat instance associated with this entity
     * @type {Combat|null}
     */
    this.combat = null;

    /**
     * Whether this entity is dead
     * @type {Boolean}
     */
    this.dead = false;

    /**
     * Recently visited grid groups
     * @type {Array}
     */
    this.recentGroups = [];
  }

  /**
   * Returns the combat instance for this entity
   * @return {null}
   */
  getCombat() {
    return null;
  }

  /**
   * Calculates the distance to another entity using Chebyshev distance
   * @param {Entity} entity the target entity
   * @return {Number}
   */
  getDistance(entity) {
    const
      x = Math.abs(this.x - entity.x);


    const y = Math.abs(this.y - entity.y);

    return x > y ? x : y;
  }

  /**
   * Calculates the distance to a set of coordinates using Chebyshev distance
   * @param {Number} toX the target x-coordinate
   * @param {Number} toY the target y-coordinate
   * @return {Number}
   */
  getCoordDistance(toX, toY) {
    const
      x = Math.abs(this.x - toX);


    const y = Math.abs(this.y - toY);

    return x > y ? x : y;
  }

  /**
   * Returns whether this entity is adjacent to another entity
   * @param {Entity} entity the entity to check adjacency against
   * @return {Boolean}
   */
  isAdjacent(entity) {
    if (!entity) return false;

    return this.getDistance(entity) <= 1;
  }

  /**
   * Returns whether this entity is adjacent to another entity without diagonal overlap
   * @param {Entity} entity the entity to check
   * @return {Boolean}
   */
  isNonDiagonal(entity) {
    return (
      this.isAdjacent(entity) && !(entity.x !== this.x && entity.y !== this.y)
    );
  }

  /**
   * Returns whether this entity is within a given distance of another entity
   * @param {Entity} entity the entity to check proximity against
   * @param {Number} distance the maximum distance
   * @return {Boolean}
   */
  isNear(entity, distance) {
    let
      near = false;

    const dx = Math.abs(this.x - entity.x);


    const dy = Math.abs(this.y - entity.y);

    if (dx <= distance && dy <= distance) near = true;

    return near;
  }

  /**
   * Logs a notice when an unexpected talk action is triggered
   */
  talk() {
    log.notice('Who is screwing around with the client?');
  }

  /**
   * Creates a drop message for this entity
   * @param {Item} item the item to drop
   * @return {Messages.Drop}
   */
  drop(item) {
    return new Messages.Drop(this, item);
  }

  /**
   * Returns whether this entity is a player
   * @return {Boolean}
   */
  isPlayer() {
    return this.type === 'player';
  }

  /**
   * Returns whether this entity is a mob
   * @return {Boolean}
   */
  isMob() {
    return this.type === 'mob';
  }

  /**
   * Returns whether this entity is an NPC
   * @return {Boolean}
   */
  isNPC() {
    return this.type === 'npc';
  }

  /**
   * Returns whether this entity is an item
   * @return {Boolean}
   */
  isItem() {
    return this.type === 'item';
  }

  /**
   * Sets the position of this entity
   * @param {Number} x the new x-coordinate
   * @param {Number} y the new y-coordinate
   */
  setPosition(x, y) {
    this.x = x;
    this.y = y;

    if (this.setPositionCallback) this.setPositionCallback();
  }

  /**
   * Returns whether this entity has a special attack
   * @return {Boolean}
   */
  hasSpecialAttack() {
    return false;
  }

  /**
   * Saves the current position as the old position
   */
  updatePosition() {
    this.oldX = this.x;
    this.oldY = this.y;
  }

  /**
   * Registers a callback for when the entity's position is set
   * @param {Function} callback the callback to invoke
   */
  onSetPosition(callback) {
    /** @type {Function} */
    this.setPositionCallback = callback;
  }

  /**
   * Returns the serializable state of this entity
   * @return {Object}
   */
  getState() {
    const isNPC = this.isNPC()
      ? NPCs.idToString(this.id)
      : Items.idToString(this.id);

    const string = this.isMob()
      ? Mobs.idToString(this.id)
      : isNPC;

    const isMobNPC = this.isNPC()
      ? NPCs.idToName(this.id)
      : Items.idToName(this.id);

    const name = this.isMob()
      ? Mobs.idToName(this.id)
      : isMobNPC;

    return {
      type: this.type,
      id: this.instance,
      string,
      name: string,
      label: name,
      x: this.x,
      y: this.y,
    };
  }
}
