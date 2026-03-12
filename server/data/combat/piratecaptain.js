import Combat from '../../js/game/entity/character/combat/combat';
import Utils from '../../js/util/utils';
import Messages from '../../js/network/messages';

/**
 * Combat logic for the Pirate Captain boss
 * @class
 */
export default class PirateCaptain extends Combat {
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
      spawnDistance: 20,
    });

    /**
     * Array of available teleport position objects
     * @type {Array.<Object>}
     */
    this.teleportLocations = [];

    /**
     * Index of the last teleport location used
     * @type {Number}
     */
    this.lastTeleportIndex = 0;
    /**
     * Timestamp of the last teleport
     * @type {Number}
     */
    this.lastTeleport = 0;

    /**
     * The initial spawn location of the boss
     * @type {Object}
     */
    this.location = {
      x: this.character.x,
      y: this.character.y,
    };

    this.load();
  }

  /**
   * Loads teleport locations into the teleportLocations array
   */
  load() {
    const
      south = {
        x: 251,
        y: 574,
      };
    const west = {
      x: 243,
      y: 569,
    };
    const east = {
      x: 258,
      y: 568,
    };
    const north = {
      x: 251,
      y: 563,
    };

    this.teleportLocations.push(north, south, west, east);
  }

  /**
   * Handles a hit, teleporting instead of attacking when able
   * @param {Character} character the attacking character
   * @param {Character} target the target being hit
   * @param {Object} hitInfo hit information object
   */
  hit(character, target, hitInfo) {
    if (this.canTeleport()) {
      this.teleport();
    } else {
      super.hit(character, target, hitInfo);
    }
  }

  /**
   * Teleports the boss to a random position and resets attackers
   */
  teleport() {
    const position = this.getRandomPosition();

    if (!position) {
      return;
    }

    this.stop();

    this.lastTeleport = new Date().getTime();
    this.lastTeleportIndex = position.index;

    this.character.setPosition(position.x, position.y);

    if (this.world) {
      this.world.pushToGroup(
        this.character.group,
        new Messages.Teleport(
          this.character.instance,
          this.character.x,
          this.character.y,
          true,
        ),
      );
    }

    this.forEachAttacker((attacker) => {
      attacker.removeTarget();
    });

    if (this.character.hasTarget()) {
      this.begin(this.character.target);
    }
  }

  /**
   * Returns a random teleport position that differs from the last used
   * @return {Object|null}
   */
  getRandomPosition() {
    const random = Utils.randomInt(0, this.teleportLocations.length - 1);
    const position = this.teleportLocations[random];

    if (!position || random === this.lastTeleportIndex) {
      return null;
    }

    return {
      x: position.x,
      y: position.y,
      index: random,
    };
  }

  /**
   * Returns whether the boss can currently teleport
   * @return {Boolean}
   */
  canTeleport() {
    // Just randomize the teleportation for shits and giggles.
    return (
      new Date().getTime() - this.lastTeleport > 10000
      && Utils.randomInt(0, 4) === 2
    );
  }

  /**
   * Returns the boss health as a floored percentage
   * @return {Number}
   */
  getHealthPercentage() {
    // Floor it to avoid random floats
    return Math.floor(
      (this.character.hitPoints / this.character.maxHitPoints) * 100,
    );
  }
}
