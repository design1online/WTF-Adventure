import _ from 'underscore';
import Character from '../character.js';
import MobsDictionary from '../../../../util/mobs.js';
import Utils from '../../../../util/utils.js';
import ItemsDictionary from '../../../../util/items.js';

/**
 * Represents a mob (non-player enemy) character in the game world
 * @class
 */
export default class Mob extends Character {
  /**
   * Default constructor
   * @param {String} id the mob type identifier
   * @param {String} instance the unique instance identifier
   * @param {Number} x the starting x-coordinate
   * @param {Number} y the starting y-coordinate
   */
  constructor(id, instance, x, y) {
    super(id, 'mob', instance, x, y);

    if (!MobsDictionary.exists(id)) {
      log.notice('Mob not found', id, instance, x, y);
      return;
    }

    /**
     * The mob data entry from the mobs dictionary
     * @type {Object}
     */
    this.data = MobsDictionary.exists(this.id);
    /**
     * The current hit points of this mob
     * @type {Number}
     */
    this.hitPoints = this.data.hitPoints;
    /**
     * The maximum hit points of this mob
     * @type {Number}
     */
    this.maxHitPoints = this.data.hitPoints;
    /**
     * The drop table for this mob
     * @type {Object}
     */
    this.drops = this.data.drops;

    /**
     * The delay in milliseconds before this mob respawns
     * @type {Number}
     */
    this.respawnDelay = this.data.spawnDelay;

    /**
     * The level of this mob
     * @type {Number}
     */
    this.level = this.data.level;

    /**
     * The armour level of this mob
     * @type {Number}
     */
    this.armourLevel = this.data.armour;
    /**
     * The weapon level of this mob
     * @type {Number}
     */
    this.weaponLevel = this.data.weapon;
    /**
     * The attack range of this mob in tiles
     * @type {Number}
     */
    this.attackRange = this.data.attackRange;
    /**
     * The aggro range of this mob in tiles
     * @type {Number}
     */
    this.aggroRange = this.data.aggroRange;
    /**
     * Whether this mob is aggressive toward players
     * @type {Boolean}
     */
    this.aggressive = this.data.aggressive;

    /**
     * The spawn location coordinates of this mob
     * @type {Array}
     */
    this.spawnLocation = [x, y];

    /**
     * Whether this mob is currently dead
     * @type {Boolean}
     */
    this.dead = false;
    /**
     * Whether this mob is a boss
     * @type {Boolean}
     */
    this.boss = false;
    /**
     * Whether this mob is a static world entity
     * @type {Boolean}
     */
    this.static = false;

    /**
     * The name of the projectile sprite this mob uses
     * @type {String}
     */
    this.projectileName = this.getProjectileName();
  }

  /**
   * Resets this mob's hit points to full and triggers the refresh callback
   */
  refresh() {
    this.hitPoints = this.data.hitPoints;
    this.maxHitPoints = this.data.hitPoints;

    if (this.refreshCallback) this.refreshCallback();
  }

  /**
   * Randomly selects and returns a drop from this mob's drop table
   * @return {Object|null}
   */
  getDrop() {
    if (!this.drops) {
      return null;
    }

    let min = 0;
    let percent = 0;
    const random = Utils.randomInt(0, 1000);

    for (const drop in this.drops) {
      if (this.drops.hasOwnProperty(drop)) {
        const chance = this.drops[drop];

        min = percent;
        percent += chance;

        if (random >= min && random < percent) {
          let count = 1;

          if (drop === 'gold') {
            count = Utils.randomInt(
              1,
              this.level
              * Math.floor(Math.pow(2, this.level / 7) / (this.level / 4)),
            );
          }

          return {
            id: ItemsDictionary.stringToId(drop),
            count,
          };
        }
      }
    }

    return null;
  }

  /**
   * Returns the projectile sprite name for this mob
   * @return {String}
   */
  getProjectileName() {
    return this.data.projectileName
      ? this.data.projectileName
      : 'projectile-pinearrow';
  }

  /**
   * Returns whether this mob can aggro the given player
   * @param {Character} player the player to check
   * @return {Boolean}
   */
  canAggro(player) {
    if (
      this.hasTarget()
      || !this.aggressive
      || Math.floor(this.level * 1.5) < player.level
    ) return false;

    return this.isNear(player, this.aggroRange);
  }

  /**
   * Marks this mob as dead, resets its position, and schedules a respawn
   */
  destroy() {
    this.dead = true;
    this.clearTarget();
    this.resetPosition();
    this.respawn();

    if (this.area) {
      this.area.removeEntity(this);
    }
  }

  /**
   * Clears the target and moves this mob back to its spawn location
   */
  return() {
    this.clearTarget();
    this.resetPosition();
    this.move(this.x, this.y);
  }

  /**
   * Returns whether this mob uses ranged attacks
   * @return {Boolean}
   */
  isRanged() {
    return this.attackRange > 1;
  }

  /**
   * Returns the distance from this mob to its spawn location
   * @return {Number}
   */
  distanceToSpawn() {
    return this.getCoordDistance(this.spawnLocation[0], this.spawnLocation[1]);
  }

  /**
   * Returns whether this mob is at its spawn location
   * @return {Boolean}
   */
  isAtSpawn() {
    return this.x === this.spawnLocation[0] && this.y === this.spawnLocation[1];
  }

  /**
   * Returns whether this mob is outside its spawn distance
   * @return {Boolean}
   */
  isOutsideSpawn() {
    return this.distanceToSpawn() > this.spawnDistance;
  }

  /**
   * Adds this mob to the nearest chest area if one contains its position
   * @param {Array} chestAreas the list of chest area objects
   */
  addToChestArea(chestAreas) {
    const area = _.find(chestAreas, coords => coords.contains(this.x, this.y));

    if (area) {
      area.addEntity(this);
    }
  }

  /**
   * Schedules a respawn if this mob is static and has a valid respawn delay
   */
  respawn() {
    /**
     * Some entities are static (only spawned once during an event)
     * Meanwhile, other entities act as an illusion to another entity,
     * so the resawning script is handled elsewhere.
     */

    if (!this.static || this.respawnDelay === -1) {
      return;
    }

    setTimeout(() => {
      if (this.respawnCallback) {
        this.respawnCallback();
      }
    }, this.respawnDelay);
  }

  /**
   * Returns the serializable state of this mob
   * @return {Object}
   */
  getState() {
    const base = super.getState();

    base.hitPoints = this.hitPoints;
    base.maxHitPoints = this.maxHitPoints;
    base.attackRange = this.attackRange;
    base.level = this.level;

    return base;
  }

  /**
   * Resets this mob's position to its spawn location
   */
  resetPosition() {
    this.setPosition(this.spawnLocation[0], this.spawnLocation[1]);
  }

  /**
   * Registers a callback for when this mob respawns
   * @param {Function} callback the callback to invoke
   */
  onRespawn(callback) {
    /** @type {Function} */
    this.respawnCallback = callback;
  }

  /**
   * Registers a callback for when this mob moves
   * @param {Function} callback the callback to invoke
   */
  onMove(callback) {
    /** @type {Function} */
    this.moveCallback = callback;
  }

  /**
   * Registers a callback for when this mob returns to spawn
   * @param {Function} callback the callback to invoke
   */
  onReturn(callback) {
    /** @type {Function} */
    this.returnCallback = callback;
  }

  /**
   * Registers a callback for when this mob refreshes its state
   * @param {Function} callback the callback to invoke
   */
  onRefresh(callback) {
    /** @type {Function} */
    this.refreshCallback = callback;
  }

  /**
   * Registers a callback for when this mob dies
   * @param {Function} callback the callback to invoke
   */
  onDeath(callback) {
    /** @type {Function} */
    this.deathCallback = callback;
  }

  /**
   * Moves this mob to the given coordinates and triggers the move callback
   * @param {Number} x the target x-coordinate
   * @param {Number} y the target y-coordinate
   */
  move(x, y) {
    this.setPosition(x, y);

    if (this.moveCallback) {
      this.moveCallback(this);
    }
  }
}
