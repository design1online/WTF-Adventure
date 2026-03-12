import _ from 'underscore';
import Combat from '../../js/game/entity/character/combat/combat';
import Messages from '../../js/network/messages';
import Packets from '../../js/network/packets';
import Modules from '../../js/util/modules';
import Utils from '../../js/util/utils';

/**
 * Combat logic for the Ogre Lord boss
 * @class
 */
export default class OgreLord extends Combat {
  /**
   * Default constructor
   * @param {Character} character the character instance for this boss
   */
  constructor(character) {
    super(character);
    /**
     * The character instance for this boss
     * @type {Character}
     */
    this.character = character;

    /**
     * List of dialogue strings the boss says during combat
     * @type {Array.<String>}
     */
    this.dialogues = [
      'Get outta my swamp',
      'No, not the onion.',
      'My minions give me strength! You stand no chance!',
    ];

    /**
     * Array of currently active minion characters
     * @type {Array.<Character>}
     */
    this.minions = [];

    /**
     * Timestamp of the last minion spawn
     * @type {Number}
     */
    this.lastSpawn = 0;

    /**
     * Whether the boss intervals have been loaded
     * @type {Boolean}
     */
    this.loaded = false;

    character.projectile = Modules.Projectiles.Boulder; // eslint-disable-line
    character.projectileName = 'projectile-boulder'; // eslint-disable-line

    character.onDeath(() => {
      this.reset();
    });
  }

  /**
   * Loads the periodic talking and armour update intervals
   */
  load() {
    /** @type {Object} */
    this.talkingInterval = setInterval(() => {
      if (this.character.hasTarget()) {
        this.forceTalk(this.getMessage());
      }
    }, 9000);

    /** @type {Object} */
    this.updateInterval = setInterval(() => {
      this.character.armourLevel = 50 + this.minions.length * 15;
    }, 2000);

    this.loaded = true;
  }

  /**
   * Handles a hit, triggering minion attacks, ranged logic, and spawning
   * @param {Character} character the attacking character
   * @param {Character} target the target being hit
   * @param {Object} hitInfo hit information object
   */
  hit(character, target, hitInfo) {
    if (this.isAttacked()) {
      this.beginMinionAttack();
    }

    if (!character.isNonDiagonal(target)) {
      const distance = character.getDistance(target);

      if (distance < 7) {
        hitInfo.isRanged = true; // eslint-disable-line
        character.attackRange = 7; // eslint-disable-line
      }
    }

    if (this.canSpawn()) {
      this.spawnMinions();
    }

    super.hit(character, target, hitInfo);
  }

  /**
   * Broadcasts a message to adjacent groups as this character speaking
   * @param {String} message the message to broadcast
   */
  forceTalk(message) {
    if (!this.world) {
      return;
    }

    this.world.pushToAdjacentGroups(
      this.character.target.group,
      new Messages.NPC(Packets.NPCOpcode.Talk, {
        id: this.character.instance,
        text: message,
        nonNPC: true,
      }),
    );
  }

  /**
   * Returns a random dialogue string
   * @return {String}
   */
  getMessage() {
    return this.dialogues[Utils.randomInt(0, this.dialogues.length - 1)];
  }

  /**
   * Spawns minions at predefined positions around the boss
   */
  spawnMinions() {
    const
      xs = [414, 430, 415, 420, 429];


    const ys = [172, 173, 183, 185, 180];

    this.lastSpawn = new Date().getTime();

    this.forceTalk('Now you shall see my true power!');

    for (let i = 0; i < xs.length; i += 1) this.minions.push(this.world.spawnMob(12, xs[i], ys[i]));

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

    if (!this.loaded) {
      this.load();
    }
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
   * Resets boss state and kills all active minions
   */
  reset() {
    this.lastSpawn = 0;

    const listCopy = this.minions.slice();

    for (let i = 0; i < listCopy.length; i += 1) {
      this.world.kill(listCopy[i]);
    }

    clearInterval(this.talkingInterval);
    clearInterval(this.updateInterval);

    this.talkingInterval = null;
    this.updateInterval = null;

    this.loaded = false;
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
      new Date().getTime() - this.lastSpawn > 50000
      && !this.hasMinions()
      && this.isAttacked()
    );
  }
}
