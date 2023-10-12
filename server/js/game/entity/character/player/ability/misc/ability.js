import Abilities from '../../../../../../util/abilities';

export default class Ability {
  constructor(name, type) {
    this.name = name;
    this.type = type;
    this.level = -1;

    this.data = Abilities.data[name];
  }
}
