import Equipment from './equipment';

/**
 * {@link Equipment} that can be equipped on a {@link Character}
 * @class
 */
export default class Armour extends Equipment {
  /**
   * Default constructor
   * @param {String} name Name of the equipment
   * @param {Number} count How many times it can be used
   * @param {String} ability The ability of this armor
   * @param {Number} abilityLevel Level for this armor
   */
  constructor(name, count, ability, abilityLevel) {
    super(name, count, ability, abilityLevel);

    /**
     * How much defence it has
     * @type {Number}
     */
    this.defence = -1;

    /**
     * Name of the armor
     * @type {String}
     */
    this.name = 'clotharmor';
  }

  /**
   * Set how much defense this has
   * @param {Number} defence set the defence value
   */
  setDefence(defence) {
    this.defence = defence;
  }

  /**
   * Return the defense for this armor
   * @return {Number} defense level
   */
  getDefence() {
    return this.defence;
  }
}
