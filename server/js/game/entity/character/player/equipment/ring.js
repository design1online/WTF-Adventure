import Equipment from './equipment.js';
import ItemsDictionary from '../../../../../util/items.js';

export default class Ring extends Equipment {
  constructor(name, id, count, ability, abilityLevel) {
    super(name, id, count, ability, abilityLevel);
    this.itemsDictionary = ItemsDictionary;
    this.ringLevel = this.itemsDictionary.getRingLevel(name);
  }

  getBaseAmplifier() {
    return 1.0 + this.ringLevel / 150;
  }
}
