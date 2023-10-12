import Slot from './slot';

export default class Container {
  constructor(size) {
    this.size = size;
    this.slots = [];

    for (let i = 0; i < this.size; i += 1) {
      this.slots.push(new Slot(i));
    }
  }

  /**
   * We receive information from the server here,
   * so we mustn't do any calculations. Instead,
   * we just modify the container directly.
   */
  setSlot(index, info) {
    this.slots[index].loadSlot(
      info.name,
      info.count,
      info.ability,
      info.abilityLevel,
      info.edible,
      info.equippable,
    );
  }

  getEmptySlot() {
    for (let i = 0; i < this.slots; i += 1) {
      if (!this.slots[i].name) {
        return i;
      }
    }

    return -1;
  }

  getImageFormat(scale, name) {
    return `url("/img/${scale}/item-${name}.png")`;
  }
}
