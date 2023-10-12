import Entity from '../entity';

/**
* This os an object type of {@link Entity}
* @class
*/
export default class Chest extends Entity {
  /**
   * Default constructor
   * @param {Number} id    id for the entity
   * @param {String} kind  type of the entity
   */
  constructor(id, kind) {
    super(id, kind);

    /**
     * The type of the entity
     * @type {String}
     */
    this.type = 'chest';
  }

  /**
   * Idle animation
   */
  idle() {
    this.setAnimation('idle_down', 150);
  }

  /**
   * Stops the idle animation
   */
  stop() {
    this.setAnimation('idle_down', 150);
  }
}
