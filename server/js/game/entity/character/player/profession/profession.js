export default class Profession {
  constructor() {
    this.id = -1;
    this.name = null;
    this.level = -1;
    this.maxLevel = -1;
    this.experience = -1;
  }

  load(id, name, level, maxLevel) {
    this.id = id;
    this.name = name;
    this.level = level;
    this.maxLevel = maxLevel;
  }
}
