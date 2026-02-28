import $ from 'jquery';
import Packets from '../network/packets';

/**
 * Manages the enchanting interface for applying abilities to items
 * @class
 */
export default class Enchant {
  /**
   * Default constructor
   * @param {Game} game an instance of the game
   * @param {Interface} intrface an instance of the game interface
   */
  constructor(game, intrface) {
    /**
     * The game instance
     * @type {Game}
     */
    this.game = game;
    /**
     * The game interface instance
     * @type {Interface}
     */
    this.interface = intrface;
    /**
     * The enchant dialog body element
     * @type {jQuery}
     */
    this.body = $('#enchant');
    /**
     * The enchant container element
     * @type {jQuery}
     */
    this.container = $('#enchantContainer');
    /**
     * The enchant inventory slots element
     * @type {jQuery}
     */
    this.enchantSlots = $('#enchantInventorySlots');
    /**
     * The selected item slot display element
     * @type {jQuery}
     */
    this.selectedItem = $('#enchantSelectedItem');
    /**
     * The selected shards slot display element
     * @type {jQuery}
     */
    this.selectedShards = $('#enchantShards');
    /**
     * The confirm enchant button element
     * @type {jQuery}
     */
    this.confirm = $('#confirmEnchant');
    /**
     * The shards count display element
     * @type {jQuery}
     */
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

  /**
   * Moves an item from the inventory slot into the selected item or shards display
   * @param {String} type the slot type, either 'item' or 'shards'
   * @param {Number} index the inventory slot index
   */
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

  /**
   * Moves an item back from the selected display into its original inventory slot
   * @param {String} type the slot type, either 'item' or 'shards'
   * @param {Number} index the inventory slot index to restore
   */
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

  /**
   * Loads the inventory slot list into the enchant interface from the bank inventory
   */
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

  /**
   * Sends an enchant action packet to the server
   */
  enchant() {
    this.game.socket.send(Packets.Enchant, [Packets.EnchantOpcode.Enchant]);
  }

  /**
   * Sends a slot selection packet to the server
   * @param {Event} event the click event from the inventory slot element
   */
  select(event) {
    this.game.socket.send(Packets.Enchant, [
      Packets.EnchantOpcode.Select,
      event.currentTarget.id.substring(17),
    ]);
  }

  /**
   * Sends a remove packet to the server for the given slot type
   * @param {String} type the slot type to remove, either 'item' or 'shards'
   */
  remove(type) {
    this.game.socket.send(Packets.Enchant, [
      Packets.EnchantOpcode.Remove,
      type,
    ]);
  }

  /**
   * Returns the number of slots in the player's inventory
   * @return {Number}
   */
  getInventorySize() {
    return this.interface.inventory.getSize();
  }

  /**
   * Returns the slot data for the given inventory index
   * @param {Number} index the inventory slot index
   * @return {Slot}
   */
  getItemSlot(index) {
    return this.interface.inventory.container.slots[index];
  }

  /**
   * Shows the enchant dialog and loads the current inventory into it
   */
  display() {
    this.body.fadeIn('fast');
    this.loadEnchant();
  }

  /**
   * Hides the enchant dialog and clears the selected item and shards
   */
  hide() {
    this.selectedItem.css('background-image', '');
    this.selectedShards.css('background-image', '');
    this.body.fadeOut('fast');
  }

  /**
   * Returns whether the given image element has a background image set
   * @param {jQuery} image the image element to check
   * @return {Boolean}
   */
  hasImage(image) {
    return image.css('background-image') !== 'none';
  }

  /**
   * Returns the slot list item element at the given index
   * @param {Number} index the slot index
   * @return {jQuery}
   */
  getSlot(index) {
    return $(this.getSlots().find('li')[index]);
  }

  /**
   * Returns the unordered list element containing all enchant slots
   * @return {jQuery}
   */
  getSlots() {
    return this.enchantSlots.find('ul');
  }

  /**
   * Returns whether the enchant dialog is currently visible
   * @return {Boolean}
   */
  isVisible() {
    return this.body.css('display') === 'block';
  }
}
