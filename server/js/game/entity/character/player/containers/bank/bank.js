import Container from '../container.js';
import Messages from '../../../../../../network/messages.js';
import Packets from '../../../../../../network/packets.js';

/**
 * Represents a player's bank container for storing items
 * @class
 */
export default class Bank extends Container {
  /**
   * Default constructor
   * @param {Player} owner the player who owns this bank
   * @param {Number} size the maximum number of slots in the bank
   */
  constructor(owner, size) {
    super('Bank', owner, size);
    /**
     * Whether the bank is currently open
     * @type {Boolean}
     */
    this.open = false;
  }

  /**
   * Loads the bank from stored data and sends a batch update to the client
   * @param {String} ids space-separated item IDs
   * @param {String} counts space-separated item counts
   * @param {String} abilities space-separated ability IDs
   * @param {String} abilityLevels space-separated ability levels
   */
  loadBank(ids, counts, abilities, abilityLevels) {
    super.loadContainer(ids, counts, abilities, abilityLevels);

    this.owner.send(
      new Messages.Bank(Packets.BankOpcode.Batch, [this.size, this.slots]),
    );
  }

  /**
   * Adds an item to the bank and notifies the client
   * @param {Number} id the item ID to add
   * @param {Number} count the number of items to add
   * @param {Number} ability the ability ID associated with the item
   * @param {Number} abilityLevel the level of the item's ability
   * @return {Boolean}
   */
  add(id, count, ability, abilityLevel) {
    if (!this.canHold(id, count)) {
      this.owner.send(
        new Messages.Notification(
          Packets.NotificationOpcode.Text,
          'You do not have enough space in your bank.',
        ),
      );
      return false;
    }

    const slot = super.add(id, parseInt(count, 10), ability, abilityLevel);

    this.owner.send(new Messages.Bank(Packets.BankOpcode.Add, slot));
    this.owner.save();

    return true;
  }

  /**
   * Removes an item from the bank and notifies the client
   * @param {Number} id the item ID to remove
   * @param {Number} count the number of items to remove
   * @param {Number} index the slot index to remove from
   */
  remove(id, count, index) {
    if (!super.remove(index, id, count)) {
      return;
    }

    this.owner.send(
      new Messages.Bank(Packets.BankOpcode.Remove, {
        index: parseInt(index, 10),
        count,
      }),
    );

    this.owner.save();
  }
}
