import Container from '../container.js';
import Messages from '../../../../../../network/messages.js';
import Packets from '../../../../../../network/packets.js';

export default class Bank extends Container {
  constructor(owner, size) {
    super('Bank', owner, size);
    this.open = false;
  }

  loadBank(ids, counts, abilities, abilityLevels) {
    super.loadContainer(ids, counts, abilities, abilityLevels);

    this.owner.send(
      new Messages.Bank(Packets.BankOpcode.Batch, [this.size, this.slots]),
    );
  }

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
