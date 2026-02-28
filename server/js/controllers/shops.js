import ShopUtils from '../util/shops';
import Messages from '../network/messages';
import Packets from '../network/packets';

/**
 * Controller that handles shop interactions for players
 * @class
 */
export default class Shops {
  /**
   * Default constructor
   * @param {World} world the world instance
   */
  constructor(world) {
    /**
     * The world instance
     * @type {World}
     */
    this.world = world;
  }

  /**
   * Sends shop data to a player when they open a shop NPC
   * @param {Player} player the player opening the shop
   * @param {Number} shopId the identifier of the shop NPC
   */
  open(player, shopId) {
    player.send(
      new Messages.Shop(Packets.Shop, {
        instance: player.instance,
        npcId: shopId,
        shopData: this.getShopData(shopId),
      }),
    );
  }

  /**
   * Handles a buy action and refreshes the shop
   */
  buy() {
    // const cost = ShopUtils.getCost(shopId, itemId, count);
    this.refresh();
  }

  /**
   * Refreshes the shop state
   */
  refresh() {
    // refresh shop
  }

  /**
   * Returns the items and counts for a given shop NPC
   * @param {Number} id the shop NPC identifier
   * @return {Object}
   */
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
