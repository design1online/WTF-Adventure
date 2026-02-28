import $ from 'jquery';
import Container from './container/container';
import Packets from '../network/packets';

/**
 * Manages the player inventory interface for viewing and using items
 * @class
 */
export default class Inventory {
  /**
   * Default constructor
   * @param {Game} game an instance of the game
   * @param {Number} size the number of inventory slots
   */
  constructor(game, size) {
    /**
     * The game instance
     * @type {Game}
     */
    this.game = game;
    /**
     * The actions interface instance
     * @type {Actions}
     */
    this.actions = game.interface.actions;
    /**
     * The inventory dialog body element
     * @type {jQuery}
     */
    this.body = $('#inventory');
    /**
     * The HUD inventory toggle button element
     * @type {jQuery}
     */
    this.button = $('#hud-inventory');
    /**
     * The action container element
     * @type {jQuery}
     */
    this.action = $('#actionContainer');
    /**
     * The container holding inventory slot data
     * @type {Container}
     */
    this.container = new Container(size);
    /**
     * The CSS class name identifying this interface as the active context
     * @type {String}
     */
    this.activeClass = 'inventory';
    /**
     * The currently selected inventory slot element
     * @type {jQuery}
     */
    this.selectedSlot = null;
    /**
     * The currently selected inventory slot data
     * @type {Slot}
     */
    this.selectedItem = null;
  }

  /**
   * Populates the inventory slot list from server data and binds the toggle button
   * @param {Array} data array of item data objects for each inventory slot
   */
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

  /**
   * Handles a single click on an inventory slot, showing available actions
   * @param {Event} event the click event from the slot element
   */
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

  /**
   * Handles a double click on an inventory slot, immediately using the item
   * @param {Event} event the double-click event from the slot element
   */
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

  /**
   * Handles an action button click, sending the appropriate packet to the server
   * @param {Event|String} event the action button click event or action name string
   */
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

  /**
   * Adds or updates an item in the inventory display at the given index
   * @param {Object} info item info object containing index, name, count, ability, abilityLevel, edible, and equippable
   */
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

  /**
   * Removes or decrements an item from the inventory display at the given index
   * @param {Object} info item info object containing index and count
   */
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

  /**
   * Recalculates and reapplies slot image styles when the window is resized
   */
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

  /**
   * Deselects the currently selected inventory slot
   */
  clearSelection() {
    if (!this.selectedSlot) return;

    this.selectedSlot.removeClass('select');
    this.selectedSlot = null;
    this.selectedItem = null;
  }

  /**
   * Shows the inventory dialog and marks the button as active
   */
  display() {
    this.body.fadeIn('fast');
    this.button.addClass('active');
  }

  /**
   * Hides the inventory dialog, removes the active state, and clears the selection
   */
  hide() {
    this.button.removeClass('active');

    this.body.fadeOut('slow');
    this.button.removeClass('active');
    this.clearSelection();
  }

  /**
   * Returns the drawing scale from the game renderer
   * @return {Number}
   */
  getScale() {
    return this.game.renderer.getDrawingScale();
  }

  /**
   * Returns the number of slots in the inventory container
   * @return {Number}
   */
  getSize() {
    return this.container.size;
  }

  /**
   * Returns all inventory slot list items from the DOM
   * @return {jQuery}
   */
  getList() {
    return $('#inventory')
      .find('ul')
      .find('li');
  }

  /**
   * Returns whether the inventory dialog is currently visible
   * @return {Boolean}
   */
  isVisible() {
    return this.body.css('display') === 'block';
  }
}
