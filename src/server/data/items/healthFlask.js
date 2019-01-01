var Item = require("../../js/game/entity/objects/item.js"),
  Utils = require("../../js/util/utils"),
  Items = require("../../js/util/items");
module.exports = Flask = Item.extend({
  init(id, instance, x, y) {
    var self = this;
    this._super(id, instance, x, y);

    this.healAmount = 0;
    this.manaAmount = 0;

    var customData = Items.getCustomData(id);
    if (customData) {
      this.healAmount = customData.healAmount ? customData.healAmount : 0;
      this.manaAmount = customData.manaAmount ? customData.manaAmount : 0;
    }
  },

  onUse(character) {
    var self = this;
    if (this.healAmount) {
      character.healHitPoints(this.healAmount);
    }

    if (this.manaAmount) {
      character.healManaPoints(this.manaAmount);
    }
  }
});