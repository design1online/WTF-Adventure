import $ from 'jquery';
import Packets from '../network/packets';

export default class Enchant {
  constructor(game, intrface) {
    this.game = game;
    this.interface = intrface;
    this.body = $('#enchant');
    this.container = $('#enchantContainer');
    this.enchantSlots = $('#enchantInventorySlots');
    this.selectedItem = $('#enchantSelectedItem');
    this.selectedShards = $('#enchantShards');
    this.confirm = $('#confirmEnchant');
    this.shardsCount = $('#shardsCount');

    this.confirm.css({
      left: '70%',
      top: '80%',
    });

    $('#closeEnchant').click(() => {
      this.hide();
    });

    this.confirm.click(() => {
      this.enchant();
    });
  }

  add(type, index) {
    const self = this;


    const image = this.getSlot(index).find(`#inventoryImage${index}`);

    switch (type) {
      default:
        break;
      case 'item':
        this.selectedItem.css(
          'background-image',
          image.css('background-image'),
        );

        break;

      case 'shards':
        this.selectedShards.css(
          'background-image',
          image.css('background-image'),
        );

        const { // eslint-disable-line
          count,
        } = this.getItemSlot(index);

        if (count > 1) {
          this.shardsCount.text(count);
        }

        break;
    }

    image.css('background-image', '');

    self
      .getSlot(index)
      .find(`#inventoryItemCount${index}`)
      .text('');
  }

  moveBack(type, index) {
    const image = this.getSlot(index).find(`#inventoryImage${index}`);
    const itemCount = this.getSlot(index).find(`#inventoryItemCount${index}`);
    const {
      count,
    } = this.getItemSlot(index);

    switch (type) {
      default:
        break;
      case 'item':
        image.css(
          'background-image',
          this.selectedItem.css('background-image'),
        );

        if (count > 1) itemCount.text(count);

        this.selectedItem.css('background-image', '');

        break;

      case 'shards':
        image.css(
          'background-image',
          this.selectedShards.css('background-image'),
        );

        if (count > 1) itemCount.text(count);

        this.selectedShards.css('background-image', '');

        this.shardsCount.text('');

        break;
    }
  }

  loadEnchant() {
    const list = this.getSlots();
    const inventoryList = this.interface.bank.getInventoryList();

    list.empty();

    for (let i = 0; i < this.getInventorySize(); i += 1) {
      const item = $(inventoryList[i]).clone();
      const slot = item.find(`#bankInventorySlot${i}`);

      slot.click((event) => {
        this.select(event);
      });

      list.append(item);
    }

    this.selectedItem.click(() => {
      this.remove('item');
    });

    this.selectedShards.click(() => {
      this.remove('shards');
    });
  }

  enchant() {
    this.game.socket.send(Packets.Enchant, [Packets.EnchantOpcode.Enchant]);
  }

  select(event) {
    this.game.socket.send(Packets.Enchant, [
      Packets.EnchantOpcode.Select,
      event.currentTarget.id.substring(17),
    ]);
  }

  remove(type) {
    this.game.socket.send(Packets.Enchant, [
      Packets.EnchantOpcode.Remove,
      type,
    ]);
  }

  getInventorySize() {
    return this.interface.inventory.getSize();
  }

  getItemSlot(index) {
    return this.interface.inventory.container.slots[index];
  }

  display() {
    this.body.fadeIn('fast');
    this.loadEnchant();
  }

  hide() {
    this.selectedItem.css('background-image', '');
    this.selectedShards.css('background-image', '');
    this.body.fadeOut('fast');
  }

  hasImage(image) {
    return image.css('background-image') !== 'none';
  }

  getSlot(index) {
    return $(this.getSlots().find('li')[index]);
  }

  getSlots() {
    return this.enchantSlots.find('ul');
  }

  isVisible() {
    return this.body.css('display') === 'block';
  }
}
