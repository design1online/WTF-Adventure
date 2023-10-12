import Equipment from './equipment.js';
import ItemsDictionary from '../../../../../util/items.js';

export default class Pendant extends Equipment {
  constructor(name, id, count, ability, abilityLevel) {
    super(name, id, count, ability, abilityLevel);
    this.itemsDictionary = ItemsDictionary;
    this.pendantLevel = this.itemsDictionary.getPendantLevel(name);
  }

  getBaseAmplifier() {
    return 1.0 + this.pendantLevel / 100;
  }
}
