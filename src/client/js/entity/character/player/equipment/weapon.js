import Equipment from './equipment';

export default class Weapon extends Equipment {
  constructor(name, count, ability, abilityLevel) {
    super(name, count, ability, abilityLevel);

    this.level = -1;
    this.damage = -1;
    this.ranged = false;
  }

  setDamage(damage) {
    this.damage = damage;
  }

  setLevel(level) {
    this.level = level;
  }

  getDamage() {
    return this.damage;
  }

  getLevel() {
    return this.level;
  }
}
