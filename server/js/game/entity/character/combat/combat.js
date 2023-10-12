import _ from 'underscore';
import CombatQueue from './combatqueue.js';
import Utils from '../../../../util/utils.js';
import Formulas from '../../../formulas.js';
import Hit from './hit.js';
import Modules from '../../../../util/modules.js';
import Messages from '../../../../network/messages.js';
import Packets from '../../../../network/packets.js';

export default class Combat {
  constructor(character) {
    this.character = character;
    this.world = null;

    this.attackers = {};

    this.retaliate = false;

    this.queue = new CombatQueue();

    this.attacking = false;

    this.attackLoop = null;
    this.followLoop = null;
    this.checkLoop = null;

    this.first = false;
    this.started = false;
    this.lastAction = -1;
    this.lastHit = -1;

    this.lastActionThreshold = 7000;

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

  begin(attacker) {
    this.start();

    this.character.setTarget(attacker);
    this.addAttacker(attacker);

    attacker.combat.addAttacker(this.character); // For mobs attacking players..

    this.attack(attacker);
  }

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

  forceAttack() {
    if (!this.character.target || !this.inProximity()) return;

    this.stop();
    this.start();

    this.attackCount(2, this.character.target);
    this.hit(this.character, this.character.target, this.queue.getHit());
  }

  attackCount(count, target) {
    for (let i = 0; i < count; i += 1) this.attack(target);
  }

  addAttacker(character) {
    if (this.hasAttacker(character)) return;

    this.attackers[character.instance] = character;
  }

  removeAttacker(character) {
    if (this.hasAttacker(character)) delete this.attackers[character.instance];

    if (!this.isAttacked()) this.sendToSpawn();
  }

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

  hasAttacker(character) {
    if (!this.isAttacked()) {
      return null;
    }

    return character.instance in this.attackers;
  }

  onSameTile() {
    if (!this.character.target || this.character.type !== 'mob') {
      return false;
    }

    return (
      this.character.x === this.character.target.x
      && this.character.y === this.character.target.y
    );
  }

  isAttacked() {
    return this.attackers && Object.keys(this.attackers).length > 0;
  }

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

  isRetaliating() {
    return (
      this.isPlayer()
      && !this.character.hasTarget()
      && this.retaliate
      && !this.character.moving
      && new Date().getTime() - this.character.lastMovement > 1500
    );
  }

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

  setWorld(world) {
    if (!this.world) this.world = world;
  }

  forget() {
    this.attackers = {};
    this.character.removeTarget();

    if (this.forgetCallback) this.forgetCallback();
  }

  move(character, x, y) {
    /**
     * The server and mob types can parse the mob movement
     */

    if (character.type !== 'mob') return;

    character.move(x, y);
  }

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

  end() {
    this.world.pushBroadcast(
      new Messages.Combat(
        Packets.CombatOpcode.Finish,
        this.character.instance,
        null,
      ),
    );
  }

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

  forEachAttacker(callback) {
    _.each(this.attackers, (attacker) => {
      callback(attacker);
    });
  }

  onForget(callback) {
    this.forgetCallback = callback;
  }

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

  getTime() {
    return new Date().getTime();
  }

  colliding(x, y) {
    return this.world.map.isColliding(x, y);
  }

  isPlayer() {
    return this.character.type === 'player';
  }

  isMob() {
    return this.character.type === 'mob';
  }

  isTargetMob() {
    return this.character.target.type === 'mob';
  }

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
