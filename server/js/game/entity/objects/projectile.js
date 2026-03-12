import Entity from '../entity.js';

/**
 * Represents a projectile entity fired during ranged combat
 * @class
 */
export default class Projectile extends Entity {
  /**
   * Default constructor
   * @param {String} id the projectile type identifier
   * @param {String} instance the unique instance identifier
   */
  constructor(id, instance) {
    super(id, 'projectile', instance);

    /**
     * The starting x-coordinate of the projectile
     * @type {Number}
     */
    this.startX = -1;
    /**
     * The starting y-coordinate of the projectile
     * @type {Number}
     */
    this.startY = -1;
    /**
     * The destination x-coordinate of the projectile
     * @type {Number}
     */
    this.destX = -1;
    /**
     * The destination y-coordinate of the projectile
     * @type {Number}
     */
    this.destY = -1;
    /**
     * The target entity this projectile is aimed at
     * @type {Entity|null}
     */
    this.target = null;
    /**
     * The amount of damage this projectile deals
     * @type {Number}
     */
    this.damage = -1;
    /**
     * The hit type of this projectile
     * @type {Number|null}
     */
    this.hitType = null;
    /**
     * The character that fired this projectile
     * @type {Character|null}
     */
    this.owner = null;
  }

  /**
   * Sets the starting position of the projectile
   * @param {Number} x the starting x-coordinate
   * @param {Number} y the starting y-coordinate
   */
  setStart(x, y) {
    /** @type {Number} */
    this.x = x;
    /** @type {Number} */
    this.y = y;
  }

  /**
   * Sets the target entity and updates the destination coordinates
   * @param {Entity} target the target entity
   */
  setTarget(target) {
    this.target = target;

    this.destX = target.x;
    this.destY = target.y;
  }

  /**
   * Sets a static destination for the projectile
   * @param {Number} x the destination x-coordinate
   * @param {Number} y the destination y-coordinate
   */
  setStaticTarget(x, y) {
    /** @type {Boolean} */
    this.static = true;

    this.destX = x;
    this.destY = y;
  }

  /**
   * Returns a plain object representation of the projectile data
   * @return {Object|null}
   */
  getData() {
    /**
     * Cannot generate a projectile
     * unless it has a target.
     */

    if (!this.owner || !this.target) {
      return null;
    }

    return {
      id: this.instance,
      name: this.owner.projectileName,
      characterId: this.owner.instance,
      targetId: this.target.instance,
      damage: this.damage,
      special: this.special,
      hitType: this.hitType,
      type: this.type,
    };
  }
}
