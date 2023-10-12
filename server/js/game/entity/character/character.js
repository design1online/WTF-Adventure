import Entity from '../entity.js';
import Combat from './combat/combat.js';
import Modules from '../../../util/modules.js';
import MobsDictionary from '../../../util/mobs.js';

export default class Character extends Entity {
  constructor(id, type, instance, x, y) {
    super(id, type, instance, x, y);

    this.level = -1;
    this.loaded = false;

    this.movementSpeed = 150;
    this.attackRange = 1;
    this.attackRate = 1000;
    this.healingRate = 7000;

    this.spawnDistance = 7;

    this.previousX = -1;
    this.previousY = -1;

    this.hitPoints = -1;
    this.maxHitPoints = -1;

    this.dead = false;
    this.aggressive = false;
    this.aggroRange = 2;

    this.frozen = false;
    this.stunned = false;

    this.target = null;
    this.potentialTarget = null;

    this.stunTimeout = null;

    this.projectile = Modules.Projectiles.Arrow;
    this.projectileName = 'projectile-pinearrow';

    this.healingInterval = null;

    this.mobsDictionary = MobsDictionary;

    this.loadCombat();
    this.startHealing();
  }

  loadCombat() {
    if (this.mobsDictionary.hasCombatPlugin(this.id)) {
      this.combat = new (this.mobsDictionary.isNewCombatPlugin(this.id))(this);
    } else {
      this.combat = new Combat(this);
    }
  }

  setStun(stun) {
    this.stunned = stun;

    if (this.stunCallback) {
      this.stunCallback(stun);
    }
  }

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

  stopHealing() {
    clearInterval(this.healingInterval);
    this.healingInterval = null;
  }

  hit(attacker) {
    if (this.hitCallback) {
      this.hitCallback(attacker);
    }
  }

  heal(amount) {
    this.setHitPoints(this.hitPoints + amount);

    if (this.hitPoints > this.maxHitPoints) {
      this.hitPoints = this.maxHitPoints;
    }
  }

  isRanged() {
    return this.attackRange > 1;
  }

  applyDamage(damage) {
    this.hitPoints -= damage;
  }

  isDead() {
    return this.hitPoints < 1 || this.dead;
  }

  getCombat() {
    return this.combat;
  }

  getHitPoints() {
    return this.hitPoints;
  }

  getMaxHitPoints() {
    return this.maxHitPoints;
  }

  setPosition(x, y) {
    super.setPosition(x, y);

    if (this.movementCallback) {
      this.movementCallback(x, y);
    }
  }

  setTarget(target) {
    this.target = target;

    if (this.targetCallback) {
      this.targetCallback(target);
    }
  }

  setPotentialTarget(potentialTarget) {
    this.potentialTarget = potentialTarget;
  }

  setHitPoints(hitPoints) {
    this.hitPoints = hitPoints;

    if (this.hitPointsCallback) {
      this.hitPointsCallback();
    }
  }

  getProjectile() {
    return this.projectile;
  }

  getProjectileName() {
    return this.projectileName;
  }

  getDrop() {
    return null;
  }

  hasMaxHitPoints() {
    return this.hitPoints >= this.maxHitPoints;
  }

  removeTarget() {
    if (this.removeTargetCallback) {
      this.removeTargetCallback();
    }

    this.target = null;
  }

  hasTarget() {
    return !(this.target === null);
  }

  hasPotentialTarget(potentialTarget) {
    return this.potentialTarget === potentialTarget;
  }

  clearTarget() {
    this.target = null;
  }

  onTarget(callback) {
    this.targetCallback = callback;
  }

  onRemoveTarget(callback) {
    this.removeTargetCallback = callback;
  }

  onMovement(callback) {
    this.movementCallback = callback;
  }

  onHit(callback) {
    this.hitCallback = callback;
  }

  onHealthChange(callback) {
    this.hitPointsCallback = callback;
  }

  onDamage(callback) {
    this.damageCallback = callback;
  }

  onStunned(callback) {
    this.stunCallback = callback;
  }

  onSubAoE(callback) {
    this.subAoECallback = callback;
  }
}
