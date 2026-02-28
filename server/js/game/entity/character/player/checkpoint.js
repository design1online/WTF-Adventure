/**
 * Represents a checkpoint associated with a player's position in the world
 * @class
 */
export default class Checkpoint {
  /**
   * Default constructor
   * @param {String} id the unique identifier of the checkpoint
   * @param {Player} player the player associated with this checkpoint
   */
  constructor(id, player) {
    /**
     * The unique identifier of this checkpoint
     * @type {String}
     */
    this.id = id;
    /**
     * The player associated with this checkpoint
     * @type {Player}
     */
    this.player = player;
    /**
     * The world instance from the player
     * @type {World}
     */
    this.world = player.world;
    /**
     * The map instance from the world
     * @type {Map}
     */
    this.map = this.world.map;
  }
}
