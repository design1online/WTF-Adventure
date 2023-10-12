import $ from 'jquery';
import _ from 'underscore';
import GamePage from './gamePage';
import Packets from '../../network/packets';

export default class State extends GamePage {
  constructor(game) {
    super('#statePage');

    this.game = game;
    this.player = game.player;

    this.name = $('#profileName');
    this.level = $('#profileLevel');
    this.experience = $('#profileExperience');

    this.weaponSlot = $('#weaponSlot');
    this.armourSlot = $('#armourSlot');
    this.pendantSlot = $('#pendantSlot');
    this.ringSlot = $('#ringSlot');
    this.bootsSlot = $('#bootsSlot');

    this.slots = [
      this.weaponSlot,
      this.armourSlot,
      this.pendantSlot,
      this.ringSlot,
      this.bootsSlot,
    ];

    this.loaded = false;

    this.loadState();
  }

  resize() {
    this.loadStateSlots();
  }

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

  update() {
    this.level.text(this.player.level);
    this.experience.text(this.player.experience);
    this.loadStateSlots();
  }

  forEachSlot(callback) {
    _.each(this.slots, (slot) => {
      callback(slot);
    });
  }

  getScale() {
    return this.game.renderer.getDrawingScale();
  }
}
