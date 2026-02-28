import Modules from '../../../../util/modules.js';
import Utils from '../../../../util/utils.js';

/**
 * Manages player warping between locations in the world
 * @class
 */
export default class Warp {
  /**
   * Default constructor
   * @param {Player} player the player who can use this warp system
   */
  constructor(player) {
    /**
     * The player who can use this warp system
     * @type {Player}
     */
    this.player = player;
    /**
     * The timestamp of the last warp performed
     * @type {Number}
     */
    this.lastWarp = 0;
    /**
     * The cooldown duration in milliseconds between warps
     * @type {Number}
     */
    this.warpTimeout = 300000;
  }

  /**
   * Warps the player to the destination corresponding to the given warp ID
   * @param {Number} id the warp ID to use from the Warps module
   */
  warp(id) {
    if (!this.canWarp()) {
      this.player.notify(
        `You must wait another ${this.getDuration()} to warp.`,
      );
      return;
    }

    const data = Modules.Warps[id];

    if (!data) {
      return;
    }

    const name = data[0];
    const x = data[3] ? data[1] + Utils.randomInt(0, 1) : data[1];
    const y = data[3] ? data[2] + Utils.randomInt(0, 1) : data[2];
    const levelRequirement = data[4];

    if (this.player.level < levelRequirement) {
      this.player.notify(
        `You must be at least level ${levelRequirement} to warp here!`,
      );
      return;
    }

    this.player.teleport(x, y, false, true);
    this.player.notify(`You have been warped to ${name}`);
    this.lastWarp = new Date().getTime();
  }

  /**
   * Sets the last warp timestamp, resetting to 0 if the value is invalid
   * @param {Number} lastWarp the timestamp of the last warp
   */
  setLastWarp(lastWarp) {
    if (isNaN(lastWarp)) {
      this.lastWarp = 0;
      this.player.save();
    } else this.lastWarp = lastWarp;
  }

  /**
   * Returns whether the player is currently allowed to warp
   * @return {Boolean}
   */
  canWarp() {
    return this.getDifference() > this.warpTimeout || this.player.rights > 1;
  }

  /**
   * Returns a human-readable string of the remaining warp cooldown duration
   * @return {String}
   */
  getDuration() {
    const difference = this.warpTimeout - this.getDifference();

    if (!difference) {
      return '5 minutes';
    }

    return difference > 60000
      ? `${Math.ceil(difference / 60000)} minutes`
      : `${Math.floor(difference / 1000)} seconds`;
  }

  /**
   * Returns the elapsed time in milliseconds since the last warp
   * @return {Number}
   */
  getDifference() {
    return new Date().getTime() - this.lastWarp;
  }
}
