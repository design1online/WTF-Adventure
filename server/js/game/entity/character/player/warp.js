import Modules from '../../../../util/modules.js';
import Utils from '../../../../util/utils.js';

export default class Warp {
  constructor(player) {
    this.player = player;
    this.lastWarp = 0;
    this.warpTimeout = 300000;
  }

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

  setLastWarp(lastWarp) {
    if (isNaN(lastWarp)) {
      this.lastWarp = 0;
      this.player.save();
    } else this.lastWarp = lastWarp;
  }

  canWarp() {
    return this.getDifference() > this.warpTimeout || this.player.rights > 1;
  }

  getDuration() {
    const difference = this.warpTimeout - this.getDifference();

    if (!difference) {
      return '5 minutes';
    }

    return difference > 60000
      ? `${Math.ceil(difference / 60000)} minutes`
      : `${Math.floor(difference / 1000)} seconds`;
  }

  getDifference() {
    return new Date().getTime() - this.lastWarp;
  }
}
