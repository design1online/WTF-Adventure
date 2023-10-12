import _ from 'underscore';
import Packets from './packets';
import log from '../lib/log';

/**
 * Do not clutter up the Socket class with callbacks,
 * have this class here until a better method arises in my head.
 *
 * This class should not have any complex functionality, its main
 * role is to provide organization for packets and increase readability
 *
 * Please respect the order of the Packets Enum and arrange functions
 * accordingly.
 */
export default class Messages {
  constructor(client) {
    log.debug('Messages - constructor()', client);

    this.client = client;
    this.messages = [];
    this.messages[Packets.Handshake] = this.receiveHandshake; // 0
    this.messages[Packets.Intro] = null; // 1
    this.messages[Packets.Welcome] = this.receiveWelcome; // 2
    this.messages[Packets.Spawn] = this.receiveSpawn; // 3
    this.messages[Packets.List] = this.receiveEntityList; // 4
    this.messages[Packets.Who] = null; // 5
    this.messages[Packets.Equipment] = this.receiveEquipment; // 6
    this.messages[Packets.Ready] = null; // 7
    this.messages[Packets.Sync] = this.receiveSync; // 8
    this.messages[Packets.Movement] = this.receiveMovement; // 9
    this.messages[Packets.Teleport] = this.receiveTeleport; // 10
    this.messages[Packets.Request] = null; // 11
    this.messages[Packets.Despawn] = this.receiveDespawn; // 12
    this.messages[Packets.Target] = null; // 13
    this.messages[Packets.Combat] = this.receiveCombat; // 14
    this.messages[Packets.Animation] = this.receiveAnimation; // 15
    this.messages[Packets.Projectile] = this.receiveProjectile; // 16
    this.messages[Packets.Population] = this.receivePopulation; // 17
    this.messages[Packets.Points] = this.receivePoints; // 18
    this.messages[Packets.Network] = this.receiveNetwork; // 19
    this.messages[Packets.Chat] = this.receiveChat; // 20
    this.messages[Packets.Command] = this.receiveCommand; // 21
    this.messages[Packets.Inventory] = this.receiveInventory; // 22
    this.messages[Packets.Bank] = this.receiveBank; // 23
    this.messages[Packets.Ability] = this.receiveAbility; // 24
    this.messages[Packets.Quest] = this.receiveQuest; // 25
    this.messages[Packets.Notification] = this.receiveNotification; // 26
    this.messages[Packets.Blink] = this.receiveBlink; // 27
    this.messages[Packets.Heal] = this.receiveHeal; // 28
    this.messages[Packets.Experience] = this.receiveExperience; // 29
    this.messages[Packets.Death] = this.receiveDeath; // 30
    this.messages[Packets.Audio] = this.receiveAudio; // 31
    this.messages[Packets.NPC] = this.receiveNPC; // 32
    this.messages[Packets.Respawn] = this.receiveRespawn; // 33
    this.messages[Packets.Trade] = null;
    this.messages[Packets.Enchant] = this.receiveEnchant; // 35
    this.messages[Packets.Guild] = this.receiveGuild; // 36
    this.messages[Packets.Pointer] = this.receivePointer; // 37
    this.messages[Packets.PVP] = this.receivePVP; // 38
    this.messages[Packets.Click] = null; // 39
    this.messages[Packets.Warp] = null; // 40
    this.messages[Packets.Shop] = this.receiveShop; // 41
  }

  /**
   * Handle a message from the server
   * @param  {String} data the packet number and data
   */
  handleData(data) {
    log.debug('Messages - handleData()', data);

    const packet = data.shift();

    if (this.messages[packet] && _.isFunction(this.messages[packet])) {
      this.messages[packet].call(this, data);
    }
  }

  /**
   * Handle bulk data messages, calls handleData() on each one in the array
   * @param  {Array[String]} data Handle a list of messages
   */
  handleBulkData(data) {
    log.debug('Messages - handleBulkData()', data);

    _.each(data, (message) => {
      this.handleData(message);
    });
  }

  /**
   * Handle a UTF8 message, not a server packet message
   * Displays the error message on the client
   * @param  {String} message the message
   */
  handleUTF8(message) {
    log.debug('Messages - handleUTF8()', message);

    this.client.toggleLogin(false);

    switch (message) {
      case 'updated':
        this.client.sendError(null, 'The client has been updated!');
        break;

      case 'full':
        this.client.sendError(null, 'The servers are currently full!');
        break;

      case 'error':
        this.client.sendError(null, 'The server has responded with an error!');
        break;

      case 'development':
        this.client.sendError(
          null,
          'The game is currently in development mode.',
        );
        break;

      case 'disallowed':
        this.client.sendError(
          null,
          'The server is currently not accepting connections!',
        );
        break;

      case 'maintenance':
        this.client.sendError(
          null,
          'WTF?! Adventure is currently under construction.',
        );
        break;

      case 'userexists':
        this.client.sendError(
          null,
          'The username you have chosen already exists.',
        );
        break;

      case 'emailexists':
        this.client.sendError(
          null,
          'The email you have chosen is not available.',
        );
        break;

      case 'loggedin':
        this.client.sendError(null, 'The player is already logged in!');
        break;

      case 'invalidlogin':
        this.client.sendError(
          null,
          'You have entered the wrong username or password.',
        );
        break;

      case 'toofast':
        this.client.sendError(
          null,
          'You are trying to log in too fast from the same connection.',
        );
        break;

      case 'malform':
        this.client.game.handleDisconnection(true);
        this.client.sendError(null, 'Client has experienced a malfunction.');
        break;

      case 'timeout':
        this.client.sendError(
          null,
          'You have been disconnected for being inactive for too long.',
        );
        break;

      case 'validatingLogin':
        this.client.sendError(null, 'Validating login...');
        break;
      default:
        this.client.sendError(null, `An unknown error has occurred: ${message}`);
        break;
    }
  }

  /**
   * Recieve the server handshake
   * @param  {String} data Packet and data message
   */
  receiveHandshake(data) {
    log.debug('Messages - receiveHandshake()', data);

    if (this.handshakeCallback) {
      this.handshakeCallback(data.shift());
    }
  }

  /**
   * Recieve the server welcome
   * @param  {String} data Packet and data message
   */
  receiveWelcome(data) {
    log.debug('Messages - receiveWelcome()', data);

    const playerData = data.shift();

    if (this.welcomeCallback) {
      this.welcomeCallback(playerData);
    }
  }

  /**
   * Recieve server spawn
   * @param  {String} data Packet and data message
   */
  receiveSpawn(data) {
    log.debug('Messages - receiveSpawn()', data);

    if (this.spawnCallback) {
      this.spawnCallback(data);
    }
  }

  /**
   * Recieve equipment change
   * @param  {String} data Packet, equipment type, and equipment info message
   */
  receiveEquipment(data) {
    log.debug('Messages - receiveEquipment()', data);

    const equipType = data.shift();
    const equipInfo = data.shift();

    if (this.equipmentCallback) {
      this.equipmentCallback(equipType, equipInfo);
    }
  }

  /**
   * Recieve the server list of game entities
   * @param  {String} data Packet and data message
   */
  receiveEntityList(data) {
    log.debug('Messages - receiveEntityList()', data);

    if (this.entityListCallback) {
      this.entityListCallback(data);
    }
  }

  /**
   * Recieve the server sync
   * @param  {String} data Packet and data message
   */
  receiveSync(data) {
    log.debug('Messages - receiveSync()', data);

    if (this.syncCallback) {
      this.syncCallback(data.shift());
    }
  }

  /**
   * Recieve the server entity movement
   * @param  {String} data Packet and data message
   */
  receiveMovement(data) {
    log.debug('Messages - receiveMovement()', data);

    const movementData = data.shift();
    if (this.movementCallback) {
      this.movementCallback(movementData);
    }
  }

  /**
   * Recieve the server teleport
   * @param  {String} data Packet and data message
   */
  receiveTeleport(data) {
    log.debug('Messages - receiveTeleport()', data);

    const teleportData = data.shift();

    if (this.teleportCallback) {
      this.teleportCallback(teleportData);
    }
  }

  /**
   * Recieve the server despawn
   * @param  {String} data Packet and data message
   */
  receiveDespawn(data) {
    log.debug('Messages - receiveDespawn()', data);

    const id = data.shift();

    if (this.despawnCallback) {
      this.despawnCallback(id);
    }
  }

  /**
   * Recieve the server combat
   * @param  {String} data Packet and data message
   */
  receiveCombat(data) {
    log.debug('Messages - receiveCombat()', data);

    const combatData = data.shift();

    if (this.combatCallback) {
      this.combatCallback(combatData);
    }
  }

  /**
   * Recieve the server animation
   * @param  {String} data Packet, id and info
   */
  receiveAnimation(data) {
    log.debug('Messages - receiveAnimation()', data);

    const id = data.shift();
    const info = data.shift();

    if (this.animationCallback) {
      this.animationCallback(id, info);
    }
  }

  /**
   * Recieve the server projectile
   * @param  {String} data Packet, type and info
   */
  receiveProjectile(data) {
    log.debug('Messages - receiveProjectile()', data);

    const type = data.shift();
    const info = data.shift();

    if (this.projectileCallback) {
      this.projectileCallback(type, info);
    }
  }

  /**
   * Recieve the server population
   * @param  {String} data Packet and data message
   */
  receivePopulation(data) {
    log.debug('Messages - receivePopulation()', data);

    if (this.populationCallback) {
      this.populationCallback(data.shift());
    }
  }

  /**
   * Recieve the server points
   * @param  {String} data Packet and data message
   */
  receivePoints(data) {
    log.debug('Messages - receivePoints()', data);

    const pointsData = data.shift();

    if (this.pointsCallback) {
      this.pointsCallback(pointsData);
    }
  }

  /**
   * Recieve the server network change
   * @param  {String} data Packet and opcode data message
   */
  receiveNetwork(data) {
    log.debug('Messages - receiveNetwork()', data);

    const opcode = data.shift();

    if (this.networkCallback) {
      this.networkCallback(opcode);
    }
  }

  /**
   * Recieve the server chat message
   * @param  {String} data Packet and data message
   */
  receiveChat(data) {
    log.debug('Messages - receiveChat()', data);

    const info = data.shift();

    if (this.chatCallback) {
      this.chatCallback(info);
    }
  }

  /**
   * Recieve the server command
   * @param  {String} data Packet and data message
   */
  receiveCommand(data) {
    log.debug('Messages - receiveCommand()', data);

    const info = data.shift();

    if (this.commandCallback) {
      this.commandCallback(info);
    }
  }

  /**
   * Recieve the server inventory
   * @param  {String} data Packet, opcode and data message
   */
  receiveInventory(data) {
    log.debug('Messages - receiveInventory()', data);

    const opcode = data.shift();
    const info = data.shift();

    if (this.inventoryCallback) {
      this.inventoryCallback(opcode, info);
    }
  }

  /**
   * Recieve the server bank callback
   * @param  {String} data Packet, opcode and info message
   */
  receiveBank(data) {
    log.debug('Messages - receiveBank()', data);

    const opcode = data.shift();
    const info = data.shift();

    if (this.bankCallback) {
      this.bankCallback(opcode, info);
    }
  }

  /**
   * Recieve the server ability
   * @param  {String} data Packet, opcode and info message
   */
  receiveAbility(data) {
    log.debug('Messages - receiveAbility()', data);

    const opcode = data.shift();
    const info = data.shift();

    if (this.abilityCallback) {
      this.abilityCallback(opcode, info);
    }
  }

  /**
   * Recieve the server quest
   * @param  {String} data Packet, opcode and info message
   */
  receiveQuest(data) {
    log.debug('Messages - receiveQuest()', data);

    const opcode = data.shift();
    const info = data.shift();

    if (this.questCallback) {
      this.questCallback(opcode, info);
    }
  }

  /**
   * Recieve the server notification
   * @param  {String} data Packet, opcode and message
   */
  receiveNotification(data) {
    log.debug('Messages - receiveNotification()', data);

    const opcode = data.shift();
    const message = data.shift();

    if (this.notificationCallback) {
      this.notificationCallback(opcode, message);
    }
  }

  /**
   * Recieve the server blink
   * @param  {String} data Packet and data message
   */
  receiveBlink(data) {
    log.debug('Messages - receiveBlink()', data);

    const instance = data.shift();

    if (this.blinkCallback) {
      this.blinkCallback(instance);
    }
  }

  /**
   * Recieve the server heal
   * @param  {String} data Packet and data message
   */
  receiveHeal(data) {
    log.debug('Messages - receiveHeal()', data);

    if (this.healCallback) {
      this.healCallback(data.shift());
    }
  }

  /**
   * Recieve the server experience
   * @param  {String} data Packet and data message
   */
  receiveExperience(data) {
    log.debug('Messages - receiveExperience()', data);

    if (this.experienceCallback) {
      this.experienceCallback(data.shift());
    }
  }

  /**
   * Recieve the server death
   * @param  {String} data Packet and data message
   */
  receiveDeath(data) {
    log.debug('Messages - receiveDeath()', data);

    if (this.deathCallback) {
      this.deathCallback(data.shift());
    }
  }

  /**
   * Recieve the server audio
   * @param  {String} data Packet and data message
   */
  receiveAudio(data) {
    if (this.audioCallback) {
      this.audioCallback(data.shift());
    }
  }

  /**
   * Recieve the server NPC
   * @param  {String} data Opcode and info message
   */
  receiveNPC(data) {
    const opcode = data.shift();
    const info = data.shift();

    if (this.npcCallback) {
      this.npcCallback(opcode, info);
    }
  }

  /**
   * Recieve the server respawn
   * @param  {String} data id, x, and y coordinates
   */
  receiveRespawn(data) {
    const id = data.shift();
    const x = data.shift();
    const y = data.shift();

    if (this.respawnCallback) {
      this.respawnCallback(id, x, y);
    }
  }

  /**
   * Recieve the server enchant
   * @param  {String} data Opcode and info message
   */
  receiveEnchant(data) {
    const opcode = data.shift();
    const info = data.shift();

    if (this.enchantCallback) {
      this.enchantCallback(opcode, info);
    }
  }

  /**
   * Recieve the server guild
   * @param  {String} data Opcode and info message
   */
  receiveGuild(data) {
    const opcode = data.shift();
    const info = data.shift();

    if (this.guildCallback) {
      this.guildCallback(opcode, info);
    }
  }

  /**
   * Recieve the server pointer
   * @param  {String} data Opcode and info message
   */
  receivePointer(data) {
    const opcode = data.shift();
    const info = data.shift();

    if (this.pointerCallback) {
      this.pointerCallback(opcode, info);
    }
  }

  /**
   * Recieve the server player vs player (PVP)
   * @param  {String} data id and PVP id
   */
  receivePVP(data) {
    const id = data.shift();
    const pvp = data.shift();

    if (this.pvpCallback) {
      this.pvpCallback(id, pvp);
    }
  }

  /**
   * Recieve the server shop
   * @param  {String} data Opcode and info message
   */
  receiveShop(data) {
    const opcode = data.shift();
    const info = data.shift();

    if (this.shopCallback) {
      this.shopCallback(opcode, info);
    }
  }

  /**
   * Universal callback for onHandshake
   * @param {Function} callback
   */
  onHandshake(callback) {
    this.handshakeCallback = callback;
  }

  /**
   * Universal callback for onWelcome
   * @param {Function} callback
   */
  onWelcome(callback) {
    this.welcomeCallback = callback;
  }

  /**
   * Universal callback for onSpawn
   * @param {Function} callback
   */
  onSpawn(callback) {
    this.spawnCallback = callback;
  }

  /**
   * Universal callback for onEquipment
   * @param {Function} callback
   */
  onEquipment(callback) {
    this.equipmentCallback = callback;
  }

  /**
   * Universal callback for onEntityList
   * @param {Function} callback
   */
  onEntityList(callback) {
    this.entityListCallback = callback;
  }

  /**
   * Universal callback for onSync
   * @param {Function} callback
   */
  onSync(callback) {
    this.syncCallback = callback;
  }

  /**
   * Universal callback for onMovement
   * @param {Function} callback
   */
  onMovement(callback) {
    this.movementCallback = callback;
  }

  /**
   * Universal callback for onTeleport
   * @param {Function} callback
   */
  onTeleport(callback) {
    this.teleportCallback = callback;
  }

  /**
   * Universal callback for onDespawn
   * @param {Function} callback
   */
  onDespawn(callback) {
    this.despawnCallback = callback;
  }

  /**
   * Universal callback for onCombat
   * @param {Function} callback
   */
  onCombat(callback) {
    this.combatCallback = callback;
  }

  /**
   * Universal callback for onAnimation
   * @param {Function} callback
   */
  onAnimation(callback) {
    this.animationCallback = callback;
  }

  /**
   * Universal callback for onProjectile
   * @param {Function} callback
   */
  onProjectile(callback) {
    this.projectileCallback = callback;
  }

  /**
   * Universal callback for onPopulation
   * @param {Function} callback
   */
  onPopulation(callback) {
    this.populationCallback = callback;
  }

  /**
   * Universal callback for onPoints
   * @param {Function} callback
   */
  onPoints(callback) {
    this.pointsCallback = callback;
  }

  /**
   * Universal callback for onNetwork
   * @param {Function} callback
   */
  onNetwork(callback) {
    this.networkCallback = callback;
  }

  /**
   * Universal callback for onChat
   * @param {Function} callback
   */
  onChat(callback) {
    this.chatCallback = callback;
  }

  /**
   * Universal callback for onCommand
   * @param {Function} callback
   */
  onCommand(callback) {
    this.commandCallback = callback;
  }

  /**
   * Universal callback for onInventory
   * @param {Function} callback
   */
  onInventory(callback) {
    this.inventoryCallback = callback;
  }

  /**
   * Universal callback for onBank
   * @param {Function} callback
   */
  onBank(callback) {
    this.bankCallback = callback;
  }

  /**
   * Universal callback for onAbility
   * @param {Function} callback
   */
  onAbility(callback) {
    this.abilityCallback = callback;
  }

  /**
   * Universal callback for onQuest
   * @param {Function} callback
   */
  onQuest(callback) {
    this.questCallback = callback;
  }

  /**
   * Universal callback for onNotification
   * @param {Function} callback
   */
  onNotification(callback) {
    this.notificationCallback = callback;
  }

  /**
   * Universal callback for onBlink
   * @param {Function} callback
   */
  onBlink(callback) {
    this.blinkCallback = callback;
  }

  /**
   * Universal callback for onHeal
   * @param {Function} callback
   */
  onHeal(callback) {
    this.healCallback = callback;
  }

  /**
   * Universal callback for onExperience
   * @param {Function} callback
   */
  onExperience(callback) {
    this.experienceCallback = callback;
  }

  /**
   * Universal callback for onDeath
   * @param {Function} callback
   */
  onDeath(callback) {
    this.deathCallback = callback;
  }

  /**
   * Universal callback for onAudio
   * @param {Function} callback
   */
  onAudio(callback) {
    this.audioCallback = callback;
  }

  /**
   * Universal callback for onNPC
   * @param {Function} callback
   */
  onNPC(callback) {
    this.npcCallback = callback;
  }

  /**
   * Universal callback for onRespawn
   * @param {Function} callback
   */
  onRespawn(callback) {
    this.respawnCallback = callback;
  }

  /**
   * Universal callback for onEnchant
   * @param {Function} callback
   */
  onEnchant(callback) {
    this.enchantCallback = callback;
  }

  /**
   * Universal callback for onGuild
   * @param {Function} callback
   */
  onGuild(callback) {
    this.guildCallback = callback;
  }

  /**
   * Universal callback for onPointer
   * @param {Function} callback
   */
  onPointer(callback) {
    this.pointerCallback = callback;
  }

  /**
   * Universal callback for onPVP
   * @param {Function} callback
   */
  onPVP(callback) {
    this.pvpCallback = callback;
  }

  /**
   * Universal callback for onShop
   * @param {Function} callback
   */
  onShop(callback) {
    this.shopCallback = callback;
  }
}
