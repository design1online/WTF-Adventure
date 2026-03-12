import Quest from '../quest';

/**
 * Represents "The Lie" quest implementation
 * @class
 */
export default class TheLie extends Quest {
  /**
   * Default constructor
   * @param {Player} player the player undertaking this quest
   * @param {Object} data the quest data object with id, name, and description
   */
  constructor(player, data) {
    super(data.id, data.name, data.description);
    /**
     * The player undertaking this quest
     * @type {Player}
     */
    this.player = player;
    /**
     * The quest data object
     * @type {Object}
     */
    this.data = data;
  }

  /**
   * Loads the quest at the given stage
   * @param {Number} stage the stage to load the quest at
   */
  load(stage) {
    if (stage) {
      this.update();
    } else {
      /** @type {Number} */
      this.stage = stage;
    }
  }

  /**
   * Persists the current quest state by saving the player
   */
  update() {
    this.player.save();
  }
}
