import Items from '../../../../../util/items.js';

export default class Slot {
  constructor(index) {
    this.index = index;
    this.id = -1;
    this.count = -1;
    this.ability = -1;
    this.abilityLevel = -1;
    this.name = null;
  }

  loadSlot(id, count, ability, abilityLevel) {
    this.id = parseInt(id, 10);
    this.count = parseInt(count, 10);
    this.ability = parseInt(ability, 10);
    this.abilityLevel = parseInt(abilityLevel, 10);

    this.name = Items.idToString(this.id);
    this.edible = Items.isEdible(this.id);
    this.equippable = Items.isEquippable(this.name);

    this.verify();
  }

  empty() {
    this.id = -1;
    this.count = -1;
    this.ability = -1;
    this.abilityLevel = -1;
    this.name = null;
  }

  increment(amount) {
    this.count += parseInt(amount, 10);
    this.verify();
  }

  decrement(amount) {
    this.count -= parseInt(amount, 10);
    this.verify();
  }

  verify() {
    if (isNaN(this.count)) {
      this.count = 1;
    }
  }

  getData() {
    return {
      index: this.index,
      name: this.name,
      count: this.count,
      ability: this.ability,
      abilityLevel: this.abilityLevel,
    };
  }
}
