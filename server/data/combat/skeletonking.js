import _ from 'underscore';
import Combat from '../../js/game/entity/character/combat/combat';
import Utils from '../../js/util/utils';

/**
 * First of its kind, the Skeleton King will spawn 4 minions.
 * Two sorcerers on (x + 1, y + 1) & (x - 1, y + 1)
 *
 * And two death knights on (x + 1, y - 1) & (x - 1, y - 1)
 */
/**
 * Combat logic for the Skeleton King boss
 * @class
 */
export default class SkeletonKing extends Combat {
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
      spawnDistance: 10,
    });
    /**
     * Timestamp of the last minion spawn
     * @type {Number}
     */
    this.lastSpawn = 0;
    /**
     * Array of currently active minion characters
     * @type {Array.<Character>}
     */
    this.minions = [];

    character.onDeath(() => {
      this.reset();
    });
  }

  /**
   * Resets boss state and kills all active minions
   */
  reset() {
    this.lastSpawn = 0;

    const listCopy = this.minions.slice();

    for (let i = 0; i < listCopy.length; i += 1) {
      this.world.kill(listCopy[i]);
    }
  }

  /**
   * Handles a hit, triggering minion attacks and spawning as needed
   * @param {Character} character the attacking character
   * @param {Character} target the target being hit
   * @param {Object} hitInfo hit information object
   */
  hit(character, target, hitInfo) {
    if (this.isAttacked()) {
      this.beginMinionAttack();
    }

    if (this.canSpawn()) {
      this.spawnMinions();
    }

    super.hit(character, target, hitInfo);
  }

  /**
   * Spawns sorcerer and death knight minions around the boss
   */
  spawnMinions() {
    const x = this.character.x;
    const y = this.character.y;

    this.lastSpawn = new Date().getTime();

    if (!this.colliding(x + 2, y - 2)) {
      this.minions.push(this.world.spawnMob(17, x + 2, y + 2));
    }

    if (!this.colliding(x - 2, y - 2)) {
      this.minions.push(this.world.spawnMob(17, x - 2, y + 2));
    }

    if (!this.colliding(x + 1, y + 1)) {
      this.minions.push(this.world.spawnMob(11, x + 1, y - 1));
    }

    if (!this.colliding(x - 1, y + 1)) {
      this.minions.push(this.world.spawnMob(11, x - 1, y - 1));
    }

    _.each(this.minions, (minion) => {
      minion.onDeath(() => {
        if (this.isLast()) {
          this.lastSpawn = new Date().getTime();
        }

        this.minions.splice(this.minions.indexOf(minion), 1);
      });

      if (this.isAttacked()) {
        this.beginMinionAttack();
      }
    });
  }

  /**
   * Orders each minion to attack a random target
   */
  beginMinionAttack() {
    if (!this.hasMinions()) {
      return;
    }

    _.each(this.minions, (minion) => {
      const randomTarget = this.getRandomTarget();

      if (!minion.hasTarget() && randomTarget) {
        minion.combat.begin(randomTarget);
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
   * Returns whether any minions are currently alive
   * @return {Boolean}
   */
  hasMinions() {
    return this.minions.length > 0;
  }

  /**
   * Returns whether only one minion remains
   * @return {Boolean}
   */
  isLast() {
    return this.minions.length === 1;
  }

  /**
   * Returns whether minions can be spawned
   * @return {Boolean}
   */
  canSpawn() {
    return (
      new Date().getTime() - this.lastSpawn > 25000
      && !this.hasMinions()
      && this.isAttacked()
    );
  }
}
