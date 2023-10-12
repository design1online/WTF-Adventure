import _ from 'underscore';
import Character from '../character.js';
import MobsDictionary from '../../../../util/mobs.js';
import Utils from '../../../../util/utils.js';
import ItemsDictionary from '../../../../util/items.js';

export default class Mob extends Character {
  constructor(id, instance, x, y) {
    super(id, 'mob', instance, x, y);

    if (!MobsDictionary.exists(id)) {
      log.notice('Mob not found', id, instance, x, y);
      return;
    }

    this.data = MobsDictionary.exists(this.id);
    this.hitPoints = this.data.hitPoints;
    this.maxHitPoints = this.data.hitPoints;
    this.drops = this.data.drops;

    this.respawnDelay = this.data.spawnDelay;

    this.level = this.data.level;

    this.armourLevel = this.data.armour;
    this.weaponLevel = this.data.weapon;
    this.attackRange = this.data.attackRange;
    this.aggroRange = this.data.aggroRange;
    this.aggressive = this.data.aggressive;

    this.spawnLocation = [x, y];

    this.dead = false;
    this.boss = false;
    this.static = false;

    this.projectileName = this.getProjectileName();
  }

  refresh() {
    this.hitPoints = this.data.hitPoints;
    this.maxHitPoints = this.data.hitPoints;

    if (this.refreshCallback) this.refreshCallback();
  }

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

  getProjectileName() {
    return this.data.projectileName
      ? this.data.projectileName
      : 'projectile-pinearrow';
  }

  canAggro(player) {
    if (
      this.hasTarget()
      || !this.aggressive
      || Math.floor(this.level * 1.5) < player.level
    ) return false;

    return this.isNear(player, this.aggroRange);
  }

  destroy() {
    this.dead = true;
    this.clearTarget();
    this.resetPosition();
    this.respawn();

    if (this.area) {
      this.area.removeEntity(this);
    }
  }

  return() {
    this.clearTarget();
    this.resetPosition();
    this.move(this.x, this.y);
  }

  isRanged() {
    return this.attackRange > 1;
  }

  distanceToSpawn() {
    return this.getCoordDistance(this.spawnLocation[0], this.spawnLocation[1]);
  }

  isAtSpawn() {
    return this.x === this.spawnLocation[0] && this.y === this.spawnLocation[1];
  }

  isOutsideSpawn() {
    return this.distanceToSpawn() > this.spawnDistance;
  }

  addToChestArea(chestAreas) {
    const area = _.find(chestAreas, coords => coords.contains(this.x, this.y));

    if (area) {
      area.addEntity(this);
    }
  }

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

  getState() {
    const base = super.getState();

    base.hitPoints = this.hitPoints;
    base.maxHitPoints = this.maxHitPoints;
    base.attackRange = this.attackRange;
    base.level = this.level;

    return base;
  }

  resetPosition() {
    this.setPosition(this.spawnLocation[0], this.spawnLocation[1]);
  }

  onRespawn(callback) {
    this.respawnCallback = callback;
  }

  onMove(callback) {
    this.moveCallback = callback;
  }

  onReturn(callback) {
    this.returnCallback = callback;
  }

  onRefresh(callback) {
    this.refreshCallback = callback;
  }

  onDeath(callback) {
    this.deathCallback = callback;
  }

  move(x, y) {
    this.setPosition(x, y);

    if (this.moveCallback) {
      this.moveCallback(this);
    }
  }
}
