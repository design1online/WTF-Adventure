import Equipment from './equipment.js';
import ItemsDictionary from '../../../../../util/items.js';

export default class Weapon extends Equipment {
  constructor(name, id, count, ability, abilityLevel) {
    super(name, id, count, ability, abilityLevel);
    this.itemsDictionary = ItemsDictionary;
    this.level = this.itemsDictionary.getWeaponLevel(name);
    this.ranged = this.itemsDictionary.isArcherWeapon(name);
    this.breakable = false;
  }

  hasCritical() {
    return this.ability === 1;
  }

  hasExplosive() {
    return this.ability === 4;
  }

  hasStun() {
    return this.ability === 5;
  }

  isRanged() {
    return this.ranged;
  }

  setLevel(level) {
    this.level = level;
  }

  getLevel() {
    return this.level;
  }
}
