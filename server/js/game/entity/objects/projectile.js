import Entity from '../entity.js';

export default class Projectile extends Entity {
  constructor(id, instance) {
    super(id, 'projectile', instance);

    this.startX = -1;
    this.startY = -1;
    this.destX = -1;
    this.destY = -1;
    this.target = null;
    this.damage = -1;
    this.hitType = null;
    this.owner = null;
  }

  setStart(x, y) {
    this.x = x;
    this.y = y;
  }

  setTarget(target) {
    this.target = target;

    this.destX = target.x;
    this.destY = target.y;
  }

  setStaticTarget(x, y) {
    this.static = true;

    this.destX = x;
    this.destY = y;
  }

  getData() {
    /**
     * Cannot generate a projectile
     * unless it has a target.
     */

    if (!this.owner || !this.target) {
      return null;
    }

    return {
      id: this.instance,
      name: this.owner.projectileName,
      characterId: this.owner.instance,
      targetId: this.target.instance,
      damage: this.damage,
      special: this.special,
      hitType: this.hitType,
      type: this.type,
    };
  }
}
