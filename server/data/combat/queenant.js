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
export default class QueenAnt extends Combat {
  constructor(character) {
    super(character);

    this.lastActionThreshold = 10000; // Due to the nature of the AoE attack
    this.character = Object.assign(character, {
      spawnDistance: 18,
    });
    this.aoeTimeout = null;
    this.aoeCountdown = 5;
    this.aoeRadius = 2;
    this.lastAoE = 0;
    this.minionCount = 7;
    this.lastSpawn = 0;
    this.minions = [];
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

  begin(attacker) {
    this.resetAoE();
    super.begin(attacker);
  }

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
  doAoE() {
    this.resetAoE();
    this.lastHit = this.getTime();
    this.pushFreeze(true);
    this.pushCountdown(this.aoeCountdown);

    this.aoeTimeout = setTimeout(() => {
      this.dealAoE(this.aoeRadius, true);
      this.pushFreeze(false);
    }, 5000);
  }

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

  resetAoE() {
    this.lastAoE = new Date().getTime();
  }

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

  pushFreeze(state) {
    this.character.frozen = state;
    this.character.stunned = state;
  }

  pushCountdown(count) {
    this.world.pushToAdjacentGroups(
      this.character.group,
      new Messages.NPC(Packets.NPCOpcode.Countdown, {
        id: this.character.instance,
        countdown: count,
      }),
    );
  }

  getMinions() {
    this.world.getGrids();
  }

  isLast() {
    return this.minions.length === 1;
  }

  hasMinions() {
    return this.minions.length > 0;
  }

  canCastAoE() {
    return new Date().getTime() - this.lastAoE > 30000;
  }

  canSpawn() {
    return (
      new Date().getTime() - this.lastSpawn > 45000
      && !this.hasMinions()
      && this.isAttacked()
    );
  }
}
