import Character from '../character';

/**
 * A non-playable {@link Character}
 * @class
 */
export default class Npc extends Character {
  /**
   * Default constructor
   * @param {Number} id the ID of the {@link Entity}
   * @param {String} kind the kind of {@link Entity} this is (sprite name)
   * @param {String} label the name to display for the overlay
   */
  constructor(id, kind, label) {
    super(id, kind, label);

    /**
     * Index for this NPC
     * @type {Number}
     */
    this.index = 0;

    /**
     * Type of this character
     * @type {String}
     */
    this.type = 'npc';
  }

  /**
   * Set the messages for this character, return a single message
   * @param  {String[]} messages the messages this character can say
   * @return {String} the next message in their talk sequence
   */
  talk(messages) {
    const count = messages.length;
    let message;

    if (this.index > count) {
      this.index = 0;
    }

    if (this.index < count) {
      message = messages[this.index];
    }

    this.index += 1;

    return message;
  }
}
