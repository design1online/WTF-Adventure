import _ from 'underscore';
import Queue from '../utils/queue';
import Splat from '../renderer/infos/splat';
import Module from '../utils/modules';
import {
  isInt,
} from '../utils/util';

/**
 * Displays additional information on the screen as the game
 * is running. For instance, missing hits on another player,
 * regenerating health, and damage done with a {@link Splat}
 * @class
 */
export default class Info {
  /**
   * Default constructor
   * @param {Game} game instance of the game
   */
  constructor(game) {
    /**
    * An instance of the game
    * @type {Game}
    */
    this.game = game;

    /**
    * A collection of all the info entities
    * @type {Object}
    */
    this.infos = {};

    /**
    * A queue to destroy the entities over time
    * @type {Queue}
    */
    this.destroyQueue = new Queue();
  }

  /**
   * Create the informational entity
   * @param  {Modules} type Hits (damage, stun, critical, heal, mana, experience, levelup)
   * @param  {Object}  data  Data about the type of hit
   * @param  {Number}  x     X coordinate
   * @param  {Number}  y     Y coordinate
   */
  create(type, data, x, y) {
    switch (type) {
      case Module.Hits.Damage:
      case Module.Hits.Stun:
      case Module.Hits.Critical:
        this.hit(type, data, x, y);
        break;
      case Module.Hits.Heal:
      case Module.Hits.Mana:
      case Module.Hits.Experience:
        this.regenerate(type, data, x, y);
        break;
      case Module.Hits.LevelUp:
        this.levelup(type, x, y);
        break;
      default:
        break;
    }
  }

  /**
   * The hit has made contact with another entity
   * @param  {Modules} type The Hits type of {@link Splat}
   * @param  {Object}  data Damage and whether or not this isTarget
   * @param  {Number}  x    X coordinate
   * @param  {Number}  y    Y coordinate
   */
  hit(type, data, x, y) {
    let damage = data.shift();
    const isTarget = data.shift();
    const dId = this.generateId(damage, x, y);

    if (damage < 1 || !isInt(damage)) {
      damage = 'MISS';
    }

    const hitSplat = new Splat(dId, type, damage, x, y, false);

    const dColour = isTarget
      ? Module.DamageColours.received
      : Module.DamageColours.inflicted;

    hitSplat.setColours(dColour.fill, dColour.stroke);

    this.addInfo(hitSplat);
  }

  /**
   * Renerage health
   * @param  {Modules} type The Hits type of {@link Splat}
   * @param  {Object}  data Amount of health regeneration
   * @param  {Number}  x    X coordinate
   * @param  {Number}  y    Y coordinate
   */
  regenerate(type, data, x, y) {
    const amount = data.shift();
    const id = this.generateId(amount, x, y);
    let text = '+';
    let colour = null;

    if (amount < 1 || !isInt(amount)) {
      return;
    }

    if (type !== Module.Hits.Experience) {
      text = '++';
    }

    const splat = new Splat(id, type, text + amount, x, y, false);

    if (type === Module.Hits.Heal) {
      colour = Module.DamageColours.healed;
    } else if (type === Module.Hits.Mana) {
      colour = Module.DamageColours.mana;
    } else if (type === Module.Hits.Experience) {
      colour = Module.DamageColours.exp;
    }

    splat.setColours(colour.fill, colour.stroke);
    this.addInfo(splat);
  }

  /**
   * Level up
   * @param  {Modules} type The Hits type
   * @param  {Number}  x    X coordinate
   * @param  {Number}  y    Y coordinate
   */
  levelup(type, x, y) {
    const lId = this.generateId('-1', x, y);
    const levelSplat = new Splat(lId, type, 'Level Up!', x, y, false);
    const lColour = Module.DamageColours.exp;

    levelSplat.setColours(lColour.fill, lColour.stroke);
    this.addInfo(levelSplat);
  }

  /**
   * Returns the count of the number of info objects currently active
   * @return {Number} number of active info objects
   */
  getCount() {
    return Object.keys(this.infos).length;
  }

  /**
   * Add an info object to the destroyQueue
   * @param {Object} info An info object
   */
  addInfo(info) {
    this.infos[info.id] = info;

    info.onDestroy((id) => {
      this.destroyQueue.add(id);
    });
  }

  /**
   * Update each info object over time and destroy any in the destroyQueue
   * @param  {Number} time set the latest update time for each info
   */
  update(time) {
    this.forEachInfo((info) => {
      info.update(time);
    });

    this.destroyQueue.forEachQueue((id) => {
      delete this.infos[id];
    });

    this.destroyQueue.reset();
  }

  /**
   * Loop through each info and pass them to a callback
   * @param  {Function} callback Callback function
   */
  forEachInfo(callback) {
    _.each(this.infos, (info) => {
      callback(info);
    });
  }

  /**
   * Generate an ID for an info based on the game type, info Module.Hits and x,y coordinates
   * @param  {Modules} info The Hits type for this info entity
   * @param  {Number}  x    X coordinate
   * @param  {Number}  y    Y coordinate
   * @return {Number}  A generated ID number
   */
  generateId(info, x, y) {
    return `${this.game.time}${Math.abs(info)}${x}${y}`;
  }
}
