import $ from 'jquery';
import _ from 'underscore';
import GamePage from './gamePage';
import Packets from '../../network/packets';

/**
 * Manages the player state profile page displaying equipment and stats
 * @class
 */
export default class State extends GamePage {
  /**
   * Default constructor
   * @param {Game} game an instance of the game
   */
  constructor(game) {
    super('#statePage');

    /**
     * The game instance
     * @type {Game}
     */
    this.game = game;
    /**
     * The local player entity
     * @type {Player}
     */
    this.player = game.player;

    /**
     * The player name display element
     * @type {jQuery}
     */
    this.name = $('#profileName');
    /**
     * The player level display element
     * @type {jQuery}
     */
    this.level = $('#profileLevel');
    /**
     * The player experience display element
     * @type {jQuery}
     */
    this.experience = $('#profileExperience');

    /**
     * The weapon equipment slot element
     * @type {jQuery}
     */
    this.weaponSlot = $('#weaponSlot');
    /**
     * The armour equipment slot element
     * @type {jQuery}
     */
    this.armourSlot = $('#armourSlot');
    /**
     * The pendant equipment slot element
     * @type {jQuery}
     */
    this.pendantSlot = $('#pendantSlot');
    /**
     * The ring equipment slot element
     * @type {jQuery}
     */
    this.ringSlot = $('#ringSlot');
    /**
     * The boots equipment slot element
     * @type {jQuery}
     */
    this.bootsSlot = $('#bootsSlot');

    /**
     * The array of all equipment slot elements
     * @type {Array}
     */
    this.slots = [
      this.weaponSlot,
      this.armourSlot,
      this.pendantSlot,
      this.ringSlot,
      this.bootsSlot,
    ];

    /**
     * Whether this page has been fully loaded with data
     * @type {Boolean}
     */
    this.loaded = false;

    this.loadState();
  }

  /**
   * Recalculates equipment slot images when the window is resized
   */
  resize() {
    this.loadStateSlots();
  }

  /**
   * Loads player name, level, experience, and equipment slot images, then binds unequip handlers
   */
  loadState() {
    if (!this.game.player.armour) {
      return;
    }

    this.name.text(this.player.username);
    this.level.text(this.player.level);
    this.experience.text(this.player.experience);

    this.loadStateSlots();

    this.loaded = true;

    this.weaponSlot.click(() => {
      this.game.socket.send(Packets.Equipment, [
        Packets.EquipmentOpcode.Unequip,
        'weapon',
      ]);
    });

    this.armourSlot.click(() => {
      this.game.socket.send(Packets.Equipment, [
        Packets.EquipmentOpcode.Unequip,
        'armour',
      ]);
    });

    this.pendantSlot.click(() => {
      this.game.socket.send(Packets.Equipment, [
        Packets.EquipmentOpcode.Unequip,
        'pendant',
      ]);
    });

    this.ringSlot.click(() => {
      this.game.socket.send(Packets.Equipment, [
        Packets.EquipmentOpcode.Unequip,
        'ring',
      ]);
    });

    this.bootsSlot.click(() => {
      this.game.socket.send(Packets.Equipment, [
        Packets.EquipmentOpcode.Unequip,
        'boots',
      ]);
    });
  }

  /**
   * Applies the current equipment images to all slot elements
   */
  loadStateSlots() {
    this.weaponSlot.css(
      'background-image',
      this.getImageFormat(this.getScale(), this.player.weapon.name),
    );
    this.armourSlot.css(
      'background-image',
      this.getImageFormat(this.getScale(), this.player.armour.name),
    );
    this.pendantSlot.css(
      'background-image',
      this.getImageFormat(this.getScale(), this.player.pendant.name),
    );
    this.ringSlot.css(
      'background-image',
      this.getImageFormat(this.getScale(), this.player.ring.name),
    );
    this.bootsSlot.css(
      'background-image',
      this.getImageFormat(this.getScale(), this.player.boots.name),
    );

    if (this.game.getScaleFactor() === 1) {
      this.forEachSlot((slot) => {
        slot.css('background-size', '600%');
      });
    }
  }

  /**
   * Refreshes the level, experience, and equipment slot displays with current player data
   */
  update() {
    this.level.text(this.player.level);
    this.experience.text(this.player.experience);
    this.loadStateSlots();
  }

  /**
   * Invokes the given callback for each equipment slot
   * @param {Function} callback a function called with each slot jQuery element
   */
  forEachSlot(callback) {
    _.each(this.slots, (slot) => {
      callback(slot);
    });
  }

  /**
   * Returns the drawing scale from the game renderer
   * @return {Number}
   */
  getScale() {
    return this.game.renderer.getDrawingScale();
  }
}
