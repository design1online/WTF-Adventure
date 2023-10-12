import Packets from './packets.js';

/**
 * Abstract class wrapper for all message classes
 * Should contain:
 *  - constructor()
 *  - serialize() => returns Array
 */
class Message {}

class Handshake extends Message {
  constructor(clientId, devClient) {
    super();
    this.clientId = clientId;
    this.devClient = devClient;
  }

  serialize() {
    return [Packets.Handshake, [this.clientId, this.devClient]];
  }
}

class Welcome extends Message {
  constructor(data) {
    super();
    this.data = data; // array of info
  }

  serialize() {
    return [Packets.Welcome, this.data];
  }
}

class Spawn extends Message {
  constructor(entity) {
    super();
    this.entity = entity;
  }

  serialize() {
    return [Packets.Spawn, this.entity.getState()];
  }
}

class List extends Message {
  constructor(list) {
    super();
    this.list = list;
  }

  serialize() {
    return [Packets.List, this.list];
  }
}

class Sync extends Message {
  constructor(data) {
    super();
    this.data = data;
  }

  serialize() {
    return [Packets.Sync, this.data];
  }
}

class Equipment extends Message {
  constructor(opcode, equipmentData) {
    super();
    this.opcode = opcode;
    this.equipmentData = equipmentData;
  }

  serialize() {
    return [Packets.Equipment, this.opcode, this.equipmentData];
  }
}

class Movement extends Message {
  constructor(opcode, data) {
    super();
    this.opcode = opcode;
    this.data = data;
  }

  serialize() {
    return [Packets.Movement, [this.opcode, this.data]];
  }
}

class Teleport extends Message {
  constructor(id, x, y, withAnimation) {
    super();
    this.id = id;
    this.x = x;
    this.y = y;
    this.withAnimation = withAnimation;
  }

  serialize() {
    return [Packets.Teleport, [this.id, this.x, this.y, this.withAnimation]];
  }
}

class Despawn extends Message {
  constructor(id) {
    super();
    this.id = id;
  }

  serialize() {
    return [Packets.Despawn, this.id];
  }
}

class Animation extends Message {
  constructor(id, data) {
    super();
    this.id = id;
    this.data = data;
  }

  serialize() {
    return [Packets.Animation, this.id, this.data];
  }
}

class Combat extends Message {
  constructor(opcode, attackerId, targetId, hitData) {
    super();
    this.opcode = opcode;
    this.attackerId = attackerId;
    this.targetId = targetId;
    this.hitData = hitData;
  }

  serialize() {
    return [
      Packets.Combat,
      [this.opcode, this.attackerId, this.targetId, this.hitData],
    ];
  }
}

class Projectile extends Message {
  constructor(opcode, data) {
    super();
    this.opcode = opcode;
    this.data = data;
  }

  serialize() {
    return [Packets.Projectile, this.opcode, this.data];
  }
}

class Population extends Message {
  constructor(playerCount) {
    super();
    this.playerCount = playerCount;
  }

  serialize() {
    return [Packets.Population, this.playerCount];
  }
}

class Points extends Message {
  constructor(id, hitPoints, mana) {
    super();
    this.id = id;
    this.hitPoints = hitPoints;
    this.mana = mana;
  }

  serialize() {
    return [Packets.Points, [this.id, this.hitPoints, this.mana]];
  }
}

class Network extends Message {
  constructor(opcode) {
    super();
    this.opcode = opcode;
  }

  serialize() {
    return [Packets.Network, this.opcode];
  }
}

class Chat extends Message {
  constructor(data) {
    super();
    this.data = data;
  }

  serialize() {
    return [Packets.Chat, this.data];
  }
}

/**
 * Should we just have a packet that represents containers
 * as a whole or just send it separately for each?
 */
class Inventory extends Message {
  constructor(opcode, data) {
    super();
    this.opcode = opcode;
    this.data = data;
  }

  serialize() {
    return [Packets.Inventory, this.opcode, this.data];
  }
}

class Bank extends Message {
  constructor(opcode, data) {
    super();
    this.opcode = opcode;
    this.data = data;
  }

  serialize() {
    return [Packets.Bank, this.opcode, this.data];
  }
}

class Ability extends Message {
  constructor(opcode, data) {
    super();
    this.opcode = opcode;
    this.data = data;
  }

  serialize() {
    return [Packets.Ability, this.opcode, this.data];
  }
}

class Quest extends Message {
  constructor(opcode, data) {
    super();
    this.opcode = opcode;
    this.data = data;
  }

  serialize() {
    return [Packets.Quest, this.opcode, this.data];
  }
}

class Notification extends Message {
  constructor(opcode, message) {
    super();
    this.opcode = opcode;
    this.message = message;
  }

  serialize() {
    return [Packets.Notification, this.opcode, this.message];
  }
}

class Blink extends Message {
  constructor(instance) {
    super();
    this.instance = instance;
  }

  serialize() {
    return [Packets.Blink, this.instance];
  }
}

class Heal extends Message {
  constructor(info) {
    super();
    this.info = info;
  }

  serialize() {
    return [Packets.Heal, this.info];
  }
}

class Experience extends Message {
  constructor(info) {
    super();
    this.info = info;
  }

  serialize() {
    return [Packets.Experience, this.info];
  }
}

class Death extends Message {
  constructor(id) {
    super();
    this.id = id;
  }

  serialize() {
    return [Packets.Death, this.id];
  }
}

class Audio extends Message {
  constructor(song) {
    super();
    this.song = song;
  }

  serialize() {
    return [Packets.Audio, this.song];
  }
}

class NPC extends Message {
  constructor(opcode, info) {
    super();
    this.opcode = opcode;
    this.info = info;
  }

  serialize() {
    return [Packets.NPC, this.opcode, this.info];
  }
}

class Respawn extends Message {
  constructor(instance, x, y) {
    super();
    this.instance = instance;
    this.x = x;
    this.y = y;
  }

  serialize() {
    return [Packets.Respawn, this.instance, this.x, this.y];
  }
}

class Enchant extends Message {
  constructor(opcode, info) {
    super();
    this.opcode = opcode;
    this.info = info;
  }

  serialize() {
    return [Packets.Enchant, this.opcode, this.info];
  }
}

class Guild extends Message {
  constructor(opcode, info) {
    super();
    this.opcode = opcode;
    this.info = info;
  }

  serialize() {
    return [Packets.Enchant, this.opcode, this.info];
  }
}

class Pointer extends Message {
  constructor(opcode, info) {
    super();
    this.opcode = opcode;
    this.info = info;
  }

  serialize() {
    return [Packets.Pointer, this.opcode, this.info];
  }
}

class PVP extends Message {
  constructor(id, pvp) {
    super();
    this.id = id;
    this.pvp = pvp;
  }

  serialize() {
    return [Packets.PVP, this.id, this.pvp];
  }
}

class Shop extends Message {
  constructor(opcode, info) {
    super();
    this.opcode = opcode;
    this.info = info;
  }

  serialize() {
    return [Packets.Shop, this.opcode, this.info];
  }
}

export default {
  Handshake,
  Welcome,
  Spawn,
  List,
  Sync,
  Equipment,
  Movement,
  Teleport,
  Despawn,
  Animation,
  Combat,
  Projectile,
  Population,
  Points,
  Network,
  Chat,
  Inventory,
  Bank,
  Ability,
  Quest,
  Notification,
  Blink,
  Heal,
  Experience,
  Death,
  Pointer,
  NPC,
  Audio,
  Respawn,
  Enchant,
  Guild,
  PVP,
  Shop,
};
