import Equipment from './equipment.js';
import ItemsDictionary from '../../../../../util/items.js';

export default class Boots extends Equipment {
  constructor(name, id, count, ability, abilityLevel) {
    super(name, id, count, ability, abilityLevel);
    this.itemsDictionary = ItemsDictionary;
    this.bootsLevel = this.itemsDictionary.getBootsLevel(name);
  }

  getBaseAmplifier() {
    return 1.0 + this.bootsLevel / 200;
  }
}
