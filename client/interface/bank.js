import $ from 'jquery';
import Container from './container/container';
import Packets from '../network/packets';

/**
 * Manages the bank interface for storing and retrieving items
 * @class
 */
export default class Bank {
  /**
   * Default constructor
   * @param {Game} game an instance of the game
   * @param {Container} inventoryContainer the player's inventory container
   * @param {Number} size the number of slots in the bank
   */
  constructor(game, inventoryContainer, size) {
    /**
     * The game instance
     * @type {Game}
     */
    this.game = game;
    /**
     * The player's inventory container
     * @type {Container}
     */
    this.inventoryContainer = inventoryContainer;
    /**
     * The local player entity
     * @type {Player}
     */
    this.player = game.player;
    /**
     * The bank dialog body element
     * @type {jQuery}
     */
    this.body = $('#bank');
    /**
     * The bank slots container element
     * @type {jQuery}
     */
    this.bankSlots = $('#bankSlots');
    /**
     * The bank inventory slots container element
     * @type {jQuery}
     */
    this.bankInventorySlots = $('#bankInventorySlots');
    /**
     * The container holding bank slot data
     * @type {Container}
     */
    this.container = new Container(size);
    /**
     * The close button element
     * @type {jQuery}
     */
    this.close = $('#closeBank');
    this.close.css('left', '97%');
    this.close.click(() => {
      this.hide();
    });
  }

  /**
   * Populates the bank and inventory slot lists from server data
   * @param {Array} data array of item data objects for each bank slot
   */
  loadBank(data) {
    const bankList = this.bankSlots.find('ul');
    const inventoryList = this.bankInventorySlots.find('ul');

    for (let i = 0; i < data.length; i += 1) {
      const item = data[i];
      const slot = $(`<div id="bankSlot${i}" class="bankSlot"></div>`);

      this.container.setSlot(i, item);

      slot.css({
        'margin-right': `${2 * this.getScale()}px`,
        'margin-bottom': `${4 * this.getScale()}px`,
      });

      const image = $(`<div id="bankImage${i}" class="bankImage"></div>`);

      if (item.name) {
        image.css(
          'background-image',
          this.container.getImageFormat(this.getDrawingScale(), item.name),
        );
      }

      slot.click((event) => {
        this.click('bank', event);
      });

      if (this.game.client.isMobile()) {
        image.css('background-size', '600%');
      }

      slot.append(image);
      slot.append(
        `<div id="bankItemCount${i}" class="itemCount">${item.count > 1 ? item.count : ''}</div>`,
      );

      slot.find(`#bankItemCount${i}`).css({
        'font-size': `${4 * this.getScale()}px`,
        'margin-top': '0',
        'margin-left': '0',
      });

      const bankListItem = $('<li></li>');

      bankListItem.append(slot);
      bankList.append(bankListItem);
    }

    for (let j = 0; j < this.inventoryContainer.size; j += 1) {
      const iItem = this.inventoryContainer.slots[j];
      const iSlot = $(
        `<div id="bankInventorySlot${j}" class="bankSlot"></div>`,
      );

      iSlot.css({
        'margin-right': `${3 * this.getScale()}px`,
        'margin-bottom': `${6 * this.getScale()}px`,
      });

      const slotImage = $(
        `<div id="inventoryImage${j}" class="bankImage"></div>`,
      );

      if (iItem.name) {
        slotImage.css(
          'background-image',
          this.container.getImageFormat(this.getDrawingScale(), iItem.name),
        );
      }

      iSlot.click(function (event) {
        this.click('inventory', event);
      });

      if (this.game.client.isMobile()) {
        slotImage.css('background-size', '600%');
      }

      iSlot.append(slotImage);
      iSlot.append(
        `<div id="inventoryItemCount${j}" class="itemCount">${iItem.count > 1 ? iItem.count : ''}</div>`,
      );

      iSlot.find(`#inventoryItemCount${j}`).css({
        'margin-top': '0',
        'margin-left': '0',
      });

      const inventoryListItem = $('<li></li>');
      inventoryListItem.append(iSlot);
      inventoryList.append(inventoryListItem);
    }
  }

  /**
   * Recalculates and reapplies slot styles when the window is resized
   */
  resize() {
    const bankList = this.getBankList();
    const inventoryList = this.getInventoryList();

    for (let i = 0; i < bankList.length; i += 1) {
      const bankSlot = $(bankList[i]).find(`#bankSlot${i}`);
      const image = bankSlot.find(`#bankImage${i}`);
      const slot = this.container.slots[i];

      bankSlot.css({
        'margin-right': `${2 * this.getScale()}px`,
        'margin-bottom': `${4 * this.getScale()}px`,
      });

      bankSlot.find(`#bankItemCount${i}`).css({
        'font-size': `${4 * this.getScale()}px`,
        'margin-top': '0',
        'margin-left': '0',
      });

      if (this.game.client.isMobile()) {
        image.css('background-size', '600%');
      } else {
        image.css(
          'background-image',
          this.container.getImageFormat(this.getDrawingScale(), slot.name),
        );
      }
    }

    for (let j = 0; j < inventoryList.length; j += 1) {
      const inventorySlot = $(inventoryList[j]).find(`#bankInventorySlot${j}`);
      const iImage = inventorySlot.find(`#inventoryImage${j}`);
      const iSlot = this.inventoryContainer.slots[j];

      inventorySlot.css({
        'margin-right': `${3 * this.getScale()}px`,
        'margin-bottom': `${6 * this.getScale()}px`,
      });

      if (this.game.client.isMobile()) {
        iImage.css('background-size', '600%');
      } else {
        iImage.css(
          'background-image',
          this.container.getImageFormat(this.getDrawingScale(), iSlot.name),
        );
      }
    }
  }

  /**
   * Sends a bank slot selection packet when a slot is clicked
   * @param {String} type the slot type, either 'bank' or 'inventory'
   * @param {Event} event the click event from the slot element
   */
  click(type, event) {
    const isBank = type === 'bank';
    const index = event.currentTarget.id.substring(isBank ? 8 : 17);

    this.game.socket.send(Packets.Bank, [
      Packets.BankOpcode.Select,
      type,
      index,
    ]);
  }

  /**
   * Adds or updates an item in the bank display at the given index
   * @param {Object} info item info object containing index, name, count, ability, and abilityLevel
   */
  add(info) {
    const item = $(this.getBankList()[info.index]);
    const slot = this.container.slots[info.index];

    if (!item || !slot) {
      return;
    }

    if (slot.isEmpty()) {
      slot.loadSlot(info.name, info.count, info.ability, info.abilityLevel);
    }

    slot.setCount(info.count);

    const bankSlot = item.find(`#bankSlot${info.index}`);
    const cssSlot = bankSlot.find(`#bankImage${info.index}`);
    const count = bankSlot.find(`#bankItemCount${info.index}`);

    cssSlot.css(
      'background-image',
      this.container.getImageFormat(this.getDrawingScale(), info.name),
    );

    if (this.game.client.isMobile()) {
      cssSlot.css('background-size', '600%');
    }

    if (slot.count > 1) {
      count.text(slot.count);
    }
  }

  /**
   * Removes or decrements an item from the bank display at the given index
   * @param {Object} info item info object containing index and count
   */
  remove(info) {
    const item = $(this.getBankList()[info.index]);
    const slot = this.container.slots[info.index];

    if (!item || !slot) {
      return;
    }

    slot.count -= info.count;

    if (slot.count < 1) {
      const divItem = item.find(`#bankSlot${info.index}`);

      divItem.find(`#bankImage${info.index}`).css('background-image', '');
      divItem.find(`#bankItemCount${info.index}`).text('');

      slot.empty();
    }
  }

  /**
   * Adds or updates an item in the inventory panel within the bank interface
   * @param {Object} info item info object containing index, name, and count
   */
  addInventory(info) {
    const item = $(this.getInventoryList()[info.index]);

    if (!item) {
      return;
    }

    const slot = item.find(`#bankInventorySlot${info.index}`);
    const image = slot.find(`#inventoryImage${info.index}`);

    image.css(
      'background-image',
      this.container.getImageFormat(this.getDrawingScale(), info.name),
    );

    if (this.game.client.isMobile()) {
      image.css('background-size', '600%');
    }

    if (info.count > 1) {
      slot.find(`#inventoryItemCount${info.index}`).text(info.count);
    }
  }

  /**
   * Removes an item from the inventory panel within the bank interface
   * @param {Object} info item info object containing index
   */
  removeInventory(info) {
    const item = $(this.getInventoryList()[info.index]);

    if (!item) {
      return;
    }

    const slot = item.find(`#bankInventorySlot${info.index}`);

    slot.find(`#inventoryImage${info.index}`).css('background-image', '');
    slot.find(`#inventoryItemCount${info.index}`).text('');
  }

  /**
   * Shows the bank dialog with a slow fade-in
   */
  display() {
    this.body.fadeIn('slow');
  }

  /**
   * Hides the bank dialog with a fast fade-out
   */
  hide() {
    this.body.fadeOut('fast');
  }

  /**
   * Returns whether the bank dialog is currently visible
   * @return {Boolean}
   */
  isVisible() {
    return this.body.css('display') === 'block';
  }

  /**
   * Returns the drawing scale from the game renderer
   * @return {Number}
   */
  getDrawingScale() {
    return this.game.renderer.getDrawingScale();
  }

  /**
   * Returns the current scale factor from the game
   * @return {Number}
   */
  getScale() {
    return this.game.getScaleFactor();
  }

  /**
   * Returns all bank slot list items
   * @return {jQuery}
   */
  getBankList() {
    return this.bankSlots.find('ul').find('li');
  }

  /**
   * Returns all inventory slot list items within the bank interface
   * @return {jQuery}
   */
  getInventoryList() {
    return this.bankInventorySlots.find('ul').find('li');
  }
}
