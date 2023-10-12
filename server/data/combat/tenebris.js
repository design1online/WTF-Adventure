import _ from 'underscore';
import Combat from '../../js/game/entity/character/combat/combat';
import Messages from '../../js/network/messages';
import Packets from '../../js/network/packets';
import Utils from '../../js/util/utils';

export default class Tenebris extends Combat {
  constructor(character) {
    super(character);

    this.character = Object.assign(character, {
      spawnDistance: 24,
    });
    this.illusions = [];
    this.firstIllusionKilled = false;
    this.lastIllusion = new Date().getTime();
    this.respawnDelay = 95000;

    character.onDeath(() => {
      if (this.isIllusion()) {
        if (!this.firstIllusionKilled) {
          this.spawnTenbris();
        } else {
          this.removeIllusions();
          this.reset();
        }
      }
    });

    if (!this.isIllusion()) {
      this.forceTalk('Who dares summon Tenebris!');
    }
  }

  reset() {
    this.illusions = [];
    this.firstIllusionKilled = false;

    setTimeout(() => {
      const offset = Utils.positionOffset(4);

      this.world.spawnMob(105, 48 + offset.x, 338 + offset.y);
    }, this.respawnDelay);
  }

  hit(attacker, target, hitInfo) {
    if (this.isAttacked()) {
      this.beginIllusionAttack();
    }

    if (this.canSpawn()) {
      this.spawnIllusions();
    }

    super.hit(attacker, target, hitInfo);
  }

  spawnTenbris() {
    this.world.spawnMob(104, this.character.x, this.character.y);
  }

  spawnIllusions() {
    this.illusions.push(
      this.world.spawnMob(105, this.character.x + 1, this.character.y + 1),
    );
    this.illusions.push(
      this.world.spawnMob(105, this.character.x - 1, this.character.y + 1),
    );

    _.each(this.illusions, (illusion) => {
      illusion.onDeath(() => {
        if (this.isLast()) {
          this.lastIllusion = new Date().getTime();
        }

        this.illusions.splice(this.illusions.indexOf(illusion), 1);
      });

      if (this.isAttacked()) {
        this.beginIllusionAttack();
      }
    });

    this.character.setPosition(62, 343);
    this.world.pushToGroup(
      this.character.group,
      new Messages.Teleport(
        this.character.instance,
        this.character.x,
        this.character.y,
        true,
      ),
    );
  }

  removeIllusions() {
    this.lastIllusion = 0;

    const listCopy = this.illusions.slice();

    for (let i = 0; i < listCopy.length; i += 1) {
      this.world.kill(listCopy[i]);
    }
  }

  beginIllusionAttack() {
    if (!this.hasIllusions()) {
      return;
    }

    _.each(this.illusions, (illusion) => {
      const target = this.getRandomTarget();

      if (!illusion.hasTarget && target) {
        illusion.combat.begin(target);
      }
    });
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

  forceTalk(instance, message) {
    if (!this.world) {
      return;
    }

    this.world.pushToAdjacentGroups(
      this.character.target.group,
      new Messages.NPC(Packets.NPCOpcode.Talk, {
        id: instance,
        text: message,
        nonNPC: true,
      }),
    );
  }

  isLast() {
    return this.illusions.length === 1;
  }

  canSpawn() {
    return (
      !this.isIllusion()
      && !this.hasIllusions
      && new Date().getTime() - this.lastIllusion === 45000
      && Utils.randomInt(0, 4) === 2
    );
  }

  isIllusion() {
    return this.character.id === 105;
  }

  hasIllusions() {
    return this.illusions.length > 0;
  }
}
