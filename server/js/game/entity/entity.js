// import log from '../../util/log';
import Messages from '../../network/messages.js';
import Mobs from '../../util/mobs.js';
import NPCs from '../../util/npcs.js';
import Items from '../../util/items.js';

export default class Entity {
  constructor(id, type, instance, x, y) {
    this.id = id;
    this.type = type;
    this.instance = instance;
    this.oldX = x;
    this.oldY = y;
    this.x = x;
    this.y = y;

    this.combat = null;

    this.dead = false;

    this.recentGroups = [];
  }

  getCombat() {
    return null;
  }

  getDistance(entity) {
    const
      x = Math.abs(this.x - entity.x);


    const y = Math.abs(this.y - entity.y);

    return x > y ? x : y;
  }

  getCoordDistance(toX, toY) {
    const
      x = Math.abs(this.x - toX);


    const y = Math.abs(this.y - toY);

    return x > y ? x : y;
  }

  isAdjacent(entity) {
    if (!entity) return false;

    return this.getDistance(entity) <= 1;
  }

  isNonDiagonal(entity) {
    return (
      this.isAdjacent(entity) && !(entity.x !== this.x && entity.y !== this.y)
    );
  }

  isNear(entity, distance) {
    let
      near = false;

    const dx = Math.abs(this.x - entity.x);


    const dy = Math.abs(this.y - entity.y);

    if (dx <= distance && dy <= distance) near = true;

    return near;
  }

  talk() {
    log.notice('Who is screwing around with the client?');
  }

  drop(item) {
    return new Messages.Drop(this, item);
  }

  isPlayer() {
    return this.type === 'player';
  }

  isMob() {
    return this.type === 'mob';
  }

  isNPC() {
    return this.type === 'npc';
  }

  isItem() {
    return this.type === 'item';
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;

    if (this.setPositionCallback) this.setPositionCallback();
  }

  hasSpecialAttack() {
    return false;
  }

  updatePosition() {
    this.oldX = this.x;
    this.oldY = this.y;
  }

  onSetPosition(callback) {
    this.setPositionCallback = callback;
  }

  getState() {
    const isNPC = this.isNPC()
      ? NPCs.idToString(this.id)
      : Items.idToString(this.id);

    const string = this.isMob()
      ? Mobs.idToString(this.id)
      : isNPC;

    const isMobNPC = this.isNPC()
      ? NPCs.idToName(this.id)
      : Items.idToName(this.id);

    const name = this.isMob()
      ? Mobs.idToName(this.id)
      : isMobNPC;

    return {
      type: this.type,
      id: this.instance,
      string,
      name: string,
      label: name,
      x: this.x,
      y: this.y,
    };
  }
}
