import _ from 'underscore';
import CombatQueue from './combatqueue.js';
import Utils from '../../../../util/utils.js';
import Formulas from '../../../formulas.js';
import Hit from './hit.js';
import Modules from '../../../../util/modules.js';
import Messages from '../../../../network/messages.js';
import Packets from '../../../../network/packets.js';

/**
 * Handles combat logic for a character including attacking, following, and taking damage
 * @class
 */
export default class Combat {
  /**
   * Default constructor
   * @param {Character} character the character this combat instance belongs to
   */
  constructor(character) {
    /**
     * The character this combat instance controls
     * @type {Character}
     */
    this.character = character;
    /**
     * The game world instance
     * @type {World|null}
     */
    this.world = null;

    /**
     * A map of attackers currently targeting this character
     * @type {Object}
     */
    this.attackers = {};

    /**
     * Whether this character will retaliate when attacked
     * @type {Boolean}
     */
    this.retaliate = false;

    /**
     * The queue of pending hit actions
     * @type {CombatQueue}
     */
    this.queue = new CombatQueue();

    /**
     * Whether this character is currently attacking
     * @type {Boolean}
     */
    this.attacking = false;

    /**
     * The interval handle for the attack loop
     * @type {Object|null}
     */
    this.attackLoop = null;
    /**
     * The interval handle for the follow loop
     * @type {Object|null}
     */
    this.followLoop = null;
    /**
     * The interval handle for the inactivity check loop
     * @type {Object|null}
     */
    this.checkLoop = null;

    /**
     * Whether this is the first action in combat
     * @type {Boolean}
     */
    this.first = false;
    /**
     * Whether combat has been started
     * @type {Boolean}
     */
    this.started = false;
    /**
     * The timestamp of the last combat action
     * @type {Number}
     */
    this.lastAction = -1;
    /**
     * The timestamp of the last hit
     * @type {Number}
     */
    this.lastHit = -1;

    /**
     * The time in milliseconds before combat is considered inactive
     * @type {Number}
     */
    this.lastActionThreshold = 7000;

    /**
     * The timeout handle used to clean up combat state
     * @type {Object|null}
     */
    this.cleanTimeout = null;

    this.character.onSubAoE((radius, hasTerror) => {
      this.dealAoE(radius, hasTerror);
    });

    this.character.onDamage((target, hitInfo) => {
      if (
        this.isPlayer()
        && this.character.hasBreakableWeapon()
        && Formulas.getWeaponBreak(this.character, target)
      ) this.character.breakWeapon();

      if (hitInfo.type === Modules.Hits.Stun) {
        target.setStun(true);

        if (target.stunTimeout) clearTimeout(target.stunTimeout);

        target.stunTimeout = setTimeout(() => { // eslint-disable-line
          target.setStun(false);
        }, 3000);
      }
    });
  }

  /**
   * Begins combat by setting up the target and starting the attack loop
   * @param {Character} attacker the character initiating combat
   */
  begin(attacker) {
    this.start();

    this.character.setTarget(attacker);
    this.addAttacker(attacker);

    attacker.combat.addAttacker(this.character); // For mobs attacking players..

    this.attack(attacker);
  }

  /**
   * Starts the attack, follow, and check interval loops
   */
  start() {
    if (this.started) return;

    this.lastAction = new Date().getTime();

    this.attackLoop = setInterval(() => {
      this.parseAttack();
    }, this.character.attackRate);

    this.followLoop = setInterval(() => {
      this.parseFollow();
    }, 400);

    this.checkLoop = setInterval(() => {
      if (this.getTime() - this.lastAction > this.lastActionThreshold) {
        this.stop();

        this.forget();
      }
    }, 1000);

    this.started = true;
  }

  /**
   * Stops all combat interval loops
   */
  stop() {
    if (!this.started) return;

    clearInterval(this.attackLoop);
    clearInterval(this.followLoop);
    clearInterval(this.checkLoop);

    this.attackLoop = null;
    this.followLoop = null;
    this.checkLoop = null;

    this.started = false;
  }

  /**
   * Processes pending attacks from the hit queue when in proximity to target
   */
  parseAttack() {
    if (!this.world || !this.queue || this.character.stunned) {
      return;
    }

    if (this.character.hasTarget() && this.inProximity()) {
      if (this.queue.hasQueue()) {
        this.hit(this.character, this.character.target, this.queue.getHit());
      }

      if (this.character.target && !this.character.target.isDead()) {
        this.attack(this.character.target);
      }

      this.lastAction = this.getTime();
    } else this.queue.clear();
  }

  /**
   * Processes movement following logic for mobs pursuing their target
   */
  parseFollow() {
    if (this.character.frozen || this.character.stunned) {
      return;
    }

    if (this.isMob()) {
      if (!this.character.isRanged()) {
        this.sendFollow();
      }

      if (this.isAttacked() || this.character.hasTarget()) {
        this.lastAction = this.getTime();
      }

      if (this.onSameTile()) {
        const newPosition = this.getNewPosition();

        this.move(this.character, newPosition.x, newPosition.y);
      }

      if (this.character.hasTarget() && !this.inProximity()) {
        const attacker = this.getClosestAttacker();

        if (attacker) {
          this.follow(this.character, attacker);
        }
      }
    }
  }

  /**
   * Creates and queues a hit action against the target
   * @param {Character} target the character to attack
   */
  attack(target) {
    let
      hit;

    if (this.isPlayer()) hit = this.character.getHit(target);
    else {
      hit = new Hit(
        Modules.Hits.Damage,
        Formulas.getDamage(this.character, target),
      );
    }

    if (!hit) return;

    this.queue.add(hit);
  }

  /**
   * Deals area-of-effect damage to all surrounding entities within the given radius
   * @param {Number} radius the radius of the AoE effect in tiles
   * @param {Boolean} hasTerror whether the AoE inflicts terror
   */
  dealAoE(radius, hasTerror) {
    /**
     * TODO - Find a way to implement special effects without hardcoding them.
     */

    if (!this.world) return;

    const entities = this.world
      .getGrids()
      .getSurroundingEntities(this.character, radius);

    _.each(entities, (entity) => {
      const hitData = new Hit(
        Modules.Hits.Damage,
        Formulas.getAoEDamage(this.character, entity),
      ).getData();

      hitData.isAoE = true;
      hitData.hasTerror = hasTerror;

      this.hit(this.character, entity, hitData);
    });
  }

  /**
   * Forces an immediate attack sequence against the current target
   */
  forceAttack() {
    if (!this.character.target || !this.inProximity()) return;

    this.stop();
    this.start();

    this.attackCount(2, this.character.target);
    this.hit(this.character, this.character.target, this.queue.getHit());
  }

  /**
   * Queues a given number of attacks against a target
   * @param {Number} count the number of attacks to queue
   * @param {Character} target the character to attack
   */
  attackCount(count, target) {
    for (let i = 0; i < count; i += 1) this.attack(target);
  }

  /**
   * Adds a character to the attackers map
   * @param {Character} character the character to add as an attacker
   */
  addAttacker(character) {
    if (this.hasAttacker(character)) return;

    this.attackers[character.instance] = character;
  }

  /**
   * Removes a character from the attackers map and sends the mob to spawn if no longer attacked
   * @param {Character} character the character to remove
   */
  removeAttacker(character) {
    if (this.hasAttacker(character)) delete this.attackers[character.instance];

    if (!this.isAttacked()) this.sendToSpawn();
  }

  /**
   * Sends this mob back to its spawn point and broadcasts the movement
   */
  sendToSpawn() {
    if (!this.isMob()) return;

    this.character.return();

    this.world.pushBroadcast(
      new Messages.Movement(Packets.MovementOpcode.Move, [
        this.character.instance,
        this.character.x,
        this.character.y,
        false,
        false,
      ]),
    );
  }

  /**
   * Returns whether a given character is in the attackers map
   * @param {Character} character the character to check
   * @return {Boolean|null}
   */
  hasAttacker(character) {
    if (!this.isAttacked()) {
      return null;
    }

    return character.instance in this.attackers;
  }

  /**
   * Returns whether this mob is on the same tile as its target
   * @return {Boolean}
   */
  onSameTile() {
    if (!this.character.target || this.character.type !== 'mob') {
      return false;
    }

    return (
      this.character.x === this.character.target.x
      && this.character.y === this.character.target.y
    );
  }

  /**
   * Returns whether this character is currently being attacked by any attackers
   * @return {Boolean}
   */
  isAttacked() {
    return this.attackers && Object.keys(this.attackers).length > 0;
  }

  /**
   * Returns a new position adjacent to the current position, chosen at random
   * @return {Object}
   */
  getNewPosition() {
    const
      position = {
        x: this.character.x,
        y: this.character.y,
      };

    const random = Utils.randomInt(0, 3);

    if (random === 0) position.x += 1;
    else if (random === 1) position.y -= 1;
    else if (random === 2) position.x -= 1;
    else if (random === 3) position.y += 1;

    return position;
  }

  /**
   * Returns whether this player character is currently retaliating against an attacker
   * @return {Boolean}
   */
  isRetaliating() {
    return (
      this.isPlayer()
      && !this.character.hasTarget()
      && this.retaliate
      && !this.character.moving
      && new Date().getTime() - this.character.lastMovement > 1500
    );
  }

  /**
   * Returns whether this character is within attack range of its target
   * @return {Boolean}
   */
  inProximity() {
    if (!this.character.target) {
      return false;
    }

    const targetDistance = this.character.getDistance(this.character.target);
    const range = this.character.attackRange;

    if (this.character.isRanged()) {
      return targetDistance <= range;
    }

    return this.character.isNonDiagonal(this.character.target);
  }

  /**
   * Returns the closest attacker to this character
   * @return {Character|null}
   */
  getClosestAttacker() {
    let closest = null;
    const lowestDistance = 100;

    this.forEachAttacker((attacker) => {
      const distance = this.character.getDistance(attacker);

      if (distance < lowestDistance) {
        closest = attacker;
      }
    });

    return closest;
  }

  /**
   * Sets the world instance for this combat object
   * @param {World} world the game world instance
   */
  setWorld(world) {
    if (!this.world) this.world = world;
  }

  /**
   * Clears all attackers and removes this character's target
   */
  forget() {
    this.attackers = {};
    this.character.removeTarget();

    if (this.forgetCallback) this.forgetCallback();
  }

  /**
   * Moves a mob character to the given coordinates
   * @param {Character} character the mob character to move
   * @param {Number} x the target x-coordinate
   * @param {Number} y the target y-coordinate
   */
  move(character, x, y) {
    /**
     * The server and mob types can parse the mob movement
     */

    if (character.type !== 'mob') return;

    character.move(x, y);
  }

  /**
   * Executes a hit from character to target, handling ranged and melee combat
   * @param {Character} character the attacking character
   * @param {Character} target the target character
   * @param {Object} hitInfo the hit data object
   */
  hit(character, target, hitInfo) {
    const
      time = this.getTime();

    if (time - this.lastHit < this.character.attackRate && !hitInfo.isAoE) return;

    if (character.isRanged() || hitInfo.isRanged) {
      const projectile = this.world.createProjectile(
        [character, target],
        hitInfo,
      );

      this.world.pushToAdjacentGroups(
        character.group,
        new Messages.Projectile(
          Packets.ProjectileOpcode.Create,
          projectile.getData(),
        ),
      );
    } else {
      this.world.pushBroadcast(
        new Messages.Combat(
          Packets.CombatOpcode.Hit,
          character.instance,
          target.instance,
          hitInfo,
        ),
      );
      this.world.handleDamage(character, target, hitInfo.damage);
    }

    if (character.damageCallback) character.damageCallback(target, hitInfo);

    this.lastHit = this.getTime();
  }

  /**
   * Broadcasts a follow movement message from character to target
   * @param {Character} character the following character
   * @param {Character} target the character being followed
   */
  follow(character, target) {
    this.world.pushBroadcast(
      new Messages.Movement(Packets.MovementOpcode.Follow, [
        character.instance,
        target.instance,
        character.isRanged(),
        character.attackRange,
      ]),
    );
  }

  /**
   * Broadcasts a combat finish message for this character
   */
  end() {
    this.world.pushBroadcast(
      new Messages.Combat(
        Packets.CombatOpcode.Finish,
        this.character.instance,
        null,
      ),
    );
  }

  /**
   * Sends a follow movement message to nearby players, excluding the combatants
   */
  sendFollow() {
    if (!this.character.hasTarget() || this.character.target.isDead()) return;

    const ignores = [this.character.instance, this.character.target.instance];

    this.world.pushSelectively(
      new Messages.Movement(Packets.MovementOpcode.Follow, [
        this.character.instance,
        this.character.target.instance,
      ]),
      ignores,
    );
  }

  /**
   * Iterates over each attacker and invokes the callback
   * @param {Function} callback the callback to invoke for each attacker
   */
  forEachAttacker(callback) {
    _.each(this.attackers, (attacker) => {
      callback(attacker);
    });
  }

  /**
   * Registers a callback for when this character forgets its attackers
   * @param {Function} callback the callback to invoke
   */
  onForget(callback) {
    /** @type {Function} */
    this.forgetCallback = callback;
  }

  /**
   * Returns whether the current target is outside the mob's spawn bounds
   * @return {Boolean}
   */
  targetOutOfBounds() {
    if (!this.character.hasTarget() || !this.isMob()) {
      return true;
    }

    const {
      spawnPoint,
      target,
    } = this.character;

    return (
      Utils.getDistance(spawnPoint[0], spawnPoint[1], target.x, target.y)
      > this.character.spawnDistance
    );
  }

  /**
   * Returns the current timestamp in milliseconds
   * @return {Number}
   */
  getTime() {
    return new Date().getTime();
  }

  /**
   * Returns whether the given tile coordinates are colliding
   * @param {Number} x the x-coordinate to check
   * @param {Number} y the y-coordinate to check
   * @return {Boolean}
   */
  colliding(x, y) {
    return this.world.map.isColliding(x, y);
  }

  /**
   * Returns whether the associated character is a player
   * @return {Boolean}
   */
  isPlayer() {
    return this.character.type === 'player';
  }

  /**
   * Returns whether the associated character is a mob
   * @return {Boolean}
   */
  isMob() {
    return this.character.type === 'mob';
  }

  /**
   * Returns whether the current target is a mob
   * @return {Boolean}
   */
  isTargetMob() {
    return this.character.target.type === 'mob';
  }

  /**
   * Returns whether AoE attacks can be used against the given target
   * @param {Character} target the potential AoE target
   * @return {Boolean}
   */
  canAttackAoE(target) {
    return (
      this.isMob()
      || target.type === 'mob'
      || (this.isPlayer()
        && target.type === 'player'
        && target.pvp
        && this.character.pvp)
    );
  }
}
