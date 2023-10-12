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
export default class Inventory extends Container {
  constructor(owner, size) {
    super('Inventory', owner, size);
  }

  loadInventory(ids, counts, abilities, abilityLevels) {
    super.loadContainer(ids, counts, abilities, abilityLevels);

    this.owner.send(
      new Messages.Inventory(Packets.InventoryOpcode.Batch, [
        this.size,
        this.slots,
      ]),
    );
  }

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
