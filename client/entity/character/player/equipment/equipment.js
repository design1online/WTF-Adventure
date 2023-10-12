/**
  * Things that can be equipped on a {@link Character}
  * The children of these classes are responsible for
  * clear and concise ways of organizing stats of weapons
  * in the client side. This does not dictate the damage,
  * defense or bonus stats, it's just for looks.
  * @class
  */
export default class Equipment {
  /**
   * Default constructor
   * @param {String} name name of the piece of equipment
   * @param {Number} count how many times it can be used
   * @param {String} ability abilities on the equipment
   * @param {Number} abilityLevel level of the ability
   */
  constructor(name, count, ability, abilityLevel) {
    /**
     * Name of the equipment
     * @type {String}
     */
    this.name = name;

    /**
     * How many times it can be used
     * @type {Number}
     */
    this.count = count;

    /**
     * Ability of the equipment
     * @type {String}
     */
    this.ability = ability;

    /**
     * The ability level on the equipment
     * @type {Number}
     */
    this.abilityLevel = abilityLevel;
  }

  /**
   * Check if there is a name on this item
   * @return {String} name of the equipment
   */
  exists() {
    return this.name !== null && this.name !== 'null';
  }

  /**
   * Return the name of the equipment
   * @return {String} name
   */
  getName() {
    return this.name;
  }

  /**
   * Return the number of times equipment has been used
   * @return {Number} equipment usage count
   */
  getCount() {
    return this.count;
  }

  /**
   * Return the ability of the equipment
   * @return {String} ability
   */
  getAbility() {
    return this.ability;
  }

  /**
   * Get the ability level
   * @return {Number} ability level
   */
  getAbilityLevel() {
    return this.abilityLevel;
  }

  /**
   * Update the equipment stats
   * @param  {String} name name of the eqiopment
   * @param  {Number} count usage count
   * @param  {String} ability ability of the equipment
   * @param  {Number} abilityLevel level of the ability
   */
  update(name, count, ability, abilityLevel) {
    this.name = name;
    this.count = count;
    this.ability = ability;
    this.abilityLevel = abilityLevel;
  }
}
