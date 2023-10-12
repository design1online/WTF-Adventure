import Combat from '../../js/game/entity/character/combat/combat';
import Modules from '../../js/util/modules';

export default class GreatSquid extends Combat {
  constructor(character) {
    super(character);

    this.character = Object.assign(character, {
      spawnDistance: 15,
    });

    this.lastTerror = new Date().getTime();
  }

  hit(character, target, hitInfo) {
    if (this.canUseTerror()) {
      hitInfo.type = Modules.Hits.Stun; // eslint-disable-line

      this.lastTerror = new Date().getTime();
    }

    super.hit(character, target, hitInfo);
  }

  canUseTerror() {
    return new Date().getTime() - this.lastTerror > 15000;
  }
}
