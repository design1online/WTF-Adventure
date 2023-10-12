import log from '../../../../util/log.js';
import Character from '../character.js';
import Incoming from '../../../../controllers/incoming.js';
import Armour from './equipment/armour.js';
import Weapon from './equipment/weapon.js';
import Pendant from './equipment/pendant.js';
import Ring from './equipment/ring.js';
import Boots from './equipment/boots.js';
import ItemsDictionary from '../../../../util/items.js';
import Messages from '../../../../network/messages.js';
import Formulas from '../../../formulas.js';
import Hitpoints from './points/hitpoints.js';
import Mana from './points/mana.js';
import Packets from '../../../../network/packets.js';
import Modules from '../../../../util/modules.js';
import PlayerHandler from './handler.js';
import Quests from '../../../../controllers/quests.js';
import Inventory from './containers/inventory/inventory.js';
import Abilities from './ability/abilities.js';
import Bank from './containers/bank/bank.js';
import config from '../../../../../config.json' assert { type: 'json' };
import Enchant from './enchant/enchant.js';
import Guild from './guild.js';
import Utils from '../../../../util/utils.js';
import Hit from '../combat/hit.js';
import Trade from './trade.js';
import Warp from './warp.js';

export default class Player extends Character {
  constructor(world, database, connection, clientId) {
    super(-1, 'player', connection.id, -1, -1);

    this.world = world;
    this.mysql = database;
    this.connection = connection;

    this.clientId = clientId;

    this.incoming = new Incoming(this);

    this.isNew = false;
    this.ready = false;

    this.moving = false;
    this.potentialPosition = null;
    this.futurePosition = null;

    this.groupPosition = null;
    this.newGroup = false;

    this.disconnectTimeout = null;
    this.timeoutDuration = 1000 * 60 * 10; // 10 minutes

    this.handler = new PlayerHandler(this);

    this.inventory = new Inventory(this, 20);
    this.bank = new Bank(this, 56);
    this.quests = new Quests(this);
    this.abilities = new Abilities(this);
    this.enchant = new Enchant(this);
    this.trade = new Trade(this);
    this.warp = new Warp(this);
    this.itemsDictionary = ItemsDictionary;

    this.introduced = false;
    this.currentSong = null;
    this.acceptedTrade = false;
    this.invincible = false;
    this.noDamage = false;

    this.isGuest = false;

    this.pvp = false;

    this.canTalk = true;

    this.profileDialogOpen = false;
  }

  loadPlayer(data) {
    this.loaded = true;
    this.kind = data.kind;
    this.rights = data.rights;
    this.experience = data.experience;
    this.ban = data.ban;
    this.mute = data.mute;
    this.membership = data.membership;
    this.lastLogin = data.lastLogin;
    this.pvpKills = data.pvpKills;
    this.pvpDeaths = data.pvpDeaths;

    this.warp.setLastWarp(data.lastWarp);

    this.level = Formulas.expToLevel(this.experience);
    this.hitPoints = new Hitpoints(
      data.hitPoints,
      Formulas.getMaxHitPoints(this.level),
    );
    this.mana = new Mana(data.mana, Formulas.getMaxMana(this.level));

    const {
      armour,
      weapon,
      pendant,
      ring,
      boots,
    } = data;

    this.setPosition(data.x, data.y);
    this.setArmour(armour[0], armour[1], armour[2], armour[3]);
    this.setWeapon(weapon[0], weapon[1], weapon[2], weapon[3]);
    this.setPendant(pendant[0], pendant[1], pendant[2], pendant[3]);
    this.setRing(ring[0], ring[1], ring[2], ring[3]);
    this.setBoots(boots[0], boots[1], boots[2], boots[3]);

    this.guild = new Guild(data.guild, this);
  }

  loadInventory() {
    if (config.offlineMode) {
      this.inventory.loadEmpty();
      return;
    }

    this.mysql.loader.getInventory(this, (
      ids,
      counts,
      skills,
      skillLevels,
    ) => {
      if (ids.length !== this.inventory.size) {
        this.save();
      }

      this.inventory.loadInventory(ids, counts, skills, skillLevels);
      this.inventory.check();
    });
  }

  loadBank() {
    if (config.offlineMode) {
      this.bank.loadEmpty();
      return;
    }

    this.mysql.loader.getBank(this, (ids, counts, skills, skillLevels) => {
      if (ids.length !== this.bank.size) {
        this.save();
      }

      this.bank.loadBank(ids, counts, skills, skillLevels);
      this.bank.check();
    });
  }

  loadQuests() {
    if (config.offlineMode) {
      return;
    }

    this.mysql.loader.getQuests(this, (ids, stages) => {
      ids.pop();
      stages.pop();

      if (this.quests.getQuestSize() !== ids.length) {
        log.notice('Mismatch in quest data.');
        this.save();
      }

      this.quests.updateQuests(ids, stages);
    });

    this.mysql.loader.getAchievements(this, (ids, progress) => {
      ids.pop();
      progress.pop();

      if (this.quests.getAchievementSize() !== ids.length) {
        log.notice('Mismatch in achievements data.');

        this.save();
      }

      this.quests.updateAchievements(ids, progress);
    });

    this.quests.onReady(() => {
      this.send(
        new Messages.Quest(Packets.QuestOpcode.Batch, this.quests.getData()),
      );
    });
  }

  intro() {
    if (this.ban > new Date()) {
      this.connection.sendUTF8('ban');
      log.notice('Ban', this.connection, this.username);
      this.connection.close(`Player: ${this.username} is banned.`);
    }

    if (this.x <= 0 || this.y <= 0) {
      this.sendToSpawn();
    }

    if (this.hitPoints.getHitPoints() < 0) {
      this.hitPoints.setHitPoints(this.getMaxHitPoints());
    }

    if (this.mana.getMana() < 0) {
      this.mana.setMana(this.mana.getMaxMana());
    }

    const info = {
      instance: this.instance,
      username: this.username,
      x: this.x,
      y: this.y,
      kind: this.kind,
      rights: this.rights,
      hitPoints: this.hitPoints.getData(),
      mana: this.mana.getData(),
      experience: this.experience,
      level: this.level,
      lastLogin: this.lastLogin,
      pvpKills: this.pvpKills,
      pvpDeaths: this.pvpDeaths,
    };

    this.groupPosition = [this.x, this.y];

    /**
     * Send player data to client here
     */
    this.world.addPlayer(this);

    this.send(new Messages.Welcome(info));
  }

  addExperience(exp) {
    this.experience += exp;

    const oldLevel = this.level;

    this.level = Formulas.expToLevel(this.experience);

    if (oldLevel !== this.level) {
      this.hitPoints.setMaxHitPoints(Formulas.getMaxHitPoints(this.level));
    }

    this.world.pushToAdjacentGroups(
      this.group,
      new Messages.Experience({
        id: this.instance,
        amount: exp,
        experience: this.experience,
        level: this.level,
      }),
    );
  }

  heal(amount) {
    this.hitPoints = this.healHitPoints(amount);
    this.mana = this.healManaPoints(amount);
  }

  healHitPoints(amount) {
    const
      type = 'health';

    if (this.hitPoints && this.hitPoints.points < this.hitPoints.maxPoints) {
      this.hitPoints.heal(amount);

      this.sync();

      this.world.pushToAdjacentGroups(
        this.group,
        new Messages.Heal({
          id: this.instance,
          type,
          amount,
        }),
      );
    }
  }

  healManaPoints(amount) {
    const
      type = 'mana';

    if (this.mana && this.mana.points < this.mana.maxPoints) {
      this.mana.heal(amount);

      this.sync();

      this.world.pushToAdjacentGroups(
        this.group,
        new Messages.Heal({
          id: this.instance,
          type,
          amount,
        }),
      );
    }
  }

  eat(id) {
    if (this.itemsDictionary.hasPlugin(id)) {
      const tempItem = new (this.itemsDictionary.isNewPlugin(id))(id, -1, this.x, this.y);

      tempItem.onUse(this);

      // plugins are responsible for sync and messages to player,
      // or calling player methods that handle that
    }
  }

  equip(string, count, ability, abilityLevel) {
    const data = this.itemsDictionary.getData(string);
    let type;

    if (!data || data === 'null') {
      return;
    }

    if (this.itemsDictionary.isArmour(string)) {
      type = Modules.Equipment.Armour;
    } else if (this.itemsDictionary.isWeapon(string)) {
      type = Modules.Equipment.Weapon;
    } else if (this.itemsDictionary.isPendant(string)) {
      type = Modules.Equipment.Pendant;
    } else if (this.itemsDictionary.isRing(string)) {
      type = Modules.Equipment.Ring;
    } else if (this.itemsDictionary.isBoots(string)) {
      type = Modules.Equipment.Boots;
    }

    const id = this.itemsDictionary.stringToId(string);

    switch (type) {
      default:
        break;
      case Modules.Equipment.Armour:
        if (this.hasArmour() && this.armour.id !== 114) this.inventory.add(this.armour.getItem());

        this.setArmour(id, count, ability, abilityLevel);
        break;

      case Modules.Equipment.Weapon:
        if (this.hasWeapon()) this.inventory.add(this.weapon.getItem());

        this.setWeapon(id, count, ability, abilityLevel);
        break;

      case Modules.Equipment.Pendant:
        if (this.hasPendant()) this.inventory.add(this.pendant.getItem());

        this.setPendant(id, count, ability, abilityLevel);
        break;

      case Modules.Equipment.Ring:
        if (this.hasRing()) this.inventory.add(this.ring.getItem());

        this.setRing(id, count, ability, abilityLevel);
        break;

      case Modules.Equipment.Boots:
        if (this.hasBoots()) this.inventory.add(this.boots.getItem());

        this.setBoots(id, count, ability, abilityLevel);
        break;
    }

    this.send(
      new Messages.Equipment(Packets.EquipmentOpcode.Equip, [
        type,
        this.itemsDictionary.idToName(id),
        string,
        count,
        ability,
        abilityLevel,
      ]),
    );

    this.sync();
  }

  canEquip(string) {
    const
      requirement = this.itemsDictionary.getLevelRequirement(string);

    if (requirement > this.level) {
      this.notify(
        `You must be at least level ${requirement} to equip this.`,
      );
      return false;
    }

    return true;
  }

  die() {
    this.dead = true;

    if (this.deathCallback) this.deathCallback();

    this.send(new Messages.Death(this.instance));
  }

  teleport(x, y, isDoor, animate) {
    // @TODO fix tutorial
    // if (isDoor && !this.finishedTutorial()) {
    //   if (this.doorCallback) {
    //     this.doorCallback(x, y);
    //   }
    //   return;
    // }

    this.world.pushToAdjacentGroups(
      this.group,
      new Messages.Teleport(this.instance, x, y, animate),
    );

    this.setPosition(x, y);
    this.checkGroups();

    this.world.cleanCombat(this);
  }

  updatePVP(pvp) {
    /**
     * No need to update if the state is the same
     */

    if (this.pvp === pvp) return;

    if (this.pvp && !pvp) this.notify('You are no longer in a PvP zone!');
    else this.notify('You have entered a PvP zone!');

    this.pvp = pvp;

    this.sendToGroup(new Messages.PVP(this.instance, this.pvp));
  }

  updateMusic(song) {
    this.currentSong = song;

    this.send(new Messages.Audio(song));
  }

  revertPoints() {
    this.hitPoints.setHitPoints(this.hitPoints.getMaxHitPoints());
    this.mana.setMana(this.mana.getMaxMana());

    this.sync();
  }

  applyDamage(damage) {
    this.hitPoints.decrement(damage);
  }

  toggleProfile(state) {
    this.profileDialogOpen = state;

    if (this.profileToggleCallback) this.profileToggleCallback();
  }

  getMana() {
    return this.mana.getMana();
  }

  getMaxMana() {
    return this.mana.getMaxMana();
  }

  getHitPoints() {
    return this.hitPoints.getHitPoints();
  }

  getMaxHitPoints() {
    return this.hitPoints.getMaxHitPoints();
  }

  getTutorial() {
    return this.quests.getQuest(Modules.Quests.Introduction);
  }

  /**
   * Setters
   */

  setArmour(id, count, ability, abilityLevel) {
    if (!id) return;

    this.armour = new Armour(
      this.itemsDictionary.idToString(id),
      id,
      count,
      ability,
      abilityLevel,
    );
  }

  breakWeapon() {
    this.notify('Your weapon has been broken.');

    this.setWeapon(-1, 0, 0, 0);

    this.sendEquipment();
  }

  setWeapon(id, count, ability, abilityLevel) {
    if (!id) return;

    this.weapon = new Weapon(
      this.itemsDictionary.idToString(id),
      id,
      count,
      ability,
      abilityLevel,
    );

    if (this.weapon.ranged) this.attackRange = 7;
  }

  setPendant(id, count, ability, abilityLevel) {
    if (!id) return;

    this.pendant = new Pendant(
      this.itemsDictionary.idToString(id),
      id,
      count,
      ability,
      abilityLevel,
    );
  }

  setRing(id, count, ability, abilityLevel) {
    if (!id) return;

    this.ring = new Ring(
      this.itemsDictionary.idToString(id),
      id,
      count,
      ability,
      abilityLevel,
    );
  }

  setBoots(id, count, ability, abilityLevel) {
    if (!id) {
      return;
    }

    this.boots = new Boots(
      this.itemsDictionary.idToString(id),
      id,
      count,
      ability,
      abilityLevel,
    );
  }

  guessPosition(x, y) {
    this.potentialPosition = {
      x,
      y,
    };
  }

  setPosition(x, y) {
    if (this.dead) {
      return;
    }

    super.setPosition(x, y);

    this.world.pushToAdjacentGroups(
      this.group,
      new Messages.Movement(Packets.MovementOpcode.Move, [
        this.instance,
        x,
        y,
        false,
        false,
      ]),
      this.instance,
    );
  }

  setFuturePosition(x, y) {
    /**
     * Most likely will be used for anti-cheating methods
     * of calculating the actual time and duration for the
     * displacement.
     */

    this.futurePosition = {
      x,
      y,
    };
  }

  timeout() {
    this.connection.sendUTF8('timeout');
    log.notice('timeout', this.connection);
    this.connection.close(`${this.username} timed out.`);
  }

  invalidLogin() {
    this.connection.sendUTF8('invalidlogin');
    log.notice('connection', this.connection);
    this.connection.close(`${this.username} invalid login.`);
  }

  refreshTimeout() {
    clearTimeout(this.disconnectTimeout);

    this.disconnectTimeout = setTimeout(() => {
      this.timeout();
    }, this.timeoutDuration);
  }

  /**
   * Getters
   */

  hasArmour() {
    return this.armour && this.armour.name !== 'null' && this.armour.id !== -1;
  }

  hasWeapon() {
    return this.weapon && this.weapon.name !== 'null' && this.weapon.id !== -1;
  }

  hasBreakableWeapon() {
    return this.weapon && this.weapon.breakable;
  }

  hasPendant() {
    return (
      this.pendant && this.pendant.name !== 'null' && this.pendant.id !== -1
    );
  }

  hasRing() {
    return this.ring && this.ring.name !== 'null' && this.ring.id !== -1;
  }

  hasBoots() {
    return this.boots && this.boots.name !== 'null' && this.boots.id !== -1;
  }

  hasMaxHitPoints() {
    return this.getHitPoints() >= this.hitPoints.getMaxHitPoints();
  }

  hasMaxMana() {
    return this.mana.getMana() >= this.mana.getMaxMana();
  }

  hasSpecialAttack() {
    return (
      this.weapon
      && (this.weapon.hasCritical()
        || this.weapon.hasExplosive()
        || this.weapon.hasStun())
    );
  }

  canBeStunned() {
    return true;
  }

  getState() {
    return {
      type: this.type,
      id: this.instance,
      name: this.username,
      x: this.x,
      y: this.y,
      rights: this.rights,
      level: this.level,
      pvp: this.pvp,
      pvpKills: this.pvpKills,
      pvpDeaths: this.pvpDeaths,
      hitPoints: this.hitPoints.getData(),
      mana: this.mana.getData(),
      armour: this.armour.getData(),
      weapon: this.weapon.getData(),
      pendant: this.pendant.getData(),
      ring: this.ring.getData(),
      boots: this.boots.getData(),
    };
  }

  getRemoteAddress() {
    return this.connection.socket.conn.remoteAddress;
  }

  getSpawn() {
    let
      position;

    /**
     * Here we will implement functions from quests and
     * other special events and determine a spawn point.
     */

    if (this.getTutorial().isFinished()) {
      position = {
        x: 325,
        y: 86,
      };
    } else {
      position = {
        x: 17,
        y: 555,
      };
    }

    return position;
  }

  getHit(target) {
    const defaultDamage = Formulas.getDamage(this, target);
    const isSpecial = 100 - this.weapon.abilityLevel < Utils.randomInt(0, 100);

    if (!this.hasSpecialAttack() || !isSpecial) {
      return new Hit(Modules.Hits.Damage, defaultDamage);
    }

    switch (this.weapon.ability) {
      default:
        break;
      case Modules.Enchantment.Critical:
        /**
         * Still experimental, not sure how likely it is that you're
         * gonna do a critical strike. I just do not want it getting
         * out of hand, it's easier to buff than to nerf..
         */

        const multiplier = 1.0 + this.weapon.abilityLevel; // eslint-disable-line
        const damage = defaultDamage * multiplier; // eslint-disable-line

        return new Hit(Modules.Hits.Critical, damage);

      case Modules.Enchantment.Stun:
        return new Hit(Modules.Hits.Stun, defaultDamage);

      case Modules.Enchantment.Explosive:
        return new Hit(Modules.Hits.Explosive, defaultDamage);
    }

    return null;
  }

  isMuted() {
    const
      time = new Date().getTime();

    return this.mute - time > 0;
  }

  isRanged() {
    return this.weapon && this.weapon.isRanged();
  }

  isDead() {
    return this.getHitPoints() < 1 || this.dead;
  }

  /**
   * Miscellaneous
   */

  send(message) {
    this.world.pushToPlayer(this, message);
  }

  sendToGroup(message) {
    this.world.pushToGroup(this.group, message);
  }

  sendEquipment() {
    const
      info = [
        this.armour.getData(),
        this.weapon.getData(),
        this.pendant.getData(),
        this.ring.getData(),
        this.boots.getData(),
      ];

    this.send(new Messages.Equipment(Packets.EquipmentOpcode.Batch, info));
  }

  sendToSpawn() {
    const
      position = this.getSpawn();

    this.x = position.x;
    this.y = position.y;
  }

  sync(all) {
    /**
     * Function to be used for syncing up health,
     * mana, exp, and other variables
     */

    if (!this.hitPoints || !this.mana) return;

    const info = {
      id: this.instance,
      hitPoints: this.getHitPoints(),
      maxHitPoints: this.getMaxHitPoints(),
      mana: this.mana.getMana(),
      maxMana: this.mana.getMaxMana(),
      experience: this.experience,
      level: this.level,
      armour: this.armour.getName(),
      weapon: this.weapon.getData(),
    };

    this.world.pushToAdjacentGroups(
      this.group,
      new Messages.Sync(info),
      all ? null : this.instance,
    );

    this.save();
  }

  notify(message) {
    if (!message) return;

    this.send(
      new Messages.Notification(Packets.NotificationOpcode.Text, message),
    );
  }

  stopMovement(force) {
    /**
     * Forcefully stopping the player will simply hault
     * them in between tiles. Should only be used if they are
     * being transported elsewhere.
     */


    this.send(new Messages.Movement(Packets.MovementOpcode.Stop, force));
  }

  finishedTutorial() {
    if (!this.quests) return true;

    return this.getTutorial().isFinished();
  }

  checkGroups() {
    if (!this.groupPosition) return;

    const diffX = Math.abs(this.groupPosition[0] - this.x);


    const diffY = Math.abs(this.groupPosition[1] - this.y);

    if (diffX >= 10 || diffY >= 10) {
      this.groupPosition = [this.x, this.y];

      if (this.groupCallback) this.groupCallback();
    }
  }

  movePlayer() {
    /**
     * Server-sided callbacks towards movement should
     * not be able to be overwritten. In the case that
     * this is used (for Quests most likely) the server must
     * check that no hacker removed the constraint in the client-side.
     * If they are not within the bounds, apply the according punishment.
     */

    this.send(new Messages.Movement(Packets.MovementOpcode.Started));
  }

  walkRandomly() {
    setInterval(() => {
      this.setPosition(
        this.x + Utils.randomInt(-5, 5),
        this.y + Utils.randomInt(-5, 5),
      );
    }, 2000);
  }

  killCharacter(character) {
    if (this.killCallback) this.killCallback(character);
  }

  save() {
    if (config.offlineMode || this.isGuest) return;

    this.mysql.creator.save(this);
  }

  inTutorial() {
    return this.world.map.inTutorialArea(this);
  }

  onGroup(callback) {
    this.groupCallback = callback;
  }

  onAttack(callback) {
    this.attackCallback = callback;
  }

  onHit(callback) {
    this.hitCallback = callback;
  }

  onKill(callback) {
    this.killCallback = callback;
  }

  onDeath(callback) {
    this.deathCallback = callback;
  }

  onTalkToNPC(callback) {
    this.npcTalkCallback = callback;
  }

  onDoor(callback) {
    this.doorCallback = callback;
  }

  onProfile(callback) {
    this.profileToggleCallback = callback;
  }

  onReady(callback) {
    this.readyCallback = callback;
  }
}
