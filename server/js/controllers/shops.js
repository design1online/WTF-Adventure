import ShopUtils from '../util/shops';
import Messages from '../network/messages';
import Packets from '../network/packets';

export default class Shops {
  constructor(world) {
    this.world = world;
  }

  open(player, shopId) {
    player.send(
      new Messages.Shop(Packets.Shop, {
        instance: player.instance,
        npcId: shopId,
        shopData: this.getShopData(shopId),
      }),
    );
  }

  buy() {
    // const cost = ShopUtils.getCost(shopId, itemId, count);
    this.refresh();
  }

  refresh() {
    // refresh shop
  }

  getShopData(id) {
    if (!ShopUtils.isShopNPC(id)) {
      return {
        items: [],
        counts: [],
      };
    }

    return {
      items: ShopUtils.getItems(id),
      counts: ShopUtils.getCount(id),
    };
  }
}
