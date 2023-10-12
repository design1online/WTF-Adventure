import Equipment from './equipment.js';
import ItemsDictionary from '../../../../../util/items.js';

export default class Armour extends Equipment {
  constructor(name, id, count, ability, abilityLevel) {
    super(name, id, count, ability, abilityLevel);
    this.itemsDictionary = ItemsDictionary;
    this.defense = this.itemsDictionary.getArmourLevel(name);
  }

  hasAntiStun() {
    return this.ability === 6;
  }

  setDefense(defense) {
    this.defense = defense;
  }

  getDefense() {
    return this.defense;
  }
}
