import Container from '../container.js';
import Messages from '../../../../../../network/messages.js';
import Packets from '../../../../../../network/packets.js';
import Constants from './constants.js';

/**
 * Not particularly sure whether or not this class will
 * require an update function to push any updates
 * of the inventory to the client. This is just a baseline
 * setup for the inventory until the interface is done.
 */
/**
 * Represents the player's inventory container
 * @class
 */
export default class Inventory extends Container {
  /**
   * Default constructor
   * @param {Player} owner the player who owns this inventory
   * @param {Number} size the maximum number of inventory slots
   */
  constructor(owner, size) {
    super('Inventory', owner, size);
  }

  /**
   * Loads the inventory from stored data and sends a batch update to the client
   * @param {String} ids space-separated item IDs
   * @param {String} counts space-separated item counts
   * @param {String} abilities space-separated ability IDs
   * @param {String} abilityLevels space-separated ability levels
   */
  loadInventory(ids, counts, abilities, abilityLevels) {
    super.loadContainer(ids, counts, abilities, abilityLevels);

    this.owner.send(
      new Messages.Inventory(Packets.InventoryOpcode.Batch, [
        this.size,
        this.slots,
      ]),
    );
  }

  /**
   * Adds an item to the inventory and notifies the client
   * @param {Object} item the item object to add
   * @param {Number} count the number of items to add
   * @return {Boolean}
   */
  add(item, count) {
    if (!count) {
      count = -1; // eslint-disable-line
    }

    // default to moving whole stack
    if (count === -1) {
      count = parseInt(item.count, 10); // eslint-disable-line
    }

    if (!this.canHold(item.id, count)) {
      this.owner.send(
        new Messages.Notification(
          Packets.NotificationOpcode.Text,
          Constants.InventoryFull,
        ),
      );
      return false;
    }

    const slot = super.add(item.id, count, item.ability, item.abilityLevel);

    if (!slot) {
      return false;
    }

    this.owner.send(new Messages.Inventory(Packets.InventoryOpcode.Add, slot));
    this.owner.save();

    if (item.instance) {
      this.owner.world.removeItem(item);
    }

    return true;
  }

  /**
   * Removes an item from the inventory and notifies the client
   * @param {Number} id the item ID to remove
   * @param {Number} count the number of items to remove
   * @param {Number} index the slot index to remove from
   */
  remove(id, count, index) {
    if (!index) {
      index = this.getIndex(id); // eslint-disable-line
    }

    if (!super.remove(index, id, count)) {
      return;
    }

    this.owner.send(
      new Messages.Inventory(Packets.InventoryOpcode.Remove, {
        index: parseInt(index, 10),
        count,
      }),
    );

    this.owner.save();
  }
}
