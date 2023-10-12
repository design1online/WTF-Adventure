import Entity from '../entity';

/**
* This os an object type of {@link Entity}
* @class
*/
export default class Projectile extends Entity {
  /**
   * Default constructor
   * @param {Number} id     entity id number
   * @param {String} kind   type of projectile
   * @param {Entity} owner  who owns this projectile
   * @param {String} name   name of the projectile
   */
  constructor(id, kind, owner, name) {
    super(id, kind);

    /**
     * Owner of this projectile
     * @type {Entity}
     */
    this.owner = owner;

    /**
     * Name of the projectile
     * @type {String}
     */
    this.name = name || '';

    /**
     * X coordinate start position
     * @type {Number}
     */
    this.startX = -1;

    /**
     * Y coordinate start position
     * @type {Number}
     */
    this.startY = -1;

    /**
     * X coordinate destination
     * @type {Number}
     */
    this.destX = -1;

    /**
     * Y coordinate destination
     * @type {Number}
     */
    this.destY = -1;

    /**
     * Speed of the projectile
     * @type {Number}
     */
    this.speed = 200;

    /**
     * If this is a special projectile
     * @type {Number}
     */
    this.special = -1;

    /**
     * If this is a static projectile
     * @type {Boolean}
     */
    this.static = false;

    /**
     * If this is a dynamic projectile
     * @type {Boolean}
     */
    this.dynamic = false;

    /**
     * Angle of the projectile
     * @type {Number}
     */
    this.angle = 0;

    /**
     * Path of the projectile
     * @type {Boolean}
     */
    this.path = false;

    /**
     * Callback function for impact
     * @type {Function}
     */
    this.impactCallback = null;
  }

  /**
   * Return the ID
   * @return {Number}
   */
  getId() {
    return this.id;
  }

  /**
   * Check if this has made an impact
   */
  impact() {
    if (this.impactCallback) {
      this.impactCallback();
    }
  }

  /**
   * Set the starting point for the projectile
   * @param {Number} x  x coordinate
   * @param {Number} y  y coordinate
   */
  setStart(x, y) {
    this.setGridPosition(Math.floor(x / 16), Math.floor(y / 16));

    this.startX = x;
    this.startY = y;
  }

  /**
   * Set the projectile destination
   * @param {Number} x  x coordinate
   * @param {Number} y  y coordinate
   */
  setDestination(x, y) {
    this.static = true;

    this.destX = x;
    this.destY = y;

    this.updateAngle();
  }

  /**
   * Set the target for the projectile
   * @param {Entity} target the entity this is trying to hit
   * @return {Boolean}
   */
  setTarget(target) {
    if (!target) {
      return false;
    }

    this.dynamic = true;

    this.destX = target.x;
    this.destY = target.y;

    this.updateAngle();

    if (target.type !== 'mob') {
      return false;
    }

    target.onMove(() => {
      this.destX = target.x;
      this.destY = target.y;

      this.updateAngle();
    });

    return true;
  }

  /**
   * Gets the speed of the projectile
   * @return {Number} speed of the projectile
   */
  getSpeed() {
    return this.speed;
  }

  /**
   * Update the target location
   * @param  {Number} x x coordinate
   * @param  {Number} y y coordinate
   */
  updateTarget(x, y) {
    this.destX = x;
    this.destY = y;
  }

  /**
   * Return if this has a path
   * @return {Boolean}
   */
  hasPath() {
    return this.path;
  }

  /**
   * Update the angle of the projectile
   */
  updateAngle() {
    this.angle = Math.atan2(this.destY - this.y, this.destX - this.x)
      * (180 / Math.PI) - 90;
  }

  /**
   * Set the impact callback
   * @param  {Function} callback what happens if the projectile hits
   */
  onImpact(callback) {
    this.impactCallback = callback;
  }
}
