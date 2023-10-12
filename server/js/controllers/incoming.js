import Request from 'request';
import _ from 'underscore';
import sanitizer from 'sanitizer';
import log from '../util/log.js';
import Packets from '../network/packets.js';
import config from '../../config.json' assert { type: 'json' };
import Creator from '../database/creator.js';
import Messages from '../network/messages.js';
import Commands from './commands.js';
import Items from '../util/items.js';
import Utils from '../util/utils.js';

export default class Incoming {
  constructor(player) {
    this.player = player;
    this.connection = this.player.connection;
    this.world = this.player.world;
    this.mysql = this.player.mysql;
    this.commands = new Commands(this.player);

    this.connection.listen((data) => {
      const packet = data.shift();
      const message = data[0];

      if (!Utils.validPacket(packet)) {
        log.error(`Non-existent packet received: ${packet} data: `);
        log.error(message);

        return;
      }

      this.player.refreshTimeout();

      switch (packet) {
        default:
          break;
        case Packets.Intro:
          this.handleIntro(message);
          break;

        case Packets.Ready:
          this.handleReady(message);
          break;

        case Packets.Who:
          this.handleWho(message);
          break;

        case Packets.Equipment:
          this.handleEquipment(message);
          break;

        case Packets.Movement:
          this.handleMovement(message);
          break;

        case Packets.Request:
          this.handleRequest(message);
          break;

        case Packets.Target:
          console.log('RECIEVED TARGET PACKET', message);
          this.handleTarget(message);
          break;

        case Packets.Combat:
          this.handleCombat(message);
          break;

        case Packets.Projectile:
          this.handleProjectile(message);
          break;

        case Packets.Network:
          this.handleNetwork(message);
          break;

        case Packets.Chat:
          this.handleChat(message);
          break;

        case Packets.Inventory:
          this.handleInventory(message);
          break;

        case Packets.Bank:
          this.handleBank(message);
          break;

        case Packets.Respawn:
          this.handleRespawn(message);
          break;

        case Packets.Trade:
          this.handleTrade(message);
          break;

        case Packets.Enchant:
          this.handleEnchant(message);
          break;

        case Packets.Click:
          this.handleClick(message);
          break;

        case Packets.Warp:
          this.handleWarp(message);
          break;
      }
    });
  }

  handleIntro(message) {
    log.notice(`incoming message: ${message.toString()}`);
    const loginType = message.shift();
    const username = message.shift().toLowerCase();
    const password = message.shift();
    const isRegistering = loginType === Packets.IntroOpcode.Register;
    const isGuest = loginType === Packets.IntroOpcode.Guest;
    const email = isRegistering ? message.shift() : '';
    const formattedUsername = username
      ? username.charAt(0).toUpperCase() + username.slice(1)
      : '';

    this.player.username = formattedUsername.substr(0, 32).trim();
    this.player.password = password.substr(0, 32).trim();
    this.player.email = email.substr(0, 128).trim();

    if (this.introduced) return;

    if (this.world.playerInWorld(this.player.username)) {
      this.connection.sendUTF8('loggedin');
      this.connection.close('Player already logged in..');
      return;
    }

    if (config.overrideAuth) {
      this.mysql.login(this.player);
      return;
    }

    if (config.offlineMode) {
      const creator = new Creator(null);

      this.player.isNew = true;
      this.player.load(creator.getPlayerData(this.player));
      this.player.isNew = false;
      this.player.intro();

      return;
    }

    this.introduced = true;

    if (isRegistering) {
      log.notice('is registering');
      const registerOptions = {
        method: 'GET',
        uri: `${'https://taptapadventure.com/api/register.php?a='
          + '9a4c5ddb-5ce6-4a01-a14f-3ae49d8c6507'
          + '&u='}${
          this.player.username
        }&p=${
          this.player.password
        }&e=${
          this.player.email}`,
      };

      Request(registerOptions, (error, response, body) => {
        try {
          const data = JSON.parse(JSON.parse(body).data);

          switch (data.code) {
            case 'ok':
              this.mysql.register(this.player);
              break;

            case 'internal-server-error': // email
              this.connection.sendUTF8('emailexists');
              this.connection.close('Email not available.');
              break;

            case 'not-authorised': // username
              this.connection.sendUTF8('userexists');
              this.connection.close('Username not available.');
              break;

            default:
              this.connection.sendUTF8('error');
              this.connection.close(`Unknown API Response: ${error}`);
              break;
          }
        } catch (e) {
          log.notice('Could not decipher API message');

          this.connection.sendUTF8('disallowed');
          this.connection.close('API response is malformed!');
        }
      });
    } else if (isGuest) {
      this.player.username = `Guest${Utils.randomInt(0, 2000000)}`;
      this.player.password = null;
      this.player.email = null;
      this.player.isGuest = true;

      this.mysql.login(this.player);
    } else {
      log.notice('validating login');
      this.connection.sendUTF8('validatingLogin');
      this.mysql.login(this.player);
    }
  }

  handleReady(message) {
    const isReady = message.shift();

    if (!isReady) return;

    this.player.ready = true;

    this.world.handleEntityGroup(this.player);
    this.world.pushEntities(this.player);

    this.player.sendEquipment();
    this.player.loadInventory();
    this.player.loadBank();
    this.player.loadQuests();

    this.player.handler.detectMusic();

    if (this.player.readyCallback) this.player.readyCallback();
  }

  handleWho(message) {
    _.each(message.shift(), (id) => {
      const entity = this.world.getEntityByInstance(id);

      if (entity && entity.id) this.player.send(new Messages.Spawn(entity));
    });
  }

  handleEquipment(message) {
    const opcode = message.shift();

    switch (opcode) {
      default:
        break;
      case Packets.EquipmentOpcode.Unequip:
        const type = message.shift(); // eslint-disable-line

        if (!this.player.inventory.hasSpace()) {
          this.player.send(
            new Messages.Notification(
              Packets.NotificationOpcode.Text,
              'You do not have enough space in your inventory.',
            ),
          );
          return;
        }

        switch (type) {
          default:
            break;
          case 'weapon':
            if (!this.player.hasWeapon()) return;

            this.player.inventory.add(this.player.weapon.getItem());
            this.player.setWeapon(-1, -1, -1, -1);

            break;

          case 'armour':
            if (this.player.hasArmour() && this.player.armour.id === 114) return;

            this.player.inventory.add(this.player.armour.getItem());
            this.player.setArmour(114, 1, -1, -1);

            break;

          case 'pendant':
            if (!this.player.hasPendant()) return;

            this.player.inventory.add(this.player.pendant.getItem());
            this.player.setPendant(-1, -1, -1, -1);

            break;

          case 'ring':
            if (!this.player.hasRing()) return;

            this.player.inventory.add(this.player.ring.getItem());
            this.player.setRing(-1, -1, -1, -1);

            break;

          case 'boots':
            if (!this.player.hasBoots()) return;

            this.player.inventory.add(this.player.boots.getItem());
            this.player.setBoots(-1, -1, -1, -1);

            break;
        }

        this.player.send(
          new Messages.Equipment(Packets.EquipmentOpcode.Unequip, [type]),
        );
        this.player.sync();

        break;
    }
  }

  handleMovement(message) {
    const opcode = message.shift();

    if (!this.player || this.player.dead) return;

    switch (opcode) {
      default:
        break;
      case Packets.MovementOpcode.Request:
        const requestX = message.shift(); // eslint-disable-line
        const requestY = message.shift(); // eslint-disable-line
        const playerX = message.shift(); // eslint-disable-line
        const playerY = message.shift(); // eslint-disable-line

        if (playerX !== this.player.x || playerY !== this.player.y) return;

        this.player.guessPosition(requestX, requestY);

        break;

      case Packets.Movement.Started:
        const selectedX = message.shift(); // eslint-disable-line
        const selectedY = message.shift(); // eslint-disable-line
        const pX = message.shift(); // eslint-disable-line
        const pY = message.shift(); // eslint-disable-line

        if (pX !== this.player.x || pY !== this.player.y || this.player.stunned) return;

        this.player.moving = true;

        break;

      case Packets.MovementOpcode.Step:
        const x = message.shift(); // eslint-disable-line
        const y = message.shift(); // eslint-disable-line

        if (this.player.stunned) return;

        this.player.setPosition(x, y);

        break;

      case Packets.MovementOpcode.Stop:
        const posX = message.shift(); // eslint-disable-line
        const posY = message.shift(); // eslint-disable-line
        const id = message.shift(); // eslint-disable-line
        const hasTarget = message.shift(); // eslint-disable-line
        const entity = this.world.getEntityByInstance(id); // eslint-disable-line

        if (entity && entity.type === 'item' && !hasTarget) this.player.inventory.add(entity);

        if (this.world.map.isDoor(posX, posY) && !hasTarget) {
          const destination = this.world.map.getDoorDestination(posX, posY); // eslint-disable-line

          this.player.teleport(destination.x, destination.y, true);
        } else this.player.setPosition(posX, posY);

        this.player.moving = false;
        this.player.lastMovement = new Date().getTime();

        break;

      case Packets.MovementOpcode.Entity:
        const instance = message.shift(); // eslint-disable-line
        const entityX = message.shift(); // eslint-disable-line
        const entityY = message.shift(); // eslint-disable-line
        const oEntity = this.world.getEntityByInstance(instance); // eslint-disable-line

        if (!oEntity || (oEntity.x === entityX && oEntity.y === entityY)) return;

        oEntity.setPosition(entityX, entityY);

        if (oEntity.hasTarget()) oEntity.combat.forceAttack();

        break;
    }
  }

  handleRequest(message) {
    const id = message.shift();

    if (id !== this.player.instance) return;

    this.world.pushEntities(this.player);
  }

  handleTarget(message) {
    const opcode = message.shift();
    const instance = message.shift();

    log.notice(`canvas Targeted: ${instance}`);

    switch (opcode) {
      default:
        break;
      case Packets.TargetOpcode.Talk:
        const entity = this.world.getEntityByInstance(instance); // eslint-disable-line

        if (!entity) return;

        if (entity.type === 'chest') {
          entity.openChest();
          return;
        }

        if (entity.dead) return;

        if (this.player.npcTalkCallback) this.player.npcTalkCallback(entity);

        break;

      case Packets.TargetOpcode.Attack:
        const target = this.world.getEntityByInstance(instance); // eslint-disable-line

        if (!target || target.dead || !this.canAttack(this.player, target)) return;

        this.world.pushToAdjacentGroups(
          target.group,
          new Messages.Combat(
            Packets.CombatOpcode.Initiate,
            this.player.instance,
            target.instance,
          ),
        );

        break;

      case Packets.TargetOpcode.None:
        this.player.combat.stop();
        this.player.removeTarget();

        break;
    }
  }

  handleCombat(message) {
    const opcode = message.shift();

    switch (opcode) {
      default:
        break;
      case Packets.CombatOpcode.Initiate:
        const attacker = this.world.getEntityByInstance(message.shift()); // eslint-disable-line
        const target = this.world.getEntityByInstance(message.shift()); // eslint-disable-line

        if (
          !target
          || target.dead
          || !attacker
          || attacker.dead
          || !this.canAttack(attacker, target)
        ) return;

        attacker.setTarget(target);

        if (!attacker.combat.started) {
          attacker.combat.forceAttack();
        } else {
          attacker.combat.start();
          attacker.combat.attack(target);
        }

        if (target.combat) target.combat.addAttacker(attacker);

        break;
    }
  }

  handleProjectile(message) {
    const type = message.shift();

    switch (type) {
      default:
        break;
      case Packets.ProjectileOpcode.Impact:
        const projectile = this.world.getEntityByInstance(message.shift()); // eslint-disable-line
        const target = this.world.getEntityByInstance(message.shift()); // eslint-disable-line

        if (!target || target.dead || !projectile) return;

        this.world.handleDamage(projectile.owner, target, projectile.damage);
        this.world.removeProjectile(projectile);

        if (target.combat.started || target.dead || target.type !== 'mob') return;

        target.begin(projectile.owner);

        break;
    }
  }

  handleNetwork(message) {
    const opcode = message.shift();

    switch (opcode) {
      default:
        break;
      case Packets.NetworkOpcode.Pong:
        log.notice('Pingy pongy pong pong.');
        break;
    }
  }

  handleChat(message) {
    const text = sanitizer.escape(sanitizer.sanitize(message.shift()));

    if (!text || text.length < 1 || !/\S/.test(text)) return;

    if (text.charAt(0) === '/' || text.charAt(0) === ';') this.commands.parse(text);
    else {
      if (this.player.isMuted()) {
        this.player.send(
          new Messages.Notification(
            Packets.NotificationOpcode.Text,
            'You are currently muted.',
          ),
        );
        return;
      }

      if (!this.player.canTalk) {
        this.player.send(
          new Messages.Notification(
            Packets.NotificationOpcode.Text,
            'You are not allowed to talk for the duration of this event.',
          ),
        );
        return;
      }

      this.world.pushToGroup(
        this.player.group,
        new Messages.Chat({
          id: this.player.instance,
          name: this.player.username,
          withBubble: true,
          text,
          duration: 7000,
        }),
      );
    }
  }

  handleInventory(message) {
    const opcode = message.shift();
    let id = null;

    switch (opcode) {
      default:
        break;
      case Packets.InventoryOpcode.Remove:
        const item = message.shift(); // eslint-disable-line
        let count = null; // eslint-disable-line

        if (!item) return;

        if (item.count > 1) {
          count = message.shift();
        }

        id = Items.stringToId(item.string); // eslint-disable-line
        const iSlot = this.player.inventory.slots[item.index]; // eslint-disable-line

        if (count > iSlot.count) {
          count = iSlot.count;
        }

        this.player.inventory.remove(
          id,
          count || item.count,
          item.index,
        );

        this.world.dropItem(id, count, this.player.x, this.player.y);

        break;

      case Packets.InventoryOpcode.Select:
        const index = message.shift(); // eslint-disable-line
        const slot = this.player.inventory.slots[index]; // eslint-disable-line
        const string = slot.string; // eslint-disable-line
        const sCount = slot.count; // eslint-disable-line
        const ability = slot.ability; // eslint-disable-line
        const abilityLevel = slot.abilityLevel; // eslint-disable-line

        if (!slot) return;

        id = Items.stringToId(slot.string);

        if (slot.equippable) {
          if (!this.player.canEquip(string)) return;

          this.player.inventory.remove(id, slot.count, slot.index);

          this.player.equip(string, sCount, ability, abilityLevel);
        } else if (slot.edible) {
          this.player.inventory.remove(id, 1, slot.index);

          this.player.eat(id);
        }

        break;
    }
  }

  handleBank(message) {
    const opcode = message.shift();

    switch (opcode) {
      default:
        break;
      case Packets.BankOpcode.Select:
        const type = message.shift(); // eslint-disable-line
        const index = message.shift(); // eslint-disable-line
        const isBank = type === 'bank'; // eslint-disable-line

        if (isBank) {
          const bankSlot = this.player.bank.slots[index]; // eslint-disable-line

          // Infinite stacks move all at onces, otherwise move one by one.
          const moveAmount = Items.maxStackSize(bankSlot.id) === -1 ? bankSlot.count : 1;

          if (this.player.inventory.add(bankSlot, moveAmount)) {
            this.player.bank.remove(bankSlot.id, moveAmount, index);
          }
        } else {
          const inventorySlot = this.player.inventory.slots[index];

          if (
            this.player.bank.add(
              inventorySlot.id,
              inventorySlot.count,
              inventorySlot.ability,
              inventorySlot.abilityLevel,
            )
          ) {
            this.player.inventory.remove(
              inventorySlot.id,
              inventorySlot.count,
              index,
            );
          }
        }

        break;
    }
  }

  handleRespawn(message) {
    const instance = message.shift();

    if (this.player.instance !== instance) return;

    const spawn = this.player.getSpawn();

    this.player.dead = false;
    this.player.setPosition(spawn.x, spawn.y);

    this.world.pushToAdjacentGroups(
      this.player.group,
      new Messages.Spawn(this.player),
      this.player.instance,
    );
    this.player.send(
      new Messages.Respawn(this.player.instance, this.player.x, this.player.y),
    );

    this.player.revertPoints();
  }

  handleTrade(message) {
    const opcode = message.shift();
    const oPlayer = this.world.getEntityByInstance(message.shift());

    if (!oPlayer || !opcode) return;

    switch (opcode) {
      default:
        break;
      case Packets.TradeOpcode.Request:
        break;

      case Packets.TradeOpcode.Accept:
        break;

      case Packets.TradeOpcode.Decline:
        break;
    }
  }

  handleEnchant(message) {
    const opcode = message.shift();

    switch (opcode) {
      default:
        break;
      case Packets.EnchantOpcode.Select:
        const index = message.shift(); // eslint-disable-line
        const item = this.player.inventory.slots[index]; // eslint-disable-line
        let type = 'item'; // eslint-disable-line

        if (Items.isShard(item.id)) {
          type = 'shards';
        }

        this.player.enchant.add(type, item);

        break;

      case Packets.EnchantOpcode.Remove:
        this.player.enchant.remove(message.shift());

        break;

      case Packets.EnchantOpcode.Enchant:
        this.player.enchant.enchant();

        break;
    }
  }

  handleClick(message) {
    const type = message.shift(); // eslint-disable-line
    const isOpen = message.shift(); // eslint-disable-line

    switch (type) {
      default:
        break;
      case 'profile':
        if (this.player.profileToggleCallback) {
          this.player.profileToggleCallback(isOpen);
        }

        break;
    }
  }

  handleWarp(message) {
    const id = parseInt(message.shift(), 10) - 1;

    if (this.player.warp) {
      this.player.warp.warp(id);
    }
  }

  /**
   * Used to prevent client-sided manipulation. The client will send the packet to start combat
   * but if it was modified by a presumed hacker, it will simply cease when it arrives to this
   * condition.
   */
  canAttack(attacker, target) {
    if (attacker.type === 'mob' || target.type === 'mob') {
      return true;
    }

    return (
      attacker.type === 'player'
      && target.type === 'player'
      && attacker.pvp
      && target.pvp
    );
  }
}
