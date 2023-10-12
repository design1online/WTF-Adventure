import ItemsDictionary from '../../../../../util/items.js';

/**
 * Count represents the enchantment level of
 * the equipment child
 */
export default class Equipment {
  constructor(name, id, count, ability, abilityLevel) {
    this.name = name;
    this.id = id;
    this.count = count || 0;
    this.ability = ability || 0;
    this.abilityLevel = abilityLevel || 0;
    this.itemsDictionary = ItemsDictionary;
  }

  getName() {
    return this.name;
  }

  getId() {
    return this.id;
  }

  getCount() {
    return this.count;
  }

  getAbility() {
    return this.ability;
  }

  getAbilityLevel() {
    return this.abilityLevel;
  }

  getBaseAmplifier() {
    return 1.0;
  }

  getData() {
    return [
      this.itemsDictionary.idToName(this.id),
      this.itemsDictionary.idToString(this.id),
      this.count,
      this.ability,
      this.abilityLevel,
    ];
  }

  getName() {
    return this.itemsDictionary.idToString(this.id);
  }

  getItem() {
    return {
      name: this.name,
      string: this.itemsDictionary.idToString(this.id),
      id: this.id,
      count: this.count,
      ability: this.ability,
      abilityLevel: this.abilityLevel,
    };
  }
}
