import Item from '../../js/game/entity/objects/item.js';
import Utils from '../../js/util/utils';
import Items from '../../js/util/items';

export default class Flask extends Item {
  constructor(id, instance, x, y) {
    super(id, instance, x, y);
    this.healAmount = 0;
    this.manaAmount = 0;

    const customData = new Items().getCustomData(id);
    if (customData) {
      this.healAmount = customData.healAmount ? customData.healAmount : 0;
      this.manaAmount = customData.manaAmount ? customData.manaAmount : 0;
    }
  }

  onUse(character) {
    if (this.healAmount) {
      character.healHitPoints(this.healAmount);
    }

    if (this.manaAmount) {
      character.healManaPoints(this.manaAmount);
    }
  }
}
