import Packets from './packets.js';

/**
 * Abstract class wrapper for all message classes
 * Should contain:
 *  - constructor()
 *  - serialize() => returns Array
 */
class Message {}

/**
 * Message sent during the initial handshake between client and server
 * @class
 */
class Handshake extends Message {
  /**
   * Default constructor
   * @param {String} clientId the unique client identifier
   * @param {Boolean} devClient whether this is a development client
   */
  constructor(clientId, devClient) {
    super();
    /**
     * The unique client identifier
     * @type {String}
     */
    this.clientId = clientId;
    /**
     * Whether this is a development client
     * @type {Boolean}
     */
    this.devClient = devClient;
  }

  /**
   * Serializes the message into an array for transmission
   * @return {Array}
   */
  serialize() {
    return [Packets.Handshake, [this.clientId, this.devClient]];
  }
}

/**
 * Message sent to a client upon successful connection with player info
 * @class
 */
class Welcome extends Message {
  /**
   * Default constructor
   * @param {Array} data array of welcome information for the client
   */
  constructor(data) {
    super();
    /**
     * Array of welcome information for the client
     * @type {Array}
     */
    this.data = data; // array of info
  }

  /**
   * Serializes the message into an array for transmission
   * @return {Array}
   */
  serialize() {
    return [Packets.Welcome, this.data];
  }
}

/**
 * Message sent when an entity appears in the world
 * @class
 */
class Spawn extends Message {
  /**
   * Default constructor
   * @param {Object} entity the entity that is spawning
   */
  constructor(entity) {
    super();
    /**
     * The entity that is spawning
     * @type {Object}
     */
    this.entity = entity;
  }

  /**
   * Serializes the message into an array for transmission
   * @return {Array}
   */
  serialize() {
    return [Packets.Spawn, this.entity.getState()];
  }
}

/**
 * Message containing a list of entity instances visible to the client
 * @class
 */
class List extends Message {
  /**
   * Default constructor
   * @param {Array} list the list of entity instances
   */
  constructor(list) {
    super();
    /**
     * The list of entity instances
     * @type {Array}
     */
    this.list = list;
  }

  /**
   * Serializes the message into an array for transmission
   * @return {Array}
   */
  serialize() {
    return [Packets.List, this.list];
  }
}

/**
 * Message used to synchronize player state with the client
 * @class
 */
class Sync extends Message {
  /**
   * Default constructor
   * @param {Object} data the sync data to send to the client
   */
  constructor(data) {
    super();
    /**
     * The sync data to send to the client
     * @type {Object}
     */
    this.data = data;
  }

  /**
   * Serializes the message into an array for transmission
   * @return {Array}
   */
  serialize() {
    return [Packets.Sync, this.data];
  }
}

/**
 * Message for equipment-related actions such as equipping or removing items
 * @class
 */
class Equipment extends Message {
  /**
   * Default constructor
   * @param {Number} opcode the equipment action opcode
   * @param {Object} equipmentData the equipment data associated with this action
   */
  constructor(opcode, equipmentData) {
    super();
    /**
     * The equipment action opcode
     * @type {Number}
     */
    this.opcode = opcode;
    /**
     * The equipment data associated with this action
     * @type {Object}
     */
    this.equipmentData = equipmentData;
  }

  /**
   * Serializes the message into an array for transmission
   * @return {Array}
   */
  serialize() {
    return [Packets.Equipment, this.opcode, this.equipmentData];
  }
}

/**
 * Message representing entity movement in the world
 * @class
 */
class Movement extends Message {
  /**
   * Default constructor
   * @param {Number} opcode the movement action opcode
   * @param {Object} data the movement data
   */
  constructor(opcode, data) {
    super();
    /**
     * The movement action opcode
     * @type {Number}
     */
    this.opcode = opcode;
    /**
     * The movement data
     * @type {Object}
     */
    this.data = data;
  }

  /**
   * Serializes the message into an array for transmission
   * @return {Array}
   */
  serialize() {
    return [Packets.Movement, [this.opcode, this.data]];
  }
}

/**
 * Message sent when an entity is teleported to a new position
 * @class
 */
class Teleport extends Message {
  /**
   * Default constructor
   * @param {String} id the instance identifier of the entity being teleported
   * @param {Number} x the destination x-coordinate
   * @param {Number} y the destination y-coordinate
   * @param {Boolean} withAnimation whether to play a teleport animation
   */
  constructor(id, x, y, withAnimation) {
    super();
    /**
     * The instance identifier of the entity being teleported
     * @type {String}
     */
    this.id = id;
    /**
     * The destination x-coordinate
     * @type {Number}
     */
    this.x = x;
    /**
     * The destination y-coordinate
     * @type {Number}
     */
    this.y = y;
    /**
     * Whether to play a teleport animation
     * @type {Boolean}
     */
    this.withAnimation = withAnimation;
  }

  /**
   * Serializes the message into an array for transmission
   * @return {Array}
   */
  serialize() {
    return [Packets.Teleport, [this.id, this.x, this.y, this.withAnimation]];
  }
}

/**
 * Message sent when an entity is removed from the client's view
 * @class
 */
class Despawn extends Message {
  /**
   * Default constructor
   * @param {String} id the instance identifier of the entity to despawn
   */
  constructor(id) {
    super();
    /**
     * The instance identifier of the entity to despawn
     * @type {String}
     */
    this.id = id;
  }

  /**
   * Serializes the message into an array for transmission
   * @return {Array}
   */
  serialize() {
    return [Packets.Despawn, this.id];
  }
}

/**
 * Message used to trigger an animation on an entity
 * @class
 */
class Animation extends Message {
  /**
   * Default constructor
   * @param {String} id the instance identifier of the entity to animate
   * @param {Object} data the animation data
   */
  constructor(id, data) {
    super();
    /**
     * The instance identifier of the entity to animate
     * @type {String}
     */
    this.id = id;
    /**
     * The animation data
     * @type {Object}
     */
    this.data = data;
  }

  /**
   * Serializes the message into an array for transmission
   * @return {Array}
   */
  serialize() {
    return [Packets.Animation, this.id, this.data];
  }
}

/**
 * Message representing a combat action between two entities
 * @class
 */
class Combat extends Message {
  /**
   * Default constructor
   * @param {Number} opcode the combat action opcode
   * @param {String} attackerId the instance identifier of the attacker
   * @param {String} targetId the instance identifier of the target
   * @param {Object} hitData the hit data including damage information
   */
  constructor(opcode, attackerId, targetId, hitData) {
    super();
    /**
     * The combat action opcode
     * @type {Number}
     */
    this.opcode = opcode;
    /**
     * The instance identifier of the attacker
     * @type {String}
     */
    this.attackerId = attackerId;
    /**
     * The instance identifier of the target
     * @type {String}
     */
    this.targetId = targetId;
    /**
     * The hit data including damage information
     * @type {Object}
     */
    this.hitData = hitData;
  }

  /**
   * Serializes the message into an array for transmission
   * @return {Array}
   */
  serialize() {
    return [
      Packets.Combat,
      [this.opcode, this.attackerId, this.targetId, this.hitData],
    ];
  }
}

/**
 * Message used to create or update a projectile in the world
 * @class
 */
class Projectile extends Message {
  /**
   * Default constructor
   * @param {Number} opcode the projectile action opcode
   * @param {Object} data the projectile data
   */
  constructor(opcode, data) {
    super();
    /**
     * The projectile action opcode
     * @type {Number}
     */
    this.opcode = opcode;
    /**
     * The projectile data
     * @type {Object}
     */
    this.data = data;
  }

  /**
   * Serializes the message into an array for transmission
   * @return {Array}
   */
  serialize() {
    return [Packets.Projectile, this.opcode, this.data];
  }
}

/**
 * Message indicating the current number of players on the server
 * @class
 */
class Population extends Message {
  /**
   * Default constructor
   * @param {Number} playerCount the current number of players online
   */
  constructor(playerCount) {
    super();
    /**
     * The current number of players online
     * @type {Number}
     */
    this.playerCount = playerCount;
  }

  /**
   * Serializes the message into an array for transmission
   * @return {Array}
   */
  serialize() {
    return [Packets.Population, this.playerCount];
  }
}

/**
 * Message used to update a character's hit points and mana
 * @class
 */
class Points extends Message {
  /**
   * Default constructor
   * @param {String} id the instance identifier of the character
   * @param {Number} hitPoints the current hit points of the character
   * @param {Number} mana the current mana of the character
   */
  constructor(id, hitPoints, mana) {
    super();
    /**
     * The instance identifier of the character
     * @type {String}
     */
    this.id = id;
    /**
     * The current hit points of the character
     * @type {Number}
     */
    this.hitPoints = hitPoints;
    /**
     * The current mana of the character
     * @type {Number}
     */
    this.mana = mana;
  }

  /**
   * Serializes the message into an array for transmission
   * @return {Array}
   */
  serialize() {
    return [Packets.Points, [this.id, this.hitPoints, this.mana]];
  }
}

/**
 * Message for low-level network control operations
 * @class
 */
class Network extends Message {
  /**
   * Default constructor
   * @param {Number} opcode the network control opcode
   */
  constructor(opcode) {
    super();
    /**
     * The network control opcode
     * @type {Number}
     */
    this.opcode = opcode;
  }

  /**
   * Serializes the message into an array for transmission
   * @return {Array}
   */
  serialize() {
    return [Packets.Network, this.opcode];
  }
}

/**
 * Message carrying a chat message from a player or the server
 * @class
 */
class Chat extends Message {
  /**
   * Default constructor
   * @param {Object} data the chat message data
   */
  constructor(data) {
    super();
    /**
     * The chat message data
     * @type {Object}
     */
    this.data = data;
  }

  /**
   * Serializes the message into an array for transmission
   * @return {Array}
   */
  serialize() {
    return [Packets.Chat, this.data];
  }
}

/**
 * Should we just have a packet that represents containers
 * as a whole or just send it separately for each?
 */
/**
 * Message for inventory-related actions such as adding or removing items
 * @class
 */
class Inventory extends Message {
  /**
   * Default constructor
   * @param {Number} opcode the inventory action opcode
   * @param {Object} data the inventory data
   */
  constructor(opcode, data) {
    super();
    /**
     * The inventory action opcode
     * @type {Number}
     */
    this.opcode = opcode;
    /**
     * The inventory data
     * @type {Object}
     */
    this.data = data;
  }

  /**
   * Serializes the message into an array for transmission
   * @return {Array}
   */
  serialize() {
    return [Packets.Inventory, this.opcode, this.data];
  }
}

/**
 * Message for bank-related actions such as depositing or withdrawing items
 * @class
 */
class Bank extends Message {
  /**
   * Default constructor
   * @param {Number} opcode the bank action opcode
   * @param {Object} data the bank data
   */
  constructor(opcode, data) {
    super();
    /**
     * The bank action opcode
     * @type {Number}
     */
    this.opcode = opcode;
    /**
     * The bank data
     * @type {Object}
     */
    this.data = data;
  }

  /**
   * Serializes the message into an array for transmission
   * @return {Array}
   */
  serialize() {
    return [Packets.Bank, this.opcode, this.data];
  }
}

/**
 * Message for ability-related actions such as using or leveling up an ability
 * @class
 */
class Ability extends Message {
  /**
   * Default constructor
   * @param {Number} opcode the ability action opcode
   * @param {Object} data the ability data
   */
  constructor(opcode, data) {
    super();
    /**
     * The ability action opcode
     * @type {Number}
     */
    this.opcode = opcode;
    /**
     * The ability data
     * @type {Object}
     */
    this.data = data;
  }

  /**
   * Serializes the message into an array for transmission
   * @return {Array}
   */
  serialize() {
    return [Packets.Ability, this.opcode, this.data];
  }
}

/**
 * Message for quest-related updates such as progress or completion
 * @class
 */
class Quest extends Message {
  /**
   * Default constructor
   * @param {Number} opcode the quest action opcode
   * @param {Object} data the quest data
   */
  constructor(opcode, data) {
    super();
    /**
     * The quest action opcode
     * @type {Number}
     */
    this.opcode = opcode;
    /**
     * The quest data
     * @type {Object}
     */
    this.data = data;
  }

  /**
   * Serializes the message into an array for transmission
   * @return {Array}
   */
  serialize() {
    return [Packets.Quest, this.opcode, this.data];
  }
}

/**
 * Message used to display a notification to the player
 * @class
 */
class Notification extends Message {
  /**
   * Default constructor
   * @param {Number} opcode the notification type opcode
   * @param {String} message the notification message text
   */
  constructor(opcode, message) {
    super();
    /**
     * The notification type opcode
     * @type {Number}
     */
    this.opcode = opcode;
    /**
     * The notification message text
     * @type {String}
     */
    this.message = message;
  }

  /**
   * Serializes the message into an array for transmission
   * @return {Array}
   */
  serialize() {
    return [Packets.Notification, this.opcode, this.message];
  }
}

/**
 * Message used to trigger a blink effect on an entity
 * @class
 */
class Blink extends Message {
  /**
   * Default constructor
   * @param {String} instance the instance identifier of the entity to blink
   */
  constructor(instance) {
    super();
    /**
     * The instance identifier of the entity to blink
     * @type {String}
     */
    this.instance = instance;
  }

  /**
   * Serializes the message into an array for transmission
   * @return {Array}
   */
  serialize() {
    return [Packets.Blink, this.instance];
  }
}

/**
 * Message sent when an entity is healed
 * @class
 */
class Heal extends Message {
  /**
   * Default constructor
   * @param {Object} info the healing information including entity and amount
   */
  constructor(info) {
    super();
    /**
     * The healing information including entity and amount
     * @type {Object}
     */
    this.info = info;
  }

  /**
   * Serializes the message into an array for transmission
   * @return {Array}
   */
  serialize() {
    return [Packets.Heal, this.info];
  }
}

/**
 * Message sent when a player gains experience points
 * @class
 */
class Experience extends Message {
  /**
   * Default constructor
   * @param {Object} info the experience information including amount and level data
   */
  constructor(info) {
    super();
    /**
     * The experience information including amount and level data
     * @type {Object}
     */
    this.info = info;
  }

  /**
   * Serializes the message into an array for transmission
   * @return {Array}
   */
  serialize() {
    return [Packets.Experience, this.info];
  }
}

/**
 * Message sent when an entity dies
 * @class
 */
class Death extends Message {
  /**
   * Default constructor
   * @param {String} id the instance identifier of the entity that died
   */
  constructor(id) {
    super();
    /**
     * The instance identifier of the entity that died
     * @type {String}
     */
    this.id = id;
  }

  /**
   * Serializes the message into an array for transmission
   * @return {Array}
   */
  serialize() {
    return [Packets.Death, this.id];
  }
}

/**
 * Message used to play a song or sound effect on the client
 * @class
 */
class Audio extends Message {
  /**
   * Default constructor
   * @param {String} song the name of the song or sound to play
   */
  constructor(song) {
    super();
    /**
     * The name of the song or sound to play
     * @type {String}
     */
    this.song = song;
  }

  /**
   * Serializes the message into an array for transmission
   * @return {Array}
   */
  serialize() {
    return [Packets.Audio, this.song];
  }
}

/**
 * Message for NPC-related interactions such as dialogue and quests
 * @class
 */
class NPC extends Message {
  /**
   * Default constructor
   * @param {Number} opcode the NPC action opcode
   * @param {Object} info the NPC interaction data
   */
  constructor(opcode, info) {
    super();
    /**
     * The NPC action opcode
     * @type {Number}
     */
    this.opcode = opcode;
    /**
     * The NPC interaction data
     * @type {Object}
     */
    this.info = info;
  }

  /**
   * Serializes the message into an array for transmission
   * @return {Array}
   */
  serialize() {
    return [Packets.NPC, this.opcode, this.info];
  }
}

/**
 * Message sent when a player respawns at a given position
 * @class
 */
class Respawn extends Message {
  /**
   * Default constructor
   * @param {String} instance the instance identifier of the respawning player
   * @param {Number} x the x-coordinate of the respawn position
   * @param {Number} y the y-coordinate of the respawn position
   */
  constructor(instance, x, y) {
    super();
    /**
     * The instance identifier of the respawning player
     * @type {String}
     */
    this.instance = instance;
    /**
     * The x-coordinate of the respawn position
     * @type {Number}
     */
    this.x = x;
    /**
     * The y-coordinate of the respawn position
     * @type {Number}
     */
    this.y = y;
  }

  /**
   * Serializes the message into an array for transmission
   * @return {Array}
   */
  serialize() {
    return [Packets.Respawn, this.instance, this.x, this.y];
  }
}

/**
 * Message for item enchantment actions
 * @class
 */
class Enchant extends Message {
  /**
   * Default constructor
   * @param {Number} opcode the enchant action opcode
   * @param {Object} info the enchantment data
   */
  constructor(opcode, info) {
    super();
    /**
     * The enchant action opcode
     * @type {Number}
     */
    this.opcode = opcode;
    /**
     * The enchantment data
     * @type {Object}
     */
    this.info = info;
  }

  /**
   * Serializes the message into an array for transmission
   * @return {Array}
   */
  serialize() {
    return [Packets.Enchant, this.opcode, this.info];
  }
}

/**
 * Message for guild-related actions and updates
 * @class
 */
class Guild extends Message {
  /**
   * Default constructor
   * @param {Number} opcode the guild action opcode
   * @param {Object} info the guild data
   */
  constructor(opcode, info) {
    super();
    /**
     * The guild action opcode
     * @type {Number}
     */
    this.opcode = opcode;
    /**
     * The guild data
     * @type {Object}
     */
    this.info = info;
  }

  /**
   * Serializes the message into an array for transmission
   * @return {Array}
   */
  serialize() {
    return [Packets.Enchant, this.opcode, this.info];
  }
}

/**
 * Message used to display a pointer or UI indicator to the player
 * @class
 */
class Pointer extends Message {
  /**
   * Default constructor
   * @param {Number} opcode the pointer action opcode
   * @param {Object} info the pointer data
   */
  constructor(opcode, info) {
    super();
    /**
     * The pointer action opcode
     * @type {Number}
     */
    this.opcode = opcode;
    /**
     * The pointer data
     * @type {Object}
     */
    this.info = info;
  }

  /**
   * Serializes the message into an array for transmission
   * @return {Array}
   */
  serialize() {
    return [Packets.Pointer, this.opcode, this.info];
  }
}

/**
 * Message indicating a player's PVP status change
 * @class
 */
class PVP extends Message {
  /**
   * Default constructor
   * @param {String} id the instance identifier of the player
   * @param {Boolean} pvp whether PVP is enabled for the player
   */
  constructor(id, pvp) {
    super();
    /**
     * The instance identifier of the player
     * @type {String}
     */
    this.id = id;
    /**
     * Whether PVP is enabled for the player
     * @type {Boolean}
     */
    this.pvp = pvp;
  }

  /**
   * Serializes the message into an array for transmission
   * @return {Array}
   */
  serialize() {
    return [Packets.PVP, this.id, this.pvp];
  }
}

/**
 * Message for shop-related interactions such as buying or selling items
 * @class
 */
class Shop extends Message {
  /**
   * Default constructor
   * @param {Number} opcode the shop action opcode
   * @param {Object} info the shop interaction data
   */
  constructor(opcode, info) {
    super();
    /**
     * The shop action opcode
     * @type {Number}
     */
    this.opcode = opcode;
    /**
     * The shop interaction data
     * @type {Object}
     */
    this.info = info;
  }

  /**
   * Serializes the message into an array for transmission
   * @return {Array}
   */
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
