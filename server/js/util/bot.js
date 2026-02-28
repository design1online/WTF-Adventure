import Player from '../game/entity/character/player/player.js';
import Creator from '../database/creator.js';

/**
 * Manages automated bot players for testing and population purposes
 * @class
 */
export default class Bot {
  /**
   * Default constructor
   * @param {Object} world the world instance the bots will be added to
   * @param {Number} count the number of bot players to create
   */
  constructor(world, count) {
    /**
     * The world instance the bots are part of
     * @type {Object}
     */
    this.world = world;
    /**
     * The number of bot players to create
     * @type {Number}
     */
    this.count = count;

    /**
     * The creator instance used to generate bot player data
     * @type {Creator}
     */
    this.creator = new Creator(null);

    /**
     * The list of bot player instances
     * @type {Array}
     */
    this.players = [];

    this.loadBot();
  }

  /**
   * Creates and initializes bot players up to the configured count
   */
  loadBot() {
    for (let i = 0; i < this.count; i += 1) {
      const connection = {
        id: i,
        listen: {},
        onClose: {},
      };
      const player = new Player(this.world, this.world.database, connection, -1);

      this.world.addPlayer(player);

      player.username = `Bot${i}`;

      player.loadPlayer(this.creator.getPlayerData(player));

      player.intro();

      player.walkRandomly();

      this.players.push(player);
    }
  }
}
