import _ from 'underscore';
import Combat from '../../js/game/entity/character/combat/combat';
import Packets from '../../js/network/packets';
import Messages from '../../js/network/messages';
import Utils from '../../js/util/utils';

/**
 * This is where bosses start to get a bit more complex.
 * The queen ant will do an AoE attack after staggering for five seconds,
 * indicating to the players. If players are caught up in this, the terror
 * explosion sprite is drawn above them.
 */
/**
 * Combat logic for the Queen Ant boss
 * @class
 */
export default class QueenAnt extends Combat {
  /**
   * Default constructor
   * @param {Character} character the character instance for this boss
   */
  constructor(character) {
    super(character);

    /**
     * Threshold in ms for the last action before AoE is triggered
     * @type {Number}
     */
    this.lastActionThreshold = 10000; // Due to the nature of the AoE attack
    /**
     * The character instance with extended spawn configuration
     * @type {Character}
     */
    this.character = Object.assign(character, {
      spawnDistance: 18,
    });
    /**
     * Active timeout handle for the AoE attack delay
     * @type {Object|null}
     */
    this.aoeTimeout = null;
    /**
     * Countdown value in seconds displayed before the AoE attack
     * @type {Number}
     */
    this.aoeCountdown = 5;
    /**
     * Radius of the AoE attack
     * @type {Number}
     */
    this.aoeRadius = 2;
    /**
     * Timestamp of the last AoE attack
     * @type {Number}
     */
    this.lastAoE = 0;
    /**
     * Number of minions to spawn per wave
     * @type {Number}
     */
    this.minionCount = 7;
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
    /**
     * Whether the boss is currently frozen (AoE wind-up state)
     * @type {Boolean}
     */
    this.frozen = false;

    /**
     * This is to prevent the boss from dealing
     * any powerful AoE attack after dying.
     */
    this.character.onDeath(() => {
      this.lastSpawn = 0;

      if (this.aoeTimeout) {
        clearTimeout(this.aoeTimeout);
        this.aoeTimeout = null;
      }

      const listCopy = this.minions.slice();

      for (let i = 0; i < listCopy.length; i += 1) {
        this.world.kill(listCopy[i]);
      }
    });

    this.character.onReturn(() => {
      clearTimeout(this.aoeTimeout);
      this.aoeTimeout = null;
    });
  }

  /**
   * Begins combat with an attacker, resetting the AoE timer
   * @param {Character} attacker the character initiating combat
   */
  begin(attacker) {
    this.resetAoE();
    super.begin(attacker);
  }

  /**
   * Handles a hit, checking for AoE and minion spawn conditions
   * @param {Character} attacker the attacking character
   * @param {Character} target the target being hit
   * @param {Object} hitInfo hit information object
   */
  hit(attacker, target, hitInfo) {
    if (this.frozen) {
      return;
    }

    if (this.canCastAoE()) {
      this.doAoE();
      return;
    }

    if (this.canSpawn()) {
      this.spawnMinions();
    }

    if (this.isAttacked()) {
      this.beginMinionAttack();
    }

    super.hit(attacker, target, hitInfo);
  }

  /**
   * The reason this function does not use its superclass
   * representation is because of the setTimeout function
   * which does not allow us to call super().
   */
  /**
   * Freezes the boss and schedules the AoE damage after a countdown
   */
  doAoE() {
    this.resetAoE();
    /** @type {Number} */
    this.lastHit = this.getTime();
    this.pushFreeze(true);
    this.pushCountdown(this.aoeCountdown);

    this.aoeTimeout = setTimeout(() => {
      this.dealAoE(this.aoeRadius, true);
      this.pushFreeze(false);
    }, 5000);
  }

  /**
   * Spawns a wave of minions at the boss's current position
   */
  spawnMinions() {
    this.lastSpawn = new Date().getTime();

    for (let i = 0; i < this.minionCount; i += 1) {
      this.minions.push(
        this.world.spawnMob(13, this.character.x, this.character.y),
      );
    }

    _.each(this.minions, (minion) => {
      minion.aggressive = true;
      minion.spawnDistance = 12;

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
   * Resets the AoE timer to the current time
   */
  resetAoE() {
    this.lastAoE = new Date().getTime();
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
   * Applies or removes the frozen and stunned state on the character
   * @param {Boolean} state whether to freeze or unfreeze
   */
  pushFreeze(state) {
    this.character.frozen = state;
    this.character.stunned = state;
  }

  /**
   * Broadcasts a countdown message to adjacent groups
   * @param {Number} count the countdown value to display
   */
  pushCountdown(count) {
    this.world.pushToAdjacentGroups(
      this.character.group,
      new Messages.NPC(Packets.NPCOpcode.Countdown, {
        id: this.character.instance,
        countdown: count,
      }),
    );
  }

  /**
   * Retrieves grid data for minions from the world
   */
  getMinions() {
    this.world.getGrids();
  }

  /**
   * Returns whether only one minion remains
   * @return {Boolean}
   */
  isLast() {
    return this.minions.length === 1;
  }

  /**
   * Returns whether any minions are currently alive
   * @return {Boolean}
   */
  hasMinions() {
    return this.minions.length > 0;
  }

  /**
   * Returns whether the AoE attack can currently be cast
   * @return {Boolean}
   */
  canCastAoE() {
    return new Date().getTime() - this.lastAoE > 30000;
  }

  /**
   * Returns whether minions can be spawned
   * @return {Boolean}
   */
  canSpawn() {
    return (
      new Date().getTime() - this.lastSpawn > 45000
      && !this.hasMinions()
      && this.isAttacked()
    );
  }
}
