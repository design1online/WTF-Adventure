var Equipment = require("./equipment"),
  Items = require("../../../../../util/items");

module.exports = Weapon = Equipment.extend({
  constructor(name, id, count, ability, abilityLevel) {
    

    this._super(name, id, count, ability, abilityLevel);

    this.level = Items.getWeaponLevel(name);
    this.ranged = Items.isArcherWeapon(name);
    this.breakable = false;
  },

  hasCritical() {
    return this.ability === 1;
  },

  hasExplosive() {
    return this.ability === 4;
  },

  hasStun() {
    return this.ability === 5;
  },

  isRanged() {
    return this.ranged;
  },

  setLevel(level) {
    this.level = level;
  },

  getLevel() {
    return this.level;
  }
});
