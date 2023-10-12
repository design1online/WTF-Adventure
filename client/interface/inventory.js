import $ from 'jquery';
import Container from './container/container';
import Packets from '../network/packets';

export default class Inventory {
  constructor(game, size) {
    this.game = game;
    this.actions = game.interface.actions;
    this.body = $('#inventory');
    this.button = $('#hud-inventory');
    this.action = $('#actionContainer');
    this.container = new Container(size);
    this.activeClass = 'inventory';
    this.selectedSlot = null;
    this.selectedItem = null;
  }

  loadInventory(data) {
    const list = $('#inventory').find('ul');

    for (let i = 0; i < data.length; i += 1) {
      const item = data[i];

      this.container.setSlot(i, item);

      const itemSlot = $(`<div id="slot${i}" class="itemSlot"></div>`);

      if (item.name !== 'null') {
        itemSlot.css(
          'background-image',
          this.container.getImageFormat(this.getScale(), item.name),
        );
      }

      if (this.game.client.isMobile()) itemSlot.css('background-size', '600%');

      itemSlot.dblclick((event) => {
        this.clickDouble(event);
      });

      itemSlot.click((event) => {
        this.click(event);
      });

      const itemSlotList = $('<li></li>');

      itemSlotList.append(itemSlot);
      itemSlotList.append(
        `<div id="itemCount${i}" class="itemCount">${item.count > 1 ? item.count : ''}</div>`,
      );

      list.append(itemSlotList);
    }

    this.button.click(() => {
      this.game.interface.hideAll();

      if (this.isVisible()) this.hide();
      else this.display();
    });
  }

  click(event) {
    const index = event.currentTarget.id.substring(4);
    const slot = this.container.slots[index];
    const item = $(this.getList()[index]);

    this.clearSelection();

    if (slot.name === null || slot.count === -1) {
      return;
    }

    this.actions.reset();
    this.actions.loadDefaults('inventory');

    if (slot.edible) this.actions.add($('<div id="eat" class="actionButton">Eat</div>'));
    else if (slot.equippable) this.actions.add($('<div id="wield" class="actionButton">Wield</div>'));

    if (!this.actions.isVisible()) {
      this.actions.show();
    }

    const sSlot = item.find(`#slot${index}`);

    sSlot.addClass('select');

    this.selectedSlot = sSlot;
    this.selectedItem = slot;

    this.actions.hideDrop();
  }

  clickDouble(event) {
    const index = event.currentTarget.id.substring(4);
    const slot = this.container.slots[index];

    if (!slot.edible && !slot.equippable) {
      return;
    }

    const item = $(this.getList()[index]);
    const sSlot = item.find(`#slot${index}`);

    this.clearSelection();

    this.selectedSlot = sSlot;
    this.selectedItem = slot;

    this.clickAction(slot.edible ? 'eat' : 'wield');

    this.actions.hideDrop();
  }

  clickAction(event) {
    const action = event.currentTarget ? event.currentTarget.id : event;

    if (!this.selectedSlot || !this.selectedItem) {
      return;
    }

    switch (action) {
      default:
        break;
      case 'eat':
      case 'wield':
        this.game.socket.send(Packets.Inventory, [
          Packets.InventoryOpcode.Select,
          this.selectedItem.index,
        ]);
        this.clearSelection();

        break;

      case 'drop':
        const item = this.selectedItem; // eslint-disable-line

        if (item.count > 1) this.actions.displayDrop('inventory');
        else {
          this.game.socket.send(Packets.Inventory, [
            Packets.InventoryOpcode.Remove,
            item,
          ]);
          this.clearSelection();
        }

        break;

      case 'dropAccept':
        const count = parseInt($('#dropCount').val(), 10); // eslint-disable-line

        if (!count || count < 1) {
          return;
        }

        this.game.socket.send(Packets.Inventory, [
          Packets.InventoryOpcode.Remove,
          this.selectedItem,
          count,
        ]);
        this.actions.hideDrop();
        this.clearSelection();

        break;

      case 'dropCancel':
        this.actions.hideDrop();
        this.clearSelection();

        break;
    }

    this.actions.hide();
  }

  add(info) {
    const item = $(this.getList()[info.index]);
    const slot = this.container.slots[info.index];

    if (!item || !slot) {
      return;
    }

    if (slot.isEmpty()) {
      slot.loadSlot(
        info.name,
        info.count,
        info.ability,
        info.abilityLevel,
        info.edible,
        info.equippable,
      );
    }

    slot.setCount(info.count);

    const cssSlot = item.find(`#slot${info.index}`);

    cssSlot.css(
      'background-image',
      this.container.getImageFormat(this.getScale(), slot.name),
    );

    if (this.game.client.isMobile()) cssSlot.css('background-size', '600%');

    item
      .find(`#itemCount${info.index}`)
      .text(slot.count > 1 ? slot.count : '');
  }

  remove(info) {
    const item = $(this.getList()[info.index]);
    const slot = this.container.slots[info.index];

    if (!item || !slot) {
      return;
    }

    slot.count -= info.count;

    item.find(`#itemCount${info.index}`).text(slot.count);

    if (slot.count < 1) {
      item.find(`#slot${info.index}`).css('background-image', '');
      item.find(`#itemCount${info.index}`).text('');
      slot.empty();
    }
  }

  resize() {
    const list = this.getList();

    for (let i = 0; i < list.length; i += 1) {
      const item = $(list[i]).find(`#slot${i}`);
      const slot = this.container.slots[i];

      if (slot) {
        if (this.game.client.isMobile()) {
          item.css('background-size', '600%');
        } else {
          item.css(
            'background-image',
            this.container.getImageFormat(this.getScale(), slot.name),
          );
        }
      }
    }
  }

  clearSelection() {
    if (!this.selectedSlot) return;

    this.selectedSlot.removeClass('select');
    this.selectedSlot = null;
    this.selectedItem = null;
  }

  display() {
    this.body.fadeIn('fast');
    this.button.addClass('active');
  }

  hide() {
    this.button.removeClass('active');

    this.body.fadeOut('slow');
    this.button.removeClass('active');
    this.clearSelection();
  }

  getScale() {
    return this.game.renderer.getDrawingScale();
  }

  getSize() {
    return this.container.size;
  }

  getList() {
    return $('#inventory')
      .find('ul')
      .find('li');
  }

  isVisible() {
    return this.body.css('display') === 'block';
  }
}
