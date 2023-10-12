export default class Slot {
  constructor(index) {
    this.index = index;
    this.name = null;
    this.count = -1;
    this.ability = -1;
    this.abilityLevel = -1;
    this.edible = false;
    this.equippable = false;
  }

  loadSlot(name, count, ability, abilityLevel, edible, equippable) {
    this.name = name;
    this.count = count;
    this.ability = ability;
    this.abilityLevel = abilityLevel;
    this.edible = edible;
    this.equippable = equippable;
  }

  empty() {
    this.name = null;
    this.count = -1;
    this.ability = -1;
    this.abilityLevel = -1;
    this.edible = false;
    this.equippable = false;
  }

  isEmpty() {
    return this.name === null || this.count === -1;
  }

  setCount(count) {
    this.count = count;
  }
}
