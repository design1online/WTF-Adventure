export default class Hit {
  constructor(type, damage) {
    this.type = type;
    this.damage = damage;

    this.ranged = false;
    this.aoe = false;
    this.terror = false;
  }

  isRanged() {
    return this.ranged;
  }

  isAoE() {
    return this.aoe;
  }

  getDamage() {
    return this.damage;
  }

  getData() {
    return {
      type: this.type,
      damage: this.damage,
      isRanged: this.isRanged(),
      isAoE: this.isAoE(),
      hasTerror: this.terror,
    };
  }
}
