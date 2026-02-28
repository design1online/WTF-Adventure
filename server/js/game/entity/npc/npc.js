import Entity from '../entity.js';

/**
 * Represents a non-player character in the game world
 * @class
 */
export default class NPC extends Entity {
  /**
   * Default constructor
   * @param {String} id the NPC type identifier
   * @param {String} instance the unique instance identifier
   * @param {Number} x the x-coordinate of the NPC
   * @param {Number} y the y-coordinate of the NPC
   */
  constructor(id, instance, x, y) {
    super(id, 'npc', instance, x, y);
    /**
     * The current index into the NPC's dialogue messages array
     * @type {Number}
     */
    this.talkIndex = 0;
  }

  /**
   * Advances the talk index for the NPC's dialogue
   * @param {Array} messages the array of dialogue messages
   */
  talk(messages) {
    if (this.talkIndex > messages.length) {
      this.talkIndex = 0;
    }

    this.talkIndex += 1;
  }
}
