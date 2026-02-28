import Entity from '../entity.js';
import Combat from './combat/combat.js';
import Modules from '../../../util/modules.js';
import MobsDictionary from '../../../util/mobs.js';

/**
 * Represents a character entity capable of combat and movement
 * @class
 */
export default class Character extends Entity {
  /**
   * Default constructor
   * @param {String} id the character type identifier
   * @param {String} type the character type string (e.g. 'mob', 'player')
   * @param {String} instance the unique instance identifier
   * @param {Number} x the starting x-coordinate
   * @param {Number} y the starting y-coordinate
   */
  constructor(id, type, instance, x, y) {
    super(id, type, instance, x, y);

    /**
     * The level of this character
     * @type {Number}
     */
    this.level = -1;
    /**
     * Whether this character's data has been fully loaded
     * @type {Boolean}
     */
    this.loaded = false;

    /**
     * The movement speed of this character in milliseconds per tile
     * @type {Number}
     */
    this.movementSpeed = 150;
    /**
     * The attack range of this character in tiles
     * @type {Number}
     */
    this.attackRange = 1;
    /**
     * The rate at which this character attacks in milliseconds
     * @type {Number}
     */
    this.attackRate = 1000;
    /**
     * The rate at which this character heals in milliseconds
     * @type {Number}
     */
    this.healingRate = 7000;

    /**
     * The maximum distance from spawn this character will pursue targets
     * @type {Number}
     */
    this.spawnDistance = 7;

    /**
     * The previous x-coordinate before the last movement
     * @type {Number}
     */
    this.previousX = -1;
    /**
     * The previous y-coordinate before the last movement
     * @type {Number}
     */
    this.previousY = -1;

    /**
     * The current hit points of this character
     * @type {Number}
     */
    this.hitPoints = -1;
    /**
     * The maximum hit points of this character
     * @type {Number}
     */
    this.maxHitPoints = -1;

    /**
     * Whether this character is dead
     * @type {Boolean}
     */
    this.dead = false;
    /**
     * Whether this character will attack players on sight
     * @type {Boolean}
     */
    this.aggressive = false;
    /**
     * The range in tiles within which this character becomes aggressive
     * @type {Number}
     */
    this.aggroRange = 2;

    /**
     * Whether this character is frozen and cannot move
     * @type {Boolean}
     */
    this.frozen = false;
    /**
     * Whether this character is stunned and cannot act
     * @type {Boolean}
     */
    this.stunned = false;

    /**
     * The current combat target of this character
     * @type {Character|null}
     */
    this.target = null;
    /**
     * A potential target this character may engage
     * @type {Character|null}
     */
    this.potentialTarget = null;

    /**
     * The timeout handle for clearing the stun state
     * @type {Object|null}
     */
    this.stunTimeout = null;

    /**
     * The projectile type used by this character
     * @type {Number}
     */
    this.projectile = Modules.Projectiles.Arrow;
    /**
     * The name of the projectile sprite used by this character
     * @type {String}
     */
    this.projectileName = 'projectile-pinearrow';

    /**
     * The interval handle for the healing tick
     * @type {Object|null}
     */
    this.healingInterval = null;

    /**
     * Reference to the mobs dictionary for combat plugin lookups
     * @type {Object}
     */
    this.mobsDictionary = MobsDictionary;

    this.loadCombat();
    this.startHealing();
  }

  /**
   * Loads the combat instance, using a custom plugin if available
   */
  loadCombat() {
    if (this.mobsDictionary.hasCombatPlugin(this.id)) {
      /** @type {Combat} */
      this.combat = new (this.mobsDictionary.isNewCombatPlugin(this.id))(this);
    } else {
      this.combat = new Combat(this);
    }
  }

  /**
   * Sets the stunned state and triggers the stun callback
   * @param {Boolean} stun whether the character is stunned
   */
  setStun(stun) {
    this.stunned = stun;

    if (this.stunCallback) {
      this.stunCallback(stun);
    }
  }

  /**
   * Starts the healing interval that periodically restores hit points
   */
  startHealing() {
    this.healingInterval = setInterval(() => {
      if (
        !this.hasTarget()
        && !this.combat.isAttacked()
        && !this.dead
        && this.loaded
      ) {
        this.heal(1);
      }
    }, 5000);
  }

  /**
   * Stops and clears the healing interval
   */
  stopHealing() {
    clearInterval(this.healingInterval);
    this.healingInterval = null;
  }

  /**
   * Triggers the hit callback when this character is attacked
   * @param {Character} attacker the attacking character
   */
  hit(attacker) {
    if (this.hitCallback) {
      this.hitCallback(attacker);
    }
  }

  /**
   * Restores the character's hit points by a given amount
   * @param {Number} amount the amount to heal
   */
  heal(amount) {
    this.setHitPoints(this.hitPoints + amount);

    if (this.hitPoints > this.maxHitPoints) {
      this.hitPoints = this.maxHitPoints;
    }
  }

  /**
   * Returns whether this character uses ranged attacks
   * @return {Boolean}
   */
  isRanged() {
    return this.attackRange > 1;
  }

  /**
   * Reduces the character's hit points by the given damage amount
   * @param {Number} damage the amount of damage to apply
   */
  applyDamage(damage) {
    this.hitPoints -= damage;
  }

  /**
   * Returns whether this character is dead
   * @return {Boolean}
   */
  isDead() {
    return this.hitPoints < 1 || this.dead;
  }

  /**
   * Returns the combat instance for this character
   * @return {Combat}
   */
  getCombat() {
    return this.combat;
  }

  /**
   * Returns the current hit points of this character
   * @return {Number}
   */
  getHitPoints() {
    return this.hitPoints;
  }

  /**
   * Returns the maximum hit points of this character
   * @return {Number}
   */
  getMaxHitPoints() {
    return this.maxHitPoints;
  }

  /**
   * Sets the position of this character and triggers the movement callback
   * @param {Number} x the new x-coordinate
   * @param {Number} y the new y-coordinate
   */
  setPosition(x, y) {
    super.setPosition(x, y);

    if (this.movementCallback) {
      this.movementCallback(x, y);
    }
  }

  /**
   * Sets the current combat target and triggers the target callback
   * @param {Character} target the new target
   */
  setTarget(target) {
    this.target = target;

    if (this.targetCallback) {
      this.targetCallback(target);
    }
  }

  /**
   * Sets a potential target for this character
   * @param {Character} potentialTarget the potential target
   */
  setPotentialTarget(potentialTarget) {
    this.potentialTarget = potentialTarget;
  }

  /**
   * Sets the hit points and triggers the health change callback
   * @param {Number} hitPoints the new hit points value
   */
  setHitPoints(hitPoints) {
    this.hitPoints = hitPoints;

    if (this.hitPointsCallback) {
      this.hitPointsCallback();
    }
  }

  /**
   * Returns the projectile type used by this character
   * @return {Number}
   */
  getProjectile() {
    return this.projectile;
  }

  /**
   * Returns the projectile sprite name used by this character
   * @return {String}
   */
  getProjectileName() {
    return this.projectileName;
  }

  /**
   * Returns the drop for this character on death
   * @return {null}
   */
  getDrop() {
    return null;
  }

  /**
   * Returns whether this character is at maximum hit points
   * @return {Boolean}
   */
  hasMaxHitPoints() {
    return this.hitPoints >= this.maxHitPoints;
  }

  /**
   * Removes the current target and triggers the remove target callback
   */
  removeTarget() {
    if (this.removeTargetCallback) {
      this.removeTargetCallback();
    }

    this.target = null;
  }

  /**
   * Returns whether this character currently has a target
   * @return {Boolean}
   */
  hasTarget() {
    return !(this.target === null);
  }

  /**
   * Returns whether a given entity is this character's potential target
   * @param {Character} potentialTarget the entity to check
   * @return {Boolean}
   */
  hasPotentialTarget(potentialTarget) {
    return this.potentialTarget === potentialTarget;
  }

  /**
   * Clears the current target without triggering the callback
   */
  clearTarget() {
    this.target = null;
  }

  /**
   * Registers a callback for when this character acquires a new target
   * @param {Function} callback the callback to invoke
   */
  onTarget(callback) {
    /** @type {Function} */
    this.targetCallback = callback;
  }

  /**
   * Registers a callback for when this character's target is removed
   * @param {Function} callback the callback to invoke
   */
  onRemoveTarget(callback) {
    /** @type {Function} */
    this.removeTargetCallback = callback;
  }

  /**
   * Registers a callback for when this character moves
   * @param {Function} callback the callback to invoke
   */
  onMovement(callback) {
    /** @type {Function} */
    this.movementCallback = callback;
  }

  /**
   * Registers a callback for when this character is hit
   * @param {Function} callback the callback to invoke
   */
  onHit(callback) {
    /** @type {Function} */
    this.hitCallback = callback;
  }

  /**
   * Registers a callback for when this character's health changes
   * @param {Function} callback the callback to invoke
   */
  onHealthChange(callback) {
    /** @type {Function} */
    this.hitPointsCallback = callback;
  }

  /**
   * Registers a callback for when this character deals damage
   * @param {Function} callback the callback to invoke
   */
  onDamage(callback) {
    /** @type {Function} */
    this.damageCallback = callback;
  }

  /**
   * Registers a callback for when this character's stun state changes
   * @param {Function} callback the callback to invoke
   */
  onStunned(callback) {
    /** @type {Function} */
    this.stunCallback = callback;
  }

  /**
   * Registers a callback for when this character triggers an AoE sub-event
   * @param {Function} callback the callback to invoke
   */
  onSubAoE(callback) {
    /** @type {Function} */
    this.subAoECallback = callback;
  }
}
