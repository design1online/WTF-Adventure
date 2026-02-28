import Abilities from '../../../../../../util/abilities';

/**
 * Base class representing a single player ability
 * @class
 */
export default class Ability {
  /**
   * Default constructor
   * @param {String} name the name identifier of the ability
   * @param {String} type the type category of the ability
   */
  constructor(name, type) {
    /**
     * The name identifier of the ability
     * @type {String}
     */
    this.name = name;
    /**
     * The type category of the ability
     * @type {String}
     */
    this.type = type;
    /**
     * The current level of the ability
     * @type {Number}
     */
    this.level = -1;

    /**
     * Static ability data from the abilities dictionary
     * @type {Object}
     */
    this.data = Abilities.data[name];
  }
}
