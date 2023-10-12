import Character from '../character';
import Armour from './equipment/armour';
import Weapon from './equipment/weapon';
import Pendant from './equipment/pendant';
import Boots from './equipment/boots';
import Ring from './equipment/ring';
import Module from '../../../utils/modules';

/**
 * A member's playable {@link Character} in the game
 * @class
 */
export default class Player extends Character {
  /**
   * Default constructor
   */
  constructor() {
    super(-1, Module.Types.Player);

    /**
     * Player's username
     * @type {String}
     */
    this.username = '';

    /**
     * Player's password
     * @type {String}
     */
    this.password = '';

    /**
     * Player's email
     * @type {String}
     */
    this.email = '';

    /**
     * Player's avatar
     * @type {[type]}
     */
    this.avatar = null;

    /**
     * Player = 0, moderator = 1, or admin >= 2
     * @type {Number}
     */
    this.rights = 0;

    /**
     * Not sure what this is.... changes player name label text to red
     * @type {Boolean}
     */
    this.wanted = false;

    /**
     * How many experience the player has
     * @type {Number}
     */
    this.experience = -1;

    /**
     * Level of the player
     * @type {Number}
     */
    this.level = -1;

    /**
     * How many PVP kills they've had
     * @type {Number}
     */
    this.pvpKills = -1;

    /**
     * How many PVP death's they've had
     * @type {Number}
     */
    this.pvpDeaths = -1;

    /**
     * Current health points
     * @type {Number}
     */
    this.hitPoints = -1;

    /**
     * Maximum health points
     * @type {Number}
     */
    this.maxHitPoints = -1;

    /**
     * Current magic points
     * @type {Number}
     */
    this.mana = -1;

    /**
     * Maximum magic points
     * @type {Number}
     */
    this.maxMana = -1;

    /**
     * Previous grid X position
     * @type {Number}
     */
    this.prevX = 0;

    /**
     * Previous grid Y position
     * @type {Number}
     */
    this.prevY = 0;

    /**
     * Direction they are facing
     * @type {Number}
     */
    this.direction = null;

    /**
     * Player that is currently attacking them
     * @type {Boolean|Entity}
     */
    this.pvp = false;

    /**
     * Keyboard moving left
     * @type {Boolean}
     */
    this.moveLeft = false;

    /**
     * Keyboard moving right
     * @type {Boolean}
     */
    this.moveRight = false;

    /**
     * Keyboard moving up
     * @type {Boolean}
     */
    this.moveUp = false;

    /**
     * Keyboard moving down
     * @type {Boolean}
     */
    this.moveDown = false;

    /**
     * The player's ID number
     * @type {Number}
     */
    this.id = null;

    /**
     * The player's name??? not sure
     * @TODO look into this one...
     * @type {[type]}
     */
    this.name = null;

    /**
     * The player's last login
     * @type {String}
     */
    this.lastLogin = null;

    /**
     * The type of entity this is
     * @type {String}
     */
    this.type = 'player';

    /**
     * The player's armor
     * @type {Armour}
     */
    this.armour = null;

    /**
     * The player's weapon
     * @type {Weapon}
     */
    this.weapon = null;

    /**
     * The player's pendant
     * @type {Pendant}
     */
    this.pendant = null;

    /**
     * The player's ring
     * @type {Ring}
     */
    this.ring = null;

    /**
     * The player's boots
     * @type {Boots}
     */
    this.boots = null;

    /**
     * Are their actions disabled
     * @type {Boolean}
     */
    this.disableAction = false;

    /**
     * Timeout for temporary blinking
     * @type {Function}
     */
    this.tempBlinkTimeout = null;

    /**
     * Callback for armor updates
     * @type {Function}
     */
    this.updateArmourCallback = null;

    // load all of their equipment
    this.loadEquipment();
  }

  /**
   * Load equipment for this player given the data response from the server
   * @param {Object} data player equipment and info from the server
   * @param {Number} data.instance ID of the player
   * @param {Number} data.x grid X position
   * @param {Number} data.y grid Y position
   * @param {Number} data.hitPoints current hit points
   * @param {Number} data.mana current mana points
   * @param {String} data.username the name of the player
   * @param {Number} data.experience the player experience points
   * @param {Number} data.level the player's level
   * @param {String} data.lastLogin the last login date
   * @param {Number} data.pvpKills the total pvp kills
   * @param {Number} data.pvpDeaths the total pvp deaths
   */
  loadPlayer(data) {
    this.setId(data.instance);
    this.setGridPosition(data.x, data.y);
    this.setPointsData(data.hitPoints, data.mana);

    this.username = data.username;
    this.experience = data.experience;
    this.level = data.level;
    this.lastLogin = data.lastLogin;
    this.pvpKills = data.pvpKills;
    this.pvpDeaths = data.pvpDeaths;
  }

  /**
   * This is for other player characters
   * @param {Game} game an instance of the game
   */
  loadHandler(game) {
    this.handler.setGame(game);
    this.handler.loadEntity();
  }

  /**
   * Returns true if there was keyboard movememnt
   * @return {Boolean}
   */
  hasKeyboardMovement() {
    return this.moveLeft || this.moveRight || this.moveUp || this.moveDown;
  }

  /**
   * Sets the ID of the player
   * @param {Number} id player ID
   */
  setId(id) {
    this.id = id;
  }

  /**
   * Loads the player's default (empty) equipment
   */
  loadEquipment() {
    this.armour = null;
    this.weapon = null;
    this.pendant = null;
    this.ring = null;
    this.boots = null;
  }

  /**
   * Returns true if the has a ranged weapon
   * @return {Boolean}
   */
  isRanged() {
    // @TODO try changing to // this.weapon && this.weapon.exists() && this.weapon.ranged;
    return this.weapon && this.weapon.ranged;
  }

  /**
   * Returns true if the player has a weapon
   * @return {Boolean}
   */
  hasWeapon() {
    return this.weapon ? this.weapon.exists() : false;
  }

  /**
   * Sets the name and username of the player
   * @param {String} name username of the player
   */
  setName(name) {
    // @TODO why do we need both of these??
    this.username = name;
    this.name = name;
  }

  /**
   * Gets the name of the sprite depending on their equipped armor
   * defaults to `clotharmor` if they don't have anything equipped
   * @return {String} sprite name for the character's armor
   */
  getSpriteName() {
    return this.armour
      ? this.armour.name
      : 'clotharmor';
  }

  /**
   * Set the player's current mana
   * @param {Number} mana amount
   */
  setMana(mana) {
    this.mana = mana;
  }

  /**
   * Set the player's maximum mana amount
   * @param {[type]} maxMana amount
   */
  setMaxMana(maxMana) {
    this.maxMana = maxMana;
  }

  /**
   * Get the player's grid X position
   * @return {Number} grid X position
   */
  getX() {
    return this.gridX;
  }

  /**
   * Get the player's grid Y position
   * @return {Number} grid Y position
   */
  getY() {
    return this.gridY;
  }

  /**
   * Set the player's health and mana from the server data
   * @param {Array} hitPointsData in the format of [ id, hitPoints, maxHitPoints ]
   * @param {Array} manaData      in the format of [ id, mana, maxMana ]
   */
  setPointsData(hitPointsData, manaData) {
    const hitPoints = hitPointsData.shift();
    const maxHitPoints = hitPointsData.shift();
    const mana = manaData.shift();
    const maxMana = manaData.shift();

    this.setHitPoints(hitPoints);
    this.setMana(mana);

    this.setMaxHitPoints(maxHitPoints);
    this.setMaxMana(maxMana);
  }

  /**
   * Set the player's equipment from the server
   * @param {Modules} type values from Modules.Equipment
   * @param {Array} info in the format of [ id, name, string, count, ability, abilityLevel ]
   */
  setEquipment(type, info) {
    const name = info.shift();
    const string = info.shift();
    const count = info.shift();
    const ability = info.shift();
    const abilityLevel = info.shift();

    switch (type) {
      case Module.Equipment.Armour:
        if (!this.armour) {
          this.armour = new Armour(
            name,
            string,
            count,
            ability,
            abilityLevel,
          );
        } else {
          this.armour.update(name, string, count, ability, abilityLevel);
        }

        if (this.updateArmourCallback) {
          this.updateArmourCallback(string);
        }

        break;

      case Module.Equipment.Weapon:
        if (!this.weapon) {
          this.weapon = new Weapon(
            name,
            string,
            count,
            ability,
            abilityLevel,
          );
        } else {
          this.weapon.update(name, string, count, ability, abilityLevel);
        }

        this.weapon.ranged = string && string.includes('bow');

        break;

      case Module.Equipment.Pendant:
        if (!this.pendant) {
          this.pendant = new Pendant(
            name,
            string,
            count,
            ability,
            abilityLevel,
          );
        } else {
          this.pendant.update(name, string, count, ability, abilityLevel);
        }

        break;

      case Module.Equipment.Ring:
        if (!this.ring) {
          this.ring = new Ring(name, string, count, ability, abilityLevel);
        } else {
          this.ring.update(name, string, count, ability, abilityLevel);
        }

        break;

      case Module.Equipment.Boots:
        if (!this.boots) {
          this.boots = new Boots(name, string, count, ability, abilityLevel);
        } else {
          this.boots.update(name, string, count, ability, abilityLevel);
        }

        break;
      default:
        break;
    }
  }

  /**
   * Unequip an item
   * @param  {String} type  type of equipment to remove
   */
  unequip(type) {
    switch (type) {
      case 'armour':
        this.armour.update('Cloth Armour', 'clotharmor', 1, -1, -1);
        break;

      case 'weapon':
        this.weapon.update(null, null, -1, -1, -1);
        break;

      case 'pendant':
        this.pendant.update(null, null, -1, -1, -1);
        break;

      case 'ring':
        this.ring.update(null, null, -1, -1, -1);
        break;

      case 'boots':
        this.boots.update(null, null, -1, -1, -1);
        break;
      default:
        break;
    }
  }

  /**
   * Temporary blink the entity
   */
  tempBlink() {
    this.blink(90);

    if (!this.tempBlinkTimeout) {
      this.tempBlinkTimeout = setTimeout(() => {
        this.stopBlinking();
      }, 500);
    }
  }

  /**
   * Set the callback for updating armour
   * @param  {Function} callback function to reset armor
   */
  onUpdateArmour(callback) {
    this.updateArmourCallback = callback;
  }
}
