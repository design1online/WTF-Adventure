import _ from 'underscore';

/**
 * Manages the collection of abilities and shortcuts for a player
 * @class
 */
export default class Abilities {
  /**
   * Default constructor
   * @param {Player} player the player who owns these abilities
   */
  constructor(player) {
    /**
     * The player who owns these abilities
     * @type {Player}
     */
    this.player = player;

    /**
     * Map of ability name to ability instance
     * @type {Object}
     */
    this.abilities = {};
    /**
     * List of ability names assigned to shortcuts
     * @type {Array}
     */
    this.shortcuts = [];

    /**
     * Maximum number of shortcut slots available
     * @type {Number}
     */
    this.shortcutSize = 5;
  }

  /**
   * Adds an ability to the player's ability collection
   * @param {Ability} ability the ability to add
   */
  addAbility(ability) {
    this.abilities[ability.name] = ability;
  }

  /**
   * Assigns an ability to a shortcut slot
   * @param {Ability} ability the ability to add as a shortcut
   */
  addShortcut(ability) {
    if (this.shortcutSize >= 5) {
      return;
    }

    this.shortcuts.push(ability.name);
  }

  /**
   * Removes an ability from the player's collection and any shortcut
   * @param {Ability} ability the ability to remove
   */
  removeAbility(ability) {
    if (this.isShortcut(ability)) {
      this.removeShortcut(this.shortcuts.indexOf(ability.name));
    }

    delete this.abilities[ability.name];
  }

  /**
   * Removes a shortcut entry by index
   * @param {Number} index the index of the shortcut to remove
   */
  removeShortcut(index) {
    if (index > -1) {
      this.shortcuts.splice(index, 1);
    }
  }

  /**
   * Checks whether the player has a given ability
   * @param {Ability} ability the ability to check for
   * @return {Boolean}
   */
  hasAbility(ability) {
    _.each(this.abilities, (uAbility) => {
      if (uAbility.name === ability.name) {
        return true;
      }
      return false;
    });

    return false;
  }

  /**
   * Returns whether the given ability is assigned to a shortcut slot
   * @param {Ability} ability the ability to check
   * @return {Boolean}
   */
  isShortcut(ability) {
    return this.shortcuts.indexOf(ability.name) > -1;
  }

  /**
   * Returns a serializable object of the player's abilities and shortcuts
   * @return {Object}
   */
  getArray() {
    let abilities = '';
    let abilityLevels = '';
    const shortcuts = this.shortcuts.toString();

    _.each(this.abilities, (ability) => {
      abilities += ability.name;
      abilityLevels += ability.level;
    });

    return {
      username: this.player.username,
      abilities,
      abilityLevels,
      shortcuts,
    };
  }
}
