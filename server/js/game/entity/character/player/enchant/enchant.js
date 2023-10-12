import Items from '../../../../../util/items.js';
import Messages from '../../../../../network/messages.js';
import Packets from '../../../../../network/packets.js';
import Utils from '../../../../../util/utils.js';

/**
 * Tier 1 - Damage/Armour boost (1-5%)
 * Tier 2 - Damage boost (1-10% & 10% for special ability or special ability level up)
 * Tier 3 - Damage boost (1-15% & 15% for special ability or special ability level up)
 * Tier 4 - Damage boost (1-20% & 20% for special ability or special ability level up)
 * Tier 5 - Damage boost (1-40% & 25% for special ability or special ability level up)
 */
export default class Enchant {
  constructor(player) {
    this.player = player;
    this.selectedItem = null;
    this.selectedShards = null;
  }

  convert(shard) {
    if (!Items.isShard(shard.id) || !this.player.inventory.hasSpace()) {
      return;
    }

    const tier = Items.getShardTier(shard.id);

    if (shard.count < 11 && tier > 5) {
      return;
    }

    for (let i = 0; i < shard.count; i += 10) {
      this.player.inventory.remove(shard.id, 10, shard.index);

      this.player.inventory.add({
        id: shard.id + 1,
        count: 1,
        ability: -1,
        abilityLevel: -1,
      });
    }
  }

  enchant() {
    if (!this.selectedItem) {
      this.player.notify('You have not selected an item to enchant.');
      return;
    }

    if (!this.selectedShards) {
      this.player.notify('You have to select shards to infuse.');
      return;
    }

    if (!this.verify()) {
      this.player.notify('This item cannot be enchanted.');
      return;
    }

    if (this.selectedShards.count < 10) {
      this.player.notify('You must have a minimum of 10 shards to enchant.');
      return;
    }

    /**
     * Implement probabilities here based on the number of shards
     * and reason them out.
     */

    const {
      tier,
    } = this.selectedItem;

    this.selectedItem.count = Utils.randomInt(1, tier === 5 ? 40 : 5 * tier);

    if (tier < 2) return;

    if (this.hasAbility(this.selectedItem)) {
      if (this.selectedItem.abilityLevel < 5) this.selectedItem.abilityLevel += 1;
      else this.generateAbility();
    }

    this.player.inventory.remove(
      this.selectedShards.id,
      10,
      this.selectedShards.index,
    );
    this.player.sync();
  }

  generateAbility() {
    const
      type = Items.getType(this.selectedItem.id);


    const probability = Utils.randomInt(0, 100);

    if (probability > 5 + 5 * this.selectedShards.tier) return;

    switch (type) {
      default:
        break;
      case 'armor':
      case 'armorarcher':
        this.selectedItem.ability = Utils.randomInt(2, 3);
        break;

      case 'weapon':
        this.selectedItem.ability = Utils.randomInt(0, 1);
        break;

      case 'weaponarcher':
        this.selectedItem.ability = Utils.randomInt(4, 5);
        break;

      case 'pendant':
        break;

      case 'ring':
        break;

      case 'boots':
        break;
    }
  }

  verify() {
    return (
      Items.isEnchantable(this.selectedItem.id)
      && Items.isShard(this.selectedShards.id)
    );
  }

  add(type, item) {
    const isItem = item === 'item';

    if (isItem && !Items.isEnchantable(item.id)) {
      return;
    }

    if (type === 'item') {
      if (this.selectedItem) {
        this.remove('item');
      }

      this.selectedItem = item;
    } else if (type === 'shards') {
      if (this.selectedShards) {
        this.remove('shards');
      }

      this.selectedShards = item;
    }

    this.player.send(
      new Messages.Enchant(Packets.EnchantOpcode.Select, {
        type,
        index: item.index,
      }),
    );
  }

  remove(type) {
    let index;

    if (type === 'item' && this.selectedItem) {
      index = this.selectedItem.index;

      this.selectedItem = null;
    } else if (type === 'shards' && this.selectedShards) {
      index = this.selectedShards.index;

      this.selectedShards = null;
    }

    this.player.send(
      new Messages.Enchant(Packets.EnchantOpcode.Remove, {
        type,
        index,
      }),
    );
  }

  hasAbility(item) {
    return item.ability !== -1;
  }
}
