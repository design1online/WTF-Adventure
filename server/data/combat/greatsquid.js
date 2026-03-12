import Combat from '../../js/game/entity/character/combat/combat';
import Modules from '../../js/util/modules';

/**
 * Combat logic for the Great Squid boss
 * @class
 */
export default class GreatSquid extends Combat {
  /**
   * Default constructor
   * @param {Character} character the character instance for this boss
   */
  constructor(character) {
    super(character);

    /**
     * The character instance with extended spawn configuration
     * @type {Character}
     */
    this.character = Object.assign(character, {
      spawnDistance: 15,
    });

    /**
     * Timestamp of the last terror attack
     * @type {Number}
     */
    this.lastTerror = new Date().getTime();
  }

  /**
   * Handles a hit, applying a terror stun if available
   * @param {Character} character the attacking character
   * @param {Character} target the target being hit
   * @param {Object} hitInfo hit information object
   */
  hit(character, target, hitInfo) {
    if (this.canUseTerror()) {
      hitInfo.type = Modules.Hits.Stun; // eslint-disable-line

      this.lastTerror = new Date().getTime();
    }

    super.hit(character, target, hitInfo);
  }

  /**
   * Returns whether the terror attack can currently be used
   * @return {Boolean}
   */
  canUseTerror() {
    return new Date().getTime() - this.lastTerror > 15000;
  }
}
