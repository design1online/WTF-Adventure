import _ from 'underscore';
import Combat from '../../js/game/entity/character/combat/combat';
import Messages from '../../js/network/messages';
import Packets from '../../js/network/packets';
import Utils from '../../js/util/utils';

/**
 * Combat logic for the Tenebris boss
 * @class
 */
export default class Tenebris extends Combat {
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
      spawnDistance: 24,
    });
    /**
     * Array of currently active illusion characters
     * @type {Array.<Character>}
     */
    this.illusions = [];
    /**
     * Whether the first illusion has been killed
     * @type {Boolean}
     */
    this.firstIllusionKilled = false;
    /**
     * Timestamp of the last illusion spawn
     * @type {Number}
     */
    this.lastIllusion = new Date().getTime();
    /**
     * Delay in ms before the boss respawns after all illusions are killed
     * @type {Number}
     */
    this.respawnDelay = 95000;

    character.onDeath(() => {
      if (this.isIllusion()) {
        if (!this.firstIllusionKilled) {
          this.spawnTenbris();
        } else {
          this.removeIllusions();
          this.reset();
        }
      }
    });

    if (!this.isIllusion()) {
      this.forceTalk('Who dares summon Tenebris!');
    }
  }

  /**
   * Resets illusion state and schedules the boss to respawn
   */
  reset() {
    this.illusions = [];
    this.firstIllusionKilled = false;

    setTimeout(() => {
      const offset = Utils.positionOffset(4);

      this.world.spawnMob(105, 48 + offset.x, 338 + offset.y);
    }, this.respawnDelay);
  }

  /**
   * Handles a hit, triggering illusion attacks and spawning as needed
   * @param {Character} attacker the attacking character
   * @param {Character} target the target being hit
   * @param {Object} hitInfo hit information object
   */
  hit(attacker, target, hitInfo) {
    if (this.isAttacked()) {
      this.beginIllusionAttack();
    }

    if (this.canSpawn()) {
      this.spawnIllusions();
    }

    super.hit(attacker, target, hitInfo);
  }

  /**
   * Spawns the real Tenebris mob at the current position
   */
  spawnTenbris() {
    this.world.spawnMob(104, this.character.x, this.character.y);
  }

  /**
   * Spawns two illusions adjacent to the boss and teleports the boss away
   */
  spawnIllusions() {
    this.illusions.push(
      this.world.spawnMob(105, this.character.x + 1, this.character.y + 1),
    );
    this.illusions.push(
      this.world.spawnMob(105, this.character.x - 1, this.character.y + 1),
    );

    _.each(this.illusions, (illusion) => {
      illusion.onDeath(() => {
        if (this.isLast()) {
          this.lastIllusion = new Date().getTime();
        }

        this.illusions.splice(this.illusions.indexOf(illusion), 1);
      });

      if (this.isAttacked()) {
        this.beginIllusionAttack();
      }
    });

    this.character.setPosition(62, 343);
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

  /**
   * Removes all active illusions from the world
   */
  removeIllusions() {
    this.lastIllusion = 0;

    const listCopy = this.illusions.slice();

    for (let i = 0; i < listCopy.length; i += 1) {
      this.world.kill(listCopy[i]);
    }
  }

  /**
   * Orders each illusion to attack a random target
   */
  beginIllusionAttack() {
    if (!this.hasIllusions()) {
      return;
    }

    _.each(this.illusions, (illusion) => {
      const target = this.getRandomTarget();

      if (!illusion.hasTarget && target) {
        illusion.combat.begin(target);
      }
    });
  }

  /**
   * Returns a random attacker or the current target
   * @return {Character|null}
   */
  getRandomTarget() {
    if (this.isAttacked()) {
      const keys = Object.keys(this.attackers);
      const randomAttacker = this.attackers[keys[Utils.randomInt(0, keys.length)]];

      if (randomAttacker) {
        return randomAttacker;
      }
    }

    if (this.character.hasTarget()) {
      return this.character.target;
    }

    return null;
  }

  /**
   * Broadcasts a dialogue message to adjacent groups
   * @param {String} instance the instance ID of the speaking entity
   * @param {String} message the message to broadcast
   */
  forceTalk(instance, message) {
    if (!this.world) {
      return;
    }

    this.world.pushToAdjacentGroups(
      this.character.target.group,
      new Messages.NPC(Packets.NPCOpcode.Talk, {
        id: instance,
        text: message,
        nonNPC: true,
      }),
    );
  }

  /**
   * Returns whether only one illusion remains
   * @return {Boolean}
   */
  isLast() {
    return this.illusions.length === 1;
  }

  /**
   * Returns whether illusions can be spawned
   * @return {Boolean}
   */
  canSpawn() {
    return (
      !this.isIllusion()
      && !this.hasIllusions
      && new Date().getTime() - this.lastIllusion === 45000
      && Utils.randomInt(0, 4) === 2
    );
  }

  /**
   * Returns whether this instance is an illusion
   * @return {Boolean}
   */
  isIllusion() {
    return this.character.id === 105;
  }

  /**
   * Returns whether any illusions are currently active
   * @return {Boolean}
   */
  hasIllusions() {
    return this.illusions.length > 0;
  }
}
