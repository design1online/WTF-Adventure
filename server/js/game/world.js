import _ from 'underscore';
import log from '../util/log.js';
import config from '../../config.json' assert { type: 'json' };
import Player from './entity/character/player/player.js';
import Map from '../map/map.js';
import Messages from '../network/messages.js';
import Utils from '../util/utils.js';
import MobsDictionary from '../util/mobs.js';
import Mob from './entity/character/mob/mob.js';
import NpcsDictionary from '../util/npcs.js';
import NPC from './entity/npc/npc.js';
import ItemsDictionary from '../util/items.js';
import Item from './entity/objects/item.js';
import Chest from './entity/objects/chest.js';
import Character from './entity/character/character.js';
import Projectile from './entity/objects/projectile.js';
import Packets from '../network/packets.js';
import Formulas from './formulas.js';
import Modules from '../util/modules.js';

export default class World {
  constructor(id, socket, database) {
    this.id = id;
    this.socket = socket;
    this.database = database;
    this.playerCount = 0;
    this.maxPlayers = config.maxPlayers;
    this.updateTime = config.updateTime;
    this.debug = false;

    this.players = {};
    this.entities = {};
    this.chests = {};
    this.itemsDictionary = ItemsDictionary;
    this.mobsDictionary = MobsDictionary;
    this.npcsDictionary = NpcsDictionary;
    this.projectiles = {};
    this.packets = {};
    this.groups = {};

    this.loadedGroups = false;
    this.ready = false;
    this.malformTimeout = null;

    this.onPlayerConnection((connection) => {
      if (config.development) {
        connection.sendUTF8('maintenance');
        connection.close();

        return;
      }

      const clientId = Utils.generateClientId();
      const player = new Player(this, this.database, connection, clientId);
      const diff = new Date().getTime()
        - this.socket.ips[connection.socket.conn.remoteAddress];

      if (diff < 4000) {
        connection.sendUTF8('toofast');
        if (connection.Socket) {
          connection.Socket.close('Logging in too rapidly');
        }

        return;
      }

      this.socket.ips[
        connection.socket.conn.remoteAddress
      ] = new Date().getTime();

      this.addToPackets(player);

      this.pushToPlayer(
        player,
        new Messages.Handshake(clientId, config.devClient),
      );
    });

    /**
     * Grab the exact number of players from
     * the array of packets instead of adding
     * and subtracting and risking uncertainties.
     */
    this.onPopulationChange(() => {
      this.pushBroadcast(new Messages.Population(this.getPopulation()));
    });
  }

  /**
   * The reason maps are loaded per each world is because
   * we can have slight modifications for each world if we want in the
   * future. Using region loading, we can just send the client
   * whatever new map we have created server sided. Cleaner and nicer.
   */
  load(onWorldLoad) {
    log.notice(`************ World ${this.id} ***********`);

    this.map = new Map(this);
    this.map.isReady(() => {
      this.loadGroups();
      this.spawnChests();
      this.spawnEntities();

      log.notice('The map has been successfully loaded!');

      this.loaded();
      onWorldLoad();
    });
  }

  /**
   * Similar to TTA engine here, but it's loaded upon initialization
   * rather than being called from elsewhere.
   */
  loaded() {
    this.tick();

    if (!config.offlineMode) {
      this.dataParser();
    }

    this.ready = true;
    log.notice('********************************');
  }

  tick() {
    setInterval(() => {
      this.parsePackets();
      this.parseGroups();
    }, 1000 / this.updateTime);
  }

  dataParser() {
    setInterval(() => {
      this.saveAll();
    }, 30000);
  }

  parsePackets() {
    /**
     * This parses through the packet pool and sends them
     */

    for (const id in this.packets) {
      if (this.packets[id].length > 0 && this.packets.hasOwnProperty(id)) {
        const conn = this.socket.getConnection(id);

        if (conn) {
          conn.send(this.packets[id]);
          this.packets[id] = [];
          this.packets[id].id = id;
        } else {
          delete this.socket.getConnection(id);
        }
      }
    }
  }

  parseGroups() {
    if (!this.loadedGroups) {
      return;
    }

    this.map.groups.forEachGroup((groupId) => {
      if (this.groups[groupId].incoming.length < 1) {
        return;
      }

      this.sendSpawns(groupId);

      this.groups[groupId].incoming = [];
    });
  }

  /**
   * Entity related functions
   */

  kill(entity) {
    entity.applyDamage(entity.hitPoints);

    this.pushToAdjacentGroups(
      entity.group,
      new Messages.Points(entity.instance, entity.getHitPoints(), null),
    );
    this.pushToAdjacentGroups(
      entity.group,
      new Messages.Despawn(entity.instance),
    );

    this.handleDeath(entity, true);
  }

  handleDamage(attacker, target, damage) {
    if (!attacker || !target || isNaN(damage) || target.invincible) {
      return;
    }

    if (target.type === 'player' && target.hitCallback) {
      target.hitCallback(attacker, damage);
    }

    // Stop screwing with this - it's so the target retaliates.
    target.hit(attacker);
    target.applyDamage(damage);

    this.pushToAdjacentGroups(
      target.group,
      new Messages.Points(target.instance, target.getHitPoints(), null),
    );

    if (target.getHitPoints() < 1) {
      target.combat.forEachAttacker((opponent) => {
        opponent.removeTarget();

        this.pushToAdjacentGroups(
          target.group,
          new Messages.Combat(Packets.CombatOpcode.Finish, [
            opponent.instance,
            target.instance,
          ]),
        );

        if (opponent.type === 'player' || target.type === 'player') {
          if (opponent.type === 'mob') {
            opponent.addExperience(MobsDictionary.getXp(target.id));
          }

          if (opponent.type === 'player') {
            opponent.killCharacter(target);
          }
        }
      });

      this.pushToAdjacentGroups(
        target.group,
        new Messages.Despawn(target.instance),
      );
      this.handleDeath(target);
    }
  }

  handleDeath(character, ignoreDrops) {
    if (!character) {
      return;
    }

    if (character.type === 'mob') {
      const deathX = character.x;
      const deathY = character.y;

      if (character.deathCallback) {
        character.deathCallback();
      }

      this.removeEntity(character);

      character.dead = true; // eslint-disable-line
      character.destroy();
      character.combat.stop();

      if (!ignoreDrops) {
        const drop = character.getDrop();

        if (drop) this.dropItem(drop.id, drop.count, deathX, deathY);
      }
    } else if (character.type === 'player') character.die();
  }

  createProjectile(info) {
    const attacker = info.shift();
    const target = info.shift();

    if (!attacker || !target) {
      return null;
    }

    const startX = attacker.x;
    const startY = attacker.y;
    const type = attacker.getProjectile();
    let hit = null;

    const projectile = new Projectile(
      type,
      Utils.generateInstance(5, type, startX + startY),
    );

    projectile.setStart(startX, startY);
    projectile.setTarget(target);

    if (attacker.type === 'player') {
      hit = attacker.getHit(target);
    }

    projectile.damage = hit
      ? hit.damage
      : Formulas.getDamage(attacker, target, true);

    projectile.hitType = hit
      ? hit.type
      : Modules.Hits.Damage;

    projectile.owner = attacker;

    this.addProjectile(projectile);

    return projectile;
  }

  /**
   *
   * @param {int} groupId
   */
  sendSpawns(groupId) {
    if (!groupId) {
      return;
    }

    _.each(this.groups[groupId].incoming, (entity) => {
      if (entity.instance === null) {
        return;
      }

      this.pushToGroup(
        groupId,
        new Messages.Spawn(entity),
        entity.isPlayer() ? entity.instance : null,
      );
    });
  }

  loadGroups() {
    this.map.groups.forEachGroup((groupId) => {
      this.groups[groupId] = {
        entities: {},
        players: [],
        incoming: [],
      };
    });

    this.loadedGroups = true;
  }

  getEntityByInstance(instance) {
    if (instance in this.entities) {
      return this.entities[instance];
    }

    return null;
  }

  /**
   * Important functions for sending
   * messages to the player(s)
   */

  pushBroadcast(message) {
    _.each(this.packets, (packet) => {
      packet.push(message.serialize());
    });
  }

  pushSelectively(message, ignores) {
    _.each(this.packets, (packet) => {
      if (ignores.indexOf(packet.id) < 0) {
        packet.push(message.serialize());
      }
    });
  }

  pushToPlayer(player, message) {
    if (player && player.instance in this.packets) {
      this.packets[player.instance].push(message.serialize());
    }
  }

  pushToGroup(id, message, ignoreId) {
    const
      group = this.groups[id];

    if (!group) return;

    _.each(group.players, (playerId) => {
      if (playerId !== ignoreId) {
        this.pushToPlayer(this.getEntityByInstance(playerId), message);
      }
    });
  }

  pushToAdjacentGroups(groupId, message, ignoreId) {
    this.map.groups.forEachAdjacentGroup(groupId, (id) => {
      this.pushToGroup(id, message, ignoreId);
    });
  }

  pushToOldGroups(player, message) {
    _.each(player.recentGroups, (id) => {
      this.pushToGroup(id, message);
    });

    player.recentGroups = []; // eslint-disable-line
  }

  addToGroup(entity, groupId) {
    const
      newGroups = [];

    if (entity && groupId && groupId in this.groups) {
      this.map.groups.forEachAdjacentGroup(groupId, (id) => {
        const group = this.groups[id];

        if (group && group.entities) {
          group.entities[entity.instance] = entity;
          newGroups.push(id);
        }
      });

      entity.group = groupId; // eslint-disable-line

      if (entity instanceof Player) {
        this.groups[groupId].players.push(entity.instance);
      }
    }

    return newGroups;
  }

  removeFromGroups(entity) {
    const oldGroups = [];

    if (entity && entity.group) {
      const group = this.groups[entity.group];

      if (entity instanceof Player) {
        group.players = _.reject(group.players, id => id === entity.instance);
      }

      this.map.groups.forEachAdjacentGroup(entity.group, (id) => {
        if (this.groups[id] && entity.instance in this.groups[id].entities) {
          delete this.groups[id].entities[entity.instance];
          oldGroups.push(id);
        }
      });

      entity.group = null; // eslint-disable-line
    }

    return oldGroups;
  }

  incomingToGroup(entity, groupId) {
    if (!entity || !groupId) {
      return;
    }

    this.map.groups.forEachAdjacentGroup(groupId, (id) => {
      const group = this.groups[id];

      if (group && !_.include(group.entities, entity.instance)) {
        group.incoming.push(entity);
      }
    });
  }

  handleEntityGroup(entity) {
    let groupsChanged = false;

    if (!entity) {
      return groupsChanged;
    }

    const groupId = this.map.groups.groupIdFromPosition(entity.x, entity.y);

    if (!entity.group || (entity.group && entity.group !== groupId)) {
      groupsChanged = true;

      this.incomingToGroup(entity, groupId);

      const oldGroups = this.removeFromGroups(entity);
      const newGroups = this.addToGroup(entity, groupId);

      if (_.size(oldGroups) > 0) {
        entity.recentGroups = _.difference(oldGroups, newGroups); // eslint-disable-line
      }
    }

    return groupsChanged;
  }

  spawnEntities() {
    let entities = 0;

    _.each(this.map.staticEntities, (key, tileIndex) => {
      const isMob = !!this.mobsDictionary.getData(key);
      const isNpc = !!this.npcsDictionary.getData(key);
      const isItem = !!this.itemsDictionary.getData(key);

      const itemData = isItem
        ? this.itemsDictionary.getData(key)
        : null;

      const npcData = isNpc
        ? this.npcsDictionary.getData(key)
        : itemData;

      const info = isMob
        ? this.mobsDictionary.getData(key)
        : npcData;

      const position = this.map.indexToGridPosition(tileIndex);
      position.x += 1;

      if (!info || info === 'null') {
        if (this.debug) {
          log.notice(
            `Unknown object spawned at: ${position.x} ${position.y}`,
          );
        }

        return;
      }

      const typeNpc = isNpc ? 3 : 4;
      const instanceType = isMob ? 2 : typeNpc;

      const instance = Utils.generateInstance(
        instanceType,
        info.id + entities,
        position.x + entities,
        position.y,
      );

      if (isMob) {
        const mob = new Mob(info.id, instance, position.x, position.y);

        mob.static = true;

        mob.onRespawn(() => {
          mob.dead = false;
          mob.refresh();
          this.addMob(mob);
        });

        this.addMob(mob);
      }

      if (isNpc) {
        const npc = new NPC(info.id, instance, position.x, position.y);
        this.addNPC(npc);
      } else if (!isMob && isItem) {
        const item = this.createItem(info.id, instance, position.x, position.y);
        item.static = true;
        this.addItem(item);
      }

      entities += 1;
    });

    log.notice(`Spawned ${entities} entities!`);
  }

  spawnChests() {
    let chests = 0;

    _.each(this.map.chests, (info) => {
      this.spawnChest(info.i, info.x, info.y, true);

      chests += 1;
    });

    log.notice(`Spawned ${chests} static chests`);
  }

  spawnMob(id, x, y) {
    const instance = Utils.generateInstance(2, id, x + id, y);
    const mob = new Mob(id, instance, x, y);

    if (!MobsDictionary.exists(id)) {
      log.notice('Cannot spawn mob', id);
      return null;
    }

    this.addMob(mob);
    return mob;
  }

  spawnChest(items, x, y, staticChest) {
    const chestCount = Object.keys(this.chests).length;
    const instance = Utils.generateInstance(5, 194, chestCount, x, y);
    const chest = new Chest(194, instance, x, y);

    chest.ItemsDictionary = items;

    if (staticChest) {
      chest.static = staticChest;
      chest.onRespawn(this.addChest.bind(this, chest));
    }

    /**
     * Pretty simple concept, detect when the player opens the chest
     * then remove it and drop an item instead. Give it a 25 second
     * cooldown prior to respawning and voila.
     */
    chest.onOpen(() => {
      this.removeChest(chest);
      this.dropItem(ItemsDictionary.stringToId(chest.getItem()), 1, chest.x, chest.y);
    });

    this.addChest(chest);
    return chest;
  }

  createItem(id, instance, x, y) {
    let item;

    if (ItemsDictionary.hasPlugin(id)) {
      item = new (ItemsDictionary.isNewPlugin(id))(id, instance, x, y);
    } else {
      item = new Item(id, instance, x, y);
    }

    return item;
  }

  dropItem(id, count, x, y) {
    const
      instance = Utils.generateInstance(
        4,
        id + Object.keys(this.entities).length,
        x,
        y,
      );

    const item = this.createItem(id, instance, x, y);

    item.count = count;
    item.dropped = true;

    this.addItem(item);
    item.despawn();

    item.onBlink(() => {
      this.pushBroadcast(new Messages.Blink(item.instance));
    });

    item.onDespawn(() => {
      this.removeItem(item);
    });
  }

  pushEntities(player) {
    let entities;

    if (!player || !(player.group in this.groups)) {
      return;
    }

    entities = _.keys(this.groups[player.group].entities);
    entities = _.reject(entities, instance => instance === player.instance);
    entities = _.map(entities, instance => parseInt(instance, 10));

    if (entities) {
      player.send(new Messages.List(entities));
    }
  }

  addEntity(entity) {
    if (entity.instance in this.entities) {
      log.notice(`Entity ${entity.instance} ${entity.type} already exists.`,
        this.entities[entity.instance].id,
        this.entities[entity.instance].type);
      return;
    }

    this.entities[entity.instance] = entity;

    if (entity.type !== 'projectile') {
      this.handleEntityGroup(entity);
    }

    if (entity.x > 0 && entity.y > 0) {
      this.getGrids().addToEntityGrid(entity, entity.x, entity.y);
    }

    entity.onSetPosition(() => {
      this.getGrids().updateEntityPosition(entity);

      if (entity.isMob() && entity.isOutsideSpawn()) {
        entity.removeTarget();
        entity.combat.forget();
        entity.combat.stop();

        entity.return();

        this.pushBroadcast(
          new Messages.Combat(
            Packets.CombatOpcode.Finish,
            null,
            entity.instance,
          ),
        );
        this.pushBroadcast(
          new Messages.Movement(Packets.MovementOpcode.Move, [
            entity.instance,
            entity.x,
            entity.y,
            false,
            false,
          ]),
        );
      }
    });

    if (entity instanceof Character) {
      entity.getCombat().setWorld(this);

      entity.onStunned((stun) => {
        this.pushToAdjacentGroups(
          entity.group,
          new Messages.Movement(Packets.MovementOpcode.Stunned, [
            entity.instance,
            stun,
          ]),
        );
      });
    }
  }

  addPlayer(player) {
    this.addEntity(player);
    this.players[player.instance] = player;

    if (this.populationCallback) this.populationCallback();
  }

  addToPackets(player) {
    this.packets[player.instance] = [];
  }

  addNPC(npc) {
    this.addEntity(npc);
    this.npcsDictionary[npc.instance] = npc;
  }

  addMob(mob) {
    if (!MobsDictionary.exists(mob.id)) {
      log.error(`Cannot spawn mob. ${mob.id} does not exist.`);
      return;
    }

    this.addEntity(mob);
    this.mobsDictionary[mob.instance] = mob;

    mob.addToChestArea(this.getChestAreas());

    mob.onHit((attacker) => {
      if (mob.isDead() || mob.combat.started) return;

      mob.combat.begin(attacker);
    });
  }

  addItem(item) {
    if (item.static) {
      item.onRespawn(this.addItem.bind(this, item));
    }

    this.addEntity(item);
    this.itemsDictionary[item.instance] = item;
  }

  addProjectile(projectile) {
    this.addEntity(projectile);
    this.projectiles[projectile.instance] = projectile;
  }

  addChest(chest) {
    this.addEntity(chest);
    this.chests[chest.instance] = chest;
  }

  removeEntity(entity) {
    if (entity.instance in this.entities) {
      delete this.entities[entity.instance];
    }

    if (entity.instance in this.mobsDictionary) {
      delete this.mobsDictionary[entity.instance];
    }

    if (entity.instance in this.itemsDictionary) {
      delete this.itemsDictionary[entity.instance];
    }

    this.getGrids().removeFromEntityGrid(entity, entity.x, entity.y);
    this.removeFromGroups(entity);
  }

  cleanCombat(entity) {
    entity.combat.stop();

    _.each(this.entities, (oEntity) => {
      if (oEntity instanceof Character && oEntity.combat.hasAttacker(entity)) {
        oEntity.combat.removeAttacker(entity);
      }
    });
  }

  removeItem(item) {
    this.removeEntity(item);
    this.pushBroadcast(new Messages.Despawn(item.instance));

    if (item.static) item.respawn();
  }

  removePlayer(player) {
    this.pushToAdjacentGroups(
      player.group,
      new Messages.Despawn(player.instance),
    );

    if (player.ready) player.save();

    if (this.populationCallback) this.populationCallback();

    this.removeEntity(player);

    this.cleanCombat(player);

    if (player.isGuest) this.database.delete(player);

    delete this.players[player.instance];
    delete this.packets[player.instance];
  }

  removeProjectile(projectile) {
    this.removeEntity(projectile);

    delete this.projectiles[projectile.instance];
  }

  removeChest(chest) {
    this.removeEntity(chest);
    this.pushBroadcast(new Messages.Despawn(chest.instance));

    if (chest.static) chest.respawn();
    else delete this.chests[chest.instance];
  }

  playerInWorld(username) {
    for (const id in this.players) {
      if (this.players.hasOwnProperty(id) && this.players[id].username === username) {
        return true;
      }
    }

    return false;
  }

  getPlayerByName(username) {
    for (const id in this.players) {
      if (this.players.hasOwnProperty(id)) {
        if (this.players[id].username.toLowerCase() === username.toLowerCase()) {
          return this.players[id];
        }
      }
    }

    return null;
  }

  saveAll() {
    _.each(this.players, (player) => {
      player.save();
    });
  }

  getPVPAreas() {
    return this.map.areas.PVP.pvpAreas;
  }

  getMusicAreas() {
    return this.map.areas.Music.musicAreas;
  }

  getChestAreas() {
    return this.map.areas.Chests.chestAreas;
  }

  getGrids() {
    return this.map.grids;
  }

  getPopulation() {
    return _.size(this.players);
  }

  onPlayerConnection(callback) {
    this.playerConnectCallback = callback;
  }

  onPopulationChange(callback) {
    this.populationCallback = callback;
  }
}
