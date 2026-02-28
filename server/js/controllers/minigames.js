import TeamWar from '../minigames/impl/teamwar';

/**
 * Controller that manages all active minigame instances
 * @class
 */
export default class  Minigames {
  /**
   * Default constructor
   * @param {World} world the world instance
   */
  constructor(world) {
    /**
     * The world instance
     * @type {World}
     */
    this.world = world;
    /**
     * Map of active minigame instances keyed by name
     * @type {Object}
     */
    this.minigames = {};

    this.load();
  }

  /**
   * Loads and instantiates all minigame implementations
   */
  load() {
    this.minigames.TeamWar = new TeamWar();
  }

  /**
   * Returns the TeamWar minigame instance
   * @return {TeamWar}
   */
  getTeamWar() {
    return this.minigames.TeamWar;
  }
}
